import type { System, UpdateArgs } from './Systems';
import type { Entity } from '../utils/ecsUtils';
import { ComponentType } from '../components/ComponentTypes';
import {
  addEntities,
  getEntitiesWithComponents,
  getEntity,
  removeEntities,
  removeEntity,
  replaceEntity
} from '../utils/EntityUtils';
import {
  getComponentAbsolute,
  getComponentIfExists,
  removeComponent,
  setComponent
} from '../components/ComponentOperations';
import {
  type InteractionBehaviorComponent,
  InteractionBehaviorType,
  PositionComponent,
  SpriteComponent,
  type UsableItemComponent
} from '../components';
import { createEntitiesFromTemplates, createEntity } from '../utils/EntityFactory';
import { getAdjacentPosition } from '../map/MappingUtils';

/**
 * ItemInteractionSystem handles interactions between entities that require items
 * and entities that provide usable items. It processes capability matching,
 * item consumption, and interaction behaviors.
 */
export class ItemInteractionSystem implements System {
  update({ entities }: UpdateArgs): void {
    const interactingEntitiesCarryingItem = getEntitiesWithComponents(
      [
        ComponentType.Interacting,
        ComponentType.CarriedItem,
        ComponentType.Position,
      ],
      entities,
    );
    const allInteractableEntities = getEntitiesWithComponents([
      ComponentType.RequiresItem,
      ComponentType.InteractionBehavior,
      ComponentType.Position,
    ], entities);

    for (const interactingEntity of interactingEntitiesCarryingItem) {
      const carriedItemId = getComponentAbsolute(
        interactingEntity,
        ComponentType.CarriedItem,
      ).item;
      const carriedItemEntity = getEntity(carriedItemId);

      if (!carriedItemEntity) {
        console.error(`Carried item entity with ID ${carriedItemId} not found`);
        continue;
      }

      const usableItemComponent = getComponentIfExists(
        carriedItemEntity,
        ComponentType.UsableItem,
      );

      // If the carried item is not usable, skip further processing
      if (!usableItemComponent) {
        continue;
      }

      const compatibleEntities = this.findCompatibleEntities(
        usableItemComponent.capabilities,
        allInteractableEntities,
      );

      for (const compatibleEntity of compatibleEntities) {
        if (
          !this.approachingFromCorrectPositionAndDirection(
            interactingEntity,
            compatibleEntity,
          )
        ) {
          continue;
        }

        this.processInteraction(compatibleEntity, entities);
        this.handleItemConsumption(
          interactingEntity,
          carriedItemEntity,
          usableItemComponent,
        );
        removeComponent(interactingEntity, ComponentType.Interacting);
      }
    }
  }

  private findCompatibleEntities(
    capabilities: string[],
    interactableEntities: Entity[],
  ) {
    return interactableEntities.filter((entity) => {
      const requiresItemComponent = getComponentAbsolute(
        entity,
        ComponentType.RequiresItem,
      );

      return requiresItemComponent.requiredCapabilities.every(
        (requiredCapability) => capabilities.includes(requiredCapability),
      );
    });
  }

  private approachingFromCorrectPositionAndDirection(
    interactingEntity: Entity,
    targetEntity: Entity,
  ): boolean {
    const requiresItemComponent = getComponentAbsolute(
      targetEntity,
      ComponentType.RequiresItem,
    );

    const targetEntityPosition = getComponentAbsolute(
      targetEntity,
      ComponentType.Position,
    );

    const permittedPositions = requiresItemComponent.interactionDirections.map(
      (direction) => getAdjacentPosition(targetEntityPosition, direction),
    );

    const interactingEntityPosition = getComponentAbsolute(
      interactingEntity,
      ComponentType.Position,
    );

    if (
      !permittedPositions.some(
        (pos) =>
          pos.x === interactingEntityPosition.x &&
          pos.y === interactingEntityPosition.y,
      )
    ) {
      return false;
    }

    const interactingEntitiesDirection = getComponentIfExists(
      interactingEntity,
      ComponentType.Direction,
    );

    if (interactingEntitiesDirection) {
      // If the interacting entity has a DirectionComponent, require the entity to be facing the target entity
      const facingPosition = getAdjacentPosition(
        interactingEntityPosition,
        interactingEntitiesDirection.direction,
      );
      return (
        facingPosition.x === targetEntityPosition.x &&
        facingPosition.y === targetEntityPosition.y
      );
    } else {
      // If the interacting entity does not have a DirectionComponent, assume it can interact from any direction
      return true;
    }
  }

  /**
   * Processes the interaction behavior for a target entity based on its InteractionBehaviorComponent.
   */
  private processInteraction(targetEntity: Entity, entities: Entity[]): void {
    const interactionBehaviorComponent = getComponentIfExists(
      targetEntity,
      ComponentType.InteractionBehavior,
    );

    if (!interactionBehaviorComponent) {
      throw new Error('InteractionBehaviorComponent not found on usable item');
    }

    switch (interactionBehaviorComponent.behaviorType) {
      case InteractionBehaviorType.TRANSFORM:
        this.processBehaviorTransform(
          targetEntity,
          interactionBehaviorComponent,
        );
        break;

      case InteractionBehaviorType.REMOVE:
        this.processBehaviorRemove(targetEntity);
        break;

      case InteractionBehaviorType.SPAWN_CONTENTS:
        this.processBehaviorSpawnContents(targetEntity, entities);
        break;

      default:
        throw new Error(
          `Unknown interaction behavior type: ${interactionBehaviorComponent.behaviorType}`,
        );
    }
  }

  /**
   * Handles TRANSFORM behavior - Replaces the target entity with a new entity
   */
  private processBehaviorTransform(
    targetEntity: Entity,
    behaviorComponent: InteractionBehaviorComponent,
  ): void {
    if (!behaviorComponent.newSpriteId) {
      throw new Error('newSpriteId is required for TRANSFORM behavior');
    }

    const replacementEntity = createEntity(
      Object.values(targetEntity.components),
    );
    replaceEntity(targetEntity.id, replacementEntity);

    setComponent(
      replacementEntity,
      new SpriteComponent({ sprite: behaviorComponent.newSpriteId }),
    );
    removeComponent(replacementEntity, ComponentType.RequiresItem);
    removeComponent(replacementEntity, ComponentType.InteractionBehavior);
  }

  /**
   * Handles REMOVE behavior - removes entity from game world.
   */
  private processBehaviorRemove(targetEntity: Entity): void {
    removeEntity(targetEntity.id);
  }

  /**
   * Handles SPAWN_CONTENTS behavior - removes entity and creates new entities from SpawnContentsComponent.
   */
  private processBehaviorSpawnContents(
    targetEntity: Entity,
    _entities: Entity[],
  ): void {
    const spawnComponent = getComponentIfExists(
      targetEntity,
      ComponentType.SpawnContents,
    );

    if (!spawnComponent) {
      throw new Error(
        `Cannot spawn contents: target entity has no SpawnContentsComponent`,
      );
    }

    const targetPosition = getComponentIfExists(
      targetEntity,
      ComponentType.Position,
    );
    if (!targetPosition) {
      throw new Error(
        `Cannot spawn contents: target entity has no PositionComponent`,
      );
    }

    const spawnOffset = spawnComponent.spawnOffset || { x: 0, y: 0 };
    const spawnPosition = {
      x: targetPosition.x + spawnOffset.x,
      y: targetPosition.y + spawnOffset.y,
    };

    const newEntities = createEntitiesFromTemplates(...spawnComponent.contents);
    addEntities(newEntities);

    newEntities.forEach((entity, index) => {
      const offsetIndex = Math.floor(index / 2);
      const position = new PositionComponent({
        x: spawnPosition.x + offsetIndex,
        y: spawnPosition.y + (index % 2),
      });
      setComponent(entity, position);
    });

    removeEntity(targetEntity.id);
  }

  /**
   * Handles item consumption logic after successful interaction.
   */
  private handleItemConsumption(
    interactingEntity: Entity,
    usedItem: Entity,
    usableItemComponent: UsableItemComponent,
  ): void {
    if (usableItemComponent.isConsumable) {
      const carriedItemComponent = getComponentIfExists(
        interactingEntity,
        ComponentType.CarriedItem,
      );

      if (carriedItemComponent && carriedItemComponent.item === usedItem.id) {
        removeComponent(interactingEntity, ComponentType.CarriedItem);
        removeEntities([usedItem.id]);
      } else {
        console.error(
          'Warning: Carried item component not found or item ID mismatch during consumption',
        );
      }
    }
  }
}

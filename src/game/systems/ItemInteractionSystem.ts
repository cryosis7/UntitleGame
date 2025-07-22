import type { System, UpdateArgs } from './Systems';
import type { Entity } from '../utils/ecsUtils';
import { ComponentType } from '../components/ComponentTypes';
import {
  getEntitiesWithComponents,
  removeEntities,
  addEntities,
} from '../utils/EntityUtils';
import {
  getComponentIfExists,
  setComponent,
  removeComponent,
} from '../components/ComponentOperations';
import type { InteractionBehaviorComponent } from '../components/individualComponents/InteractionBehaviorComponent';
import { InteractionBehaviorType } from '../components/individualComponents/InteractionBehaviorType';
import { createEntitiesFromTemplates } from '../utils/EntityFactory';
import { PositionComponent } from '../components/individualComponents/PositionComponent';

/**
 * ItemInteractionSystem handles interactions between entities that require items
 * and entities that provide usable items. It processes capability matching,
 * item consumption, and interaction behaviors.
 */
export class ItemInteractionSystem implements System {
  update(args: UpdateArgs): void {
    const { entities } = args;
    this.processInteractions(entities);
  }

  /**
   * Processes all active interactions between entities.
   */
  private processInteractions(entities: Entity[]): void {
    const interactingEntities = getEntitiesWithComponents(
      [ComponentType.Interacting],
      entities,
    );

    for (const entity of interactingEntities) {
      const requiresItemEntities = this.findRequiredItemEntities(
        entities,
        entity,
      );

      for (const requiredEntity of requiresItemEntities) {
        this.validateCapabilities(entity, requiredEntity, entities);
      }
    }
  }

  /**
   * Finds entities that require items and are at the same position as the interacting entity.
   */
  private findRequiredItemEntities(
    entities: Entity[],
    interactingEntity: Entity,
  ): Entity[] {
    const interactingPosition = getComponentIfExists(
      interactingEntity,
      ComponentType.Position,
    );

    if (!interactingPosition) {
      console.log('Interacting entity does not have Position component');
      return [];
    }

    return getEntitiesWithComponents(
      [ComponentType.RequiresItem],
      entities,
    ).filter((entity) => {
      const requiresComponent = getComponentIfExists(
        entity,
        ComponentType.RequiresItem,
      );
      if (!requiresComponent?.isActive) return false;

      const entityPosition = getComponentIfExists(
        entity,
        ComponentType.Position,
      );
      if (!entityPosition) return false;

      return (
        entityPosition.x === interactingPosition.x &&
        entityPosition.y === interactingPosition.y
      );
    });
  }

  /**
   * Validates that the interacting entity has items with capabilities that match
   * the requirements of the target entity.
   */
  private validateCapabilities(
    interactingEntity: Entity,
    requiredEntity: Entity,
    entities: Entity[],
  ): void {
    const requiresComponent = getComponentIfExists(
      requiredEntity,
      ComponentType.RequiresItem,
    );
    if (!requiresComponent?.isActive) return;

    const compatibleItem = this.findCompatibleItem(
      interactingEntity,
      requiresComponent.requiredCapabilities,
      entities,
    );

    if (compatibleItem) {
      console.log(
        `Compatible item found for interaction: ${compatibleItem.id} with capabilities matching ${requiresComponent.requiredCapabilities.join(', ')}`,
      );

      this.processBehavior(requiredEntity, compatibleItem, entities);
      this.handleItemConsumption(interactingEntity, compatibleItem);
    }
  }

  /**
   * Finds a compatible item in the player's inventory that has the required capabilities.
   */
  private findCompatibleItem(
    interactingEntity: Entity,
    requiredCapabilities: string[],
    entities: Entity[],
  ): Entity | null {
    const carriedItemComponent = getComponentIfExists(
      interactingEntity,
      ComponentType.CarriedItem,
    );

    if (!carriedItemComponent) {
      console.log('No carried items found for interaction');
      return null;
    }

    const carriedItemEntity = entities.find(
      (entity) => entity.id === carriedItemComponent.item,
    );

    if (!carriedItemEntity) {
      console.log('Carried item entity not found in entities array');
      return null;
    }

    const usableComponent = getComponentIfExists(
      carriedItemEntity,
      ComponentType.UsableItem,
    );

    if (!usableComponent) {
      console.log('Carried item does not have UsableItem component');
      return null;
    }

    const hasMatchingCapability = usableComponent.capabilities.some(
      (capability) => requiredCapabilities.includes(capability),
    );

    if (hasMatchingCapability) {
      console.log(
        `Found compatible item with matching capabilities: ${usableComponent.capabilities.filter((cap) => requiredCapabilities.includes(cap)).join(', ')}`,
      );
      return carriedItemEntity;
    }

    console.log(
      'No compatible capabilities found between carried item and requirements',
    );
    return null;
  }

  /**
   * Processes the interaction behavior for a target entity based on its InteractionBehaviorComponent.
   */
  private processBehavior(
    targetEntity: Entity,
    compatibleItem: Entity,
    entities: Entity[],
  ): void {
    const behaviorComponent = getComponentIfExists(
      targetEntity,
      ComponentType.InteractionBehavior,
    );

    if (!behaviorComponent) {
      console.log('Target entity does not have InteractionBehavior component');
      return;
    }

    console.log(
      `Processing behavior: ${behaviorComponent.behaviorType} for entity ${targetEntity.id}`,
    );

    switch (behaviorComponent.behaviorType) {
      case InteractionBehaviorType.TRANSFORM:
        this.processBehaviorTransform(targetEntity, behaviorComponent);
        break;

      case InteractionBehaviorType.REMOVE:
        this.processBehaviorRemove(targetEntity);
        break;

      case InteractionBehaviorType.SPAWN_CONTENTS:
        this.processBehaviorSpawnContents(targetEntity, entities);
        break;

      default:
        console.log(`Unknown behavior type: ${behaviorComponent.behaviorType}`);
    }
  }

  /**
   * Handles TRANSFORM behavior - updates sprite and deactivates RequiresItem component.
   */
  private processBehaviorTransform(
    targetEntity: Entity,
    behaviorComponent: InteractionBehaviorComponent,
  ): void {
    if (behaviorComponent.newSpriteId) {
      const spriteComponent = getComponentIfExists(
        targetEntity,
        ComponentType.Sprite,
      );
      if (spriteComponent) {
        (spriteComponent.sprite as any).texture = {
          label: behaviorComponent.newSpriteId,
        };
        console.log(
          `Transformed entity sprite to: ${behaviorComponent.newSpriteId}`,
        );
      } else {
        console.log(
          'Warning: Entity does not have Sprite component for TRANSFORM behavior',
        );
      }
    }

    const requiresComponent = getComponentIfExists(
      targetEntity,
      ComponentType.RequiresItem,
    );
    if (requiresComponent) {
      requiresComponent.isActive = false;
      console.log('Deactivated RequiresItem component after transformation');
    }
  }

  /**
   * Handles REMOVE behavior - removes entity from game world.
   */
  private processBehaviorRemove(targetEntity: Entity): void {
    console.log(`Removing entity ${targetEntity.id} from game world`);
    removeEntities([targetEntity.id]);
  }

  /**
   * Handles SPAWN_CONTENTS behavior - removes entity and creates new entities from SpawnContentsComponent.
   */
  private processBehaviorSpawnContents(
    targetEntity: Entity,
    entities: Entity[],
  ): void {
    const spawnComponent = getComponentIfExists(
      targetEntity,
      ComponentType.SpawnContents,
    );

    if (!spawnComponent) {
      console.log(
        'Warning: Entity has SPAWN_CONTENTS behavior but no SpawnContentsComponent',
      );
      return;
    }

    const targetPosition = getComponentIfExists(
      targetEntity,
      ComponentType.Position,
    );
    if (!targetPosition) {
      console.log(
        'Warning: Cannot spawn contents - target entity has no Position component',
      );
      return;
    }

    const spawnOffset = spawnComponent.spawnOffset || { x: 0, y: 0 };
    const spawnPosition = {
      x: targetPosition.x + spawnOffset.x,
      y: targetPosition.y + spawnOffset.y,
    };

    console.log(
      `Spawning ${spawnComponent.contents.length} entities at position (${spawnPosition.x}, ${spawnPosition.y})`,
    );

    const newEntities = createEntitiesFromTemplates(...spawnComponent.contents);

    newEntities.forEach((entity, index) => {
      const offsetIndex = Math.floor(index / 2);
      const position = new PositionComponent({
        x: spawnPosition.x + offsetIndex,
        y: spawnPosition.y + (index % 2),
      });
      setComponent(entity, position);
    });

    addEntities(newEntities);

    console.log(
      `Removing original entity ${targetEntity.id} after spawning contents`,
    );
    removeEntities([targetEntity.id]);
  }

  /**
   * Handles item consumption logic after successful interaction.
   */
  private handleItemConsumption(
    interactingEntity: Entity,
    usedItem: Entity,
  ): void {
    const usableComponent = getComponentIfExists(
      usedItem,
      ComponentType.UsableItem,
    );

    if (!usableComponent) {
      console.log('Warning: Used item does not have UsableItem component');
      return;
    }

    console.log(
      `Processing item consumption for ${usedItem.id}, consumable: ${usableComponent.isConsumable}`,
    );

    if (usableComponent.isConsumable) {
      const carriedItemComponent = getComponentIfExists(
        interactingEntity,
        ComponentType.CarriedItem,
      );

      if (carriedItemComponent && carriedItemComponent.item === usedItem.id) {
        console.log(
          `Removing consumable item ${usedItem.id} from player inventory`,
        );

        removeComponent(interactingEntity, ComponentType.CarriedItem);
        removeEntities([usedItem.id]);

        console.log(
          `Consumable item ${usedItem.id} has been consumed and removed from game`,
        );
      } else {
        console.log(
          'Warning: Carried item component not found or item ID mismatch during consumption',
        );
      }
    } else {
      console.log(
        `Retaining non-consumable item ${usedItem.id} in player inventory for future use`,
      );
    }
  }
}

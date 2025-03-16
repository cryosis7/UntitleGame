import type { System, UpdateArgs } from './Systems';
import {
  ComponentType,
  type PositionComponent,
  type SpriteComponent,
} from '../components/Components';
import { pixiApp } from '../Pixi';
import {
  getComponentAbsolute,
  getComponentIfExists,
} from '../utils/ComponentUtils';
import type { Entity } from '../utils/ecsUtils';
import type { GameMap, Position } from '../map/GameMap';
import type { Container } from 'pixi.js';
import { gridToScreenAsTuple } from '../map/MappingUtils';

export class RenderSystem implements System {
  private renderedEntities = new Set<string>();
  private renderedMap = false;

  update({ entities, map }: UpdateArgs) {
    if (map && map.hasChanged) {
      this.updateMap(map);
      map.hasChanged = false;
    }

    this.updateStage(entities);
    entities.filter((entity) => this.renderedEntities.has(entity.id));
    this.updatePositions(entities);
  }

  private updateMap = (map: GameMap) => {
    if (!this.renderedMap) {
      this.addContainerToStage(map.getSpriteContainer(), { x: 0, y: 0 });
      this.renderedMap = true;
    }

    map.getAllEntities().forEach((entity) => {
      const spriteComponent = getComponentAbsolute<SpriteComponent>(
        entity,
        ComponentType.Sprite,
      );
      const positionComponent = getComponentAbsolute<PositionComponent>(
        entity,
        ComponentType.Position,
      );

      spriteComponent.sprite.position.set(
        ...gridToScreenAsTuple(positionComponent),
      );
    });
  };

  /**
   * Updates the positions of the entities' sprites based on their PositionComponent.
   * @param entities - The array of entities to update positions for.
   */
  private updatePositions = (entities: Entity[]) => {
    this.renderedEntities.forEach((entityId) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;

      const spriteComponent = getComponentAbsolute<SpriteComponent>(
        entity,
        ComponentType.Sprite,
      );
      const positionComponent = getComponentAbsolute<PositionComponent>(
        entity,
        ComponentType.Position,
      );

      spriteComponent.sprite.position.set(
        ...gridToScreenAsTuple(positionComponent),
      );
    });
  };

  /**
   * Updates the stage by adding or removing sprites based on their components.
   * @param entities - The array of entities to update the stage for.
   */
  private updateStage = (entities: Entity[]) => {
    entities.forEach((entity) => {
      const spriteComponent = getComponentIfExists<SpriteComponent>(
        entity,
        ComponentType.Sprite,
      );
      if (!spriteComponent) {
        return;
      }

      const positionComponent = getComponentIfExists<PositionComponent>(
        entity,
        ComponentType.Position,
      );

      if (
        this.shouldAddToStage(entity.id, spriteComponent, positionComponent)
      ) {
        this.addContainerToStage(spriteComponent.sprite, positionComponent!);
        this.renderedEntities.add(entity.id);
      } else if (
        this.shouldRemoveFromStage(
          entity.id,
          spriteComponent,
          positionComponent,
        )
      ) {
        pixiApp.stage.removeChild(spriteComponent.sprite);
        this.renderedEntities.delete(entity.id);
      }
    });
  };

  /**
   * Adds a container to the Pixi stage at the specified position and size.
   * @param container - The Pixi container to add to the stage.
   * @param position - The position to place the container at.
   */
  private addContainerToStage = (container: Container, position: Position) => {
    container.position.set(...gridToScreenAsTuple(position));
    pixiApp.stage.addChild(container);
  };

  /**
   * Determines whether an entity needs to be added to the pixi stage
   * @param entityId
   * @param spriteComponent
   * @param positionComponent
   * @private
   */
  private shouldAddToStage = (
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) => {
    return (
      spriteComponent !== undefined &&
      positionComponent !== undefined &&
      !this.renderedEntities.has(entityId)
    );
  };

  /**
   * Determines whether an entity needs to be removed from the pixi stage
   * @param entityId
   * @param spriteComponent
   * @param positionComponent
   * @private
   */
  private shouldRemoveFromStage = (
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) => {
    return (
      spriteComponent &&
      !positionComponent &&
      this.renderedEntities.has(entityId)
    );
  };
}

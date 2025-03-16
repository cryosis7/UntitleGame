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
  private renderedEntities = new Set<{ id: string; container: Container }>();
  private renderedMap = false;

  update({ entities, map }: UpdateArgs) {
    if (map && map.hasChanged) {
      this.updateMap(map);
      map.hasChanged = false;
    }

    this.updateStage(entities);
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

  private updatePositions = (entities: Entity[]) => {
    this.renderedEntities.forEach((item) => {
      const entity = entities.find((e) => e.id === item.id);
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

  private updateStage = (entities: Entity[]) => {
    entities.forEach((entity) => {
      const spriteComponent = getComponentIfExists<SpriteComponent>(
        entity,
        ComponentType.Sprite,
      );

      const positionComponent = getComponentIfExists<PositionComponent>(
        entity,
        ComponentType.Position,
      );

      if (
        this.shouldAddToStage(entity.id, spriteComponent, positionComponent)
      ) {
        this.addContainerToStage(spriteComponent!.sprite, positionComponent!);
        this.renderedEntities.add({
          id: entity.id,
          container: spriteComponent!.sprite,
        });
      } else if (
        this.shouldRemoveFromStage(
          entity.id,
          spriteComponent,
          positionComponent,
        )
      ) {
        const item = this.renderedEntities
          .values()
          .find((item) => item.id === entity.id);
        if (item) {
          pixiApp.stage.removeChild(item.container);
          this.renderedEntities.delete(item);
        }
      }
    });

    const itemsToDelete: { id: string; container: Container }[] = [];
    this.renderedEntities.forEach((item) => {
      if (!entities.some((e) => e.id === item.id)) {
        pixiApp.stage.removeChild(item.container);
        itemsToDelete.push(item);
      }
    });
    itemsToDelete.forEach((item) => this.renderedEntities.delete(item));
  };

  private addContainerToStage = (container: Container, position: Position) => {
    container.position.set(...gridToScreenAsTuple(position));
    pixiApp.stage.addChild(container);
  };

  private shouldAddToStage = (
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) => {
    return (
      spriteComponent !== undefined &&
      positionComponent !== undefined &&
      !Array.from(this.renderedEntities).some((item) => item.id === entityId)
    );
  };

  private shouldRemoveFromStage = (
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) => {
    return (
      spriteComponent &&
      !positionComponent &&
      Array.from(this.renderedEntities).some((item) => item.id === entityId)
    );
  };
}

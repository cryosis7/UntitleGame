import type { System, UpdateArgs } from './Systems';
import {
  ComponentType,
  type PositionComponent,
  type SpriteComponent,
} from '../components/Components';
import {
  getComponentAbsolute,
  getComponentIfExists,
} from '../utils/ComponentUtils';
import type { Entity } from '../utils/ecsUtils';
import type { GameMap, Position } from '../map/GameMap';
import type { Container } from 'pixi.js';
import { gridToScreenAsTuple } from '../map/MappingUtils';
import { pixiApp } from '../Pixi';

export class RenderSystem implements System {
  private renderedEntities = new Set<{ id: string; container: Container }>();
  private renderedMap = false;

  update({ entities, map }: UpdateArgs) {
    if (map.hasChanged) {
      this.updateMap(map);
      map.hasChanged = false;
    }

    this.updateStage(entities, map.getSpriteContainer());
    this.updatePositions(entities);
  }

  private updateMap = (map: GameMap) => {
    if (!this.renderedMap) {
      this.stageContainer(
        map.getSpriteContainer(),
        { x: 0, y: 0 },
        pixiApp.stage,
      );
      this.renderedMap = true;
    }

    map.getAllEntities().forEach((entity) => {
      const spriteComponent = getComponentAbsolute(
        entity,
        ComponentType.Sprite,
      );
      const positionComponent = getComponentAbsolute(
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

      const spriteComponent = getComponentAbsolute(
        entity,
        ComponentType.Sprite,
      );
      const positionComponent = getComponentAbsolute(
        entity,
        ComponentType.Position,
      );

      spriteComponent.sprite.position.set(
        ...gridToScreenAsTuple(positionComponent),
      );
    });
  };

  private updateStage = (entities: Entity[], stage: Container) => {
    entities.forEach((entity) => {
      const spriteComponent = getComponentIfExists(
        entity,
        ComponentType.Sprite,
      );

      const positionComponent = getComponentIfExists(
        entity,
        ComponentType.Position,
      );

      if (
        this.shouldAddToStage(entity.id, spriteComponent, positionComponent)
      ) {
        this.stageContainer(spriteComponent!.sprite, positionComponent!, stage);
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
          stage.removeChild(item.container);
          this.renderedEntities.delete(item);
        }
      }
    });

    const itemsToDelete: { id: string; container: Container }[] = [];
    this.renderedEntities.forEach((item) => {
      if (!entities.some((e) => e.id === item.id)) {
        stage.removeChild(item.container);
        itemsToDelete.push(item);
      }
    });
    itemsToDelete.forEach((item) => this.renderedEntities.delete(item));
  };

  private stageContainer = (
    container: Container,
    position: Position,
    stage: Container,
  ) => {
    container.position.set(...gridToScreenAsTuple(position));
    stage.addChild(container);
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

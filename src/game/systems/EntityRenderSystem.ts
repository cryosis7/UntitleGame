import type { Entity } from '../utils/ecsUtils';
import {
  getComponentAbsolute,
  getComponentIfExists,
} from '../components/ComponentOperations';
import { ComponentType } from '../components/ComponentTypes';
import type { Container, Sprite } from 'pixi.js';
import { RenderSystem } from './RenderSystem';
import type { SpriteComponent } from '../components/individualComponents/SpriteComponent';
import type { PositionComponent } from '../components/individualComponents/PositionComponent';

export class EntityRenderSystem {
  private renderedEntities: { [id: string]: Sprite } = {};

  update(entities: Entity[], parent: Container) {
    this.updateStage(entities, parent);
    this.updatePositions(entities);
  }

  private updateStage(entities: Entity[], parent: Container) {
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
        const sprite = RenderSystem.createSprite(spriteComponent!.sprite);
        RenderSystem.addToScreen(sprite, positionComponent!, parent);
        this.renderedEntities[entity.id] = sprite;
      } else if (
        this.shouldRemoveFromStage(
          entity.id,
          spriteComponent,
          positionComponent,
        )
      ) {
        parent.removeChild(this.renderedEntities[entity.id]);
        delete this.renderedEntities[entity.id];
      }
    });

    Object.entries(this.renderedEntities).forEach(([id, sprite]) => {
      if (!entities.some((e) => e.id === id)) {
        parent.removeChild(sprite);
        delete this.renderedEntities[id];
      }
    });
  }

  private updatePositions(entities: Entity[]) {
    Object.entries(this.renderedEntities).forEach(([id, sprite]) => {
      const entity = entities.find((e) => e.id === id);
      if (!entity) return;

      const positionComponent = getComponentAbsolute(
        entity,
        ComponentType.Position,
      );
      RenderSystem.setPosition(sprite, positionComponent);
    });
  }

  private shouldAddToStage(
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) {
    return (
      spriteComponent !== undefined &&
      positionComponent !== undefined &&
      this.renderedEntities[entityId] === undefined
    );
  }

  private shouldRemoveFromStage(
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) {
    return (
      spriteComponent &&
      !positionComponent &&
      this.renderedEntities[entityId] !== undefined
    );
  }
}

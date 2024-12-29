import type { System, UpdateArgs } from './Systems';
import {
  ComponentType,
  type PositionComponent,
  type SpriteComponent,
} from '../components/Components';
import { pixiApp } from '../Pixi';
import { getComponent } from '../utils/ComponentUtils';

export class RenderSystem implements System {
  private renderedEntities = new Set<string>();

  /**
   * Add a sprite to the stage if it has a SpriteComponent and a PositionComponent
   * @param entityId
   * @param spriteComponent
   * @param positionComponent
   * @private
   */
  private shouldAddToStage(
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) {
    return (
      spriteComponent !== undefined &&
      positionComponent !== undefined &&
      !this.renderedEntities.has(entityId)
    );
  }

  /**
   * Remove a sprite from the stage if it has a SpriteComponent but no PositionComponent
   * @param entityId
   * @param spriteComponent
   * @param positionComponent
   * @private
   */
  private shouldRemoveFromStage(
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) {
    return (
      spriteComponent &&
      !positionComponent &&
      this.renderedEntities.has(entityId)
    );
  }

  addSpriteToStage(
    spriteComponent: SpriteComponent,
    positionComponent: PositionComponent,
  ) {
    const stage = pixiApp.stage;

    spriteComponent.sprite.position.set(
      positionComponent.x * (pixiApp.screen.width / 10),
      positionComponent.y * (pixiApp.screen.height / 10),
    );
    stage.addChild(spriteComponent.sprite);
  }

  update({ entities }: UpdateArgs) {
    const stage = pixiApp.stage;

    // Add new sprites to the stage
    entities.forEach((entity) => {
      const spriteComponent = getComponent<SpriteComponent>(
        entity,
        ComponentType.Sprite,
      );
      if (!spriteComponent) {
        return;
      }

      const positionComponent = getComponent<PositionComponent>(
        entity,
        ComponentType.Position,
      );

      if (this.shouldAddToStage(entity.id, spriteComponent, positionComponent)) {
        this.addSpriteToStage(spriteComponent, positionComponent!);
        this.renderedEntities.add(entity.id);
      } else if (this.shouldRemoveFromStage(entity.id, spriteComponent, positionComponent)) {
        stage.removeChild(spriteComponent.sprite);
        this.renderedEntities.delete(entity.id);
      }
    });

    // Update positions of existing sprites
    this.renderedEntities.forEach((entityId) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;

      const spriteComponent = getComponent<SpriteComponent>(
        entity,
        ComponentType.Sprite,
      );
      const positionComponent = getComponent<PositionComponent>(
        entity,
        ComponentType.Position,
      );

      if (spriteComponent && positionComponent) {
        spriteComponent.sprite.position.set(
          positionComponent.x * (pixiApp.screen.width / 10),
          positionComponent.y * (pixiApp.screen.height / 10),
        );
      }
    });
  }
}

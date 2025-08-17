import type { UpdateArgs } from '../Framework/Systems';
import { getComponentIfExists } from '../../components/ComponentOperations';
import { ComponentType } from '../../components';
import { BaseRenderSystem } from './BaseRenderSystem';
import type { Container } from 'pixi.js';
import { Graphics } from 'pixi.js';
import type { Entity } from '../../utils/ecsUtils';
import type { InterfaceConfig } from '../../utils/Atoms';
import { gridToScreenAsTuple } from '../../map/MappingUtils';

export class HoverHighlightRenderSystem extends BaseRenderSystem {
  constructor() {
    super('game');
  }

  update({ entities }: UpdateArgs) {
    const hoverEntities = entities.filter((entity) => {
      const renderComponent = getComponentIfExists(
        entity,
        ComponentType.Render,
      );
      const hoverComponent = getComponentIfExists(
        entity,
        ComponentType.HoverHighlight,
      );

      return (
        renderComponent?.section === 'game' &&
        hoverComponent !== undefined
      );
    });

    this.updateHoverHighlightEntities(hoverEntities);
  }

  private updateHoverHighlightEntities(entities: Entity[]) {
    for (const entity of entities) {
      const hoverComponent = getComponentIfExists(
        entity,
        ComponentType.HoverHighlight,
      );
      const positionComponent = getComponentIfExists(
        entity,
        ComponentType.Position,
      );

      if (!hoverComponent || !positionComponent) {
        continue;
      }

      let sprite = this.getExistingSprite(entity.id);

      if (!sprite && hoverComponent.isVisible) {
        sprite = this.createHighlightSprite();
        this.addSpriteToStage(entity.id, sprite);
      }

      if (sprite) {
        sprite.visible = hoverComponent.isVisible;
        if (hoverComponent.isVisible) {
          sprite.position.set(
            ...gridToScreenAsTuple(positionComponent, this.interfaceConfig),
          );
        }
      }
    }
  }

  private createHighlightSprite(): Graphics {
    const graphics = new Graphics();
    const tileSize = this.interfaceConfig.tileSize;
    
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.beginFill(0xffffff, 0.2);
    graphics.drawRect(0, 0, tileSize, tileSize);
    graphics.endFill();
    
    return graphics;
  }

  private getExistingSprite(entityId: string): Container | undefined {
    return this.stage.children.find(child => 
      (child as any).__entityId === entityId
    ) as Container | undefined;
  }

  private addSpriteToStage(entityId: string, sprite: Container) {
    (sprite as any).__entityId = entityId;
    this.stage.addChild(sprite);
  }
}
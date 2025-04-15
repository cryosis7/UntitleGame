import type { System, UpdateArgs } from '../Systems';
import { Container, Graphics } from 'pixi.js';
import { pixiApp } from '../../Pixi';
import { ComponentType } from '../../components/ComponentTypes';
import { getEntitiesWithComponents } from '../../utils/EntityUtils';
import {
  getComponentAbsolute,
  getComponentIfExists,
} from '../../components/ComponentOperations';
import { gridToScreenAsTuple } from '../../map/MappingUtils';
import { RenderSystem } from '../RenderSystem';

export class SidebarRenderSystem implements System {
  private sidebarWidth = 150;
  private readonly sidebarContainer: Container;
  private renderedEntities: { [id: string]: Container } = {};

  constructor() {
    this.sidebarContainer = new Container({
      width: this.sidebarWidth,
      height: pixiApp.canvas.height,
      // interactive: true,
    }).addChild(
      new Graphics({
        x: 0,
        y: 0,
      })
        .rect(0, 0, this.sidebarWidth, pixiApp.canvas.height)
        .fill(0xd3d3d3),
    );

    pixiApp.stage.addChild(this.sidebarContainer);
    this.sidebarContainer.position.set(
      pixiApp.canvas.width - this.sidebarWidth,
      0,
    );
  }

  update({ entities }: UpdateArgs) {
    const sidebarEntities = getEntitiesWithComponents(
      [ComponentType.RenderInSidebar, ComponentType.Sprite],
      entities,
    );

    sidebarEntities.forEach((entity) => {
      const spriteComponent = getComponentAbsolute(
        entity,
        ComponentType.Sprite,
      );
      const positionComponent = getComponentIfExists(
        entity,
        ComponentType.Position,
      );

      // Remove any from the sidebar that no longer have position components
      if (positionComponent === undefined && this.renderedEntities[entity.id]) {
        this.sidebarContainer.removeChild(this.renderedEntities[entity.id]);
        delete this.renderedEntities[entity.id];
        return;
      } else if (!positionComponent) {
        return;
      }

      // Add any to the sidebar that are not already there
      if (this.renderedEntities[entity.id] === undefined) {
        const sprite = RenderSystem.createSprite(spriteComponent.sprite);
        const position = gridToScreenAsTuple(positionComponent, {
          tileSize: 16,
          gap: 4,
        });
        // RenderSystem.addToScreen(sprite, position, this.sidebarContainer);
        this.sidebarContainer.addChild(sprite);
        sprite.position.set(...position);

        this.renderedEntities[entity.id] = sprite;
      } else {
        const sprite = this.renderedEntities[entity.id];
        const position = gridToScreenAsTuple(positionComponent, {
          tileSize: 16,
          gap: 4,
        });
        sprite.position.set(...position);
      }
    });
  }
}

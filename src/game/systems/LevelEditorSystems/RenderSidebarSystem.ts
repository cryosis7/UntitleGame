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

export class RenderSidebarSystem implements System {
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

      // Remove any from the sidebar that are no longer have position components
      if (positionComponent === undefined && this.renderedEntities[entity.id]) {
        this.sidebarContainer.removeChild(spriteComponent.sprite);
        delete this.renderedEntities[entity.id];
        return;
      }
      if (!positionComponent) return;

      // Add any to the sidebar that are not already there
      if (this.renderedEntities[entity.id] === undefined) {
        // spriteComponent.sprite.position.set(...gridToScreenAsTuple(positionComponent, 16));
        this.sidebarContainer.addChild(spriteComponent.sprite);
        this.renderedEntities[entity.id] = spriteComponent.sprite;
      }

      spriteComponent.sprite.position.set(
        ...gridToScreenAsTuple(positionComponent, {
          tileSize: 16,
          gap: 4,
        }),
      );
    });
  }
}

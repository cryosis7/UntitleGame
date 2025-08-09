import type { UpdateArgs } from '../Systems';
import { Container, Graphics } from 'pixi.js';
import { pixiApp } from '../../Pixi';
import { ComponentType } from '../../components/ComponentTypes';
import { getComponentAbsolute, hasComponent } from '../../components/ComponentOperations';
import { BaseRenderSystem } from './BaseRenderSystem';
import type { RenderComponent } from '../../components/individualComponents/RenderComponent';

export class RenderSidebarSystem extends BaseRenderSystem {
  private readonly sidebarWidth = 150;

  constructor() {
    const sidebarContainer = new Container();
    super(sidebarContainer, 'sidebar', [pixiApp.canvas.width - 150, 0]);

    sidebarContainer.setSize(this.sidebarWidth, pixiApp.canvas.height);
    sidebarContainer.addChild(
      new Graphics({
        x: 0,
        y: 0,
      })
        .rect(0, 0, this.sidebarWidth, pixiApp.canvas.height)
        .fill(0xd3d3d3),
    );
  }

  update({ entities }: UpdateArgs) {
    // Filter entities that should be rendered in the sidebar section
    const sidebarEntities = entities.filter((entity) => {
      if (hasComponent(entity, ComponentType.Render)) {
        const renderComponent = getComponentAbsolute(entity, ComponentType.Render) as RenderComponent;
        return renderComponent.section === 'sidebar';
      }
      // Backward compatibility: still support RenderInSidebar component
      return hasComponent(entity, ComponentType.RenderInSidebar);
    });

    this.updateStageAndPositions(sidebarEntities);
  }
}

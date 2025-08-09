import type { UpdateArgs } from '../Systems';
import { Container, Graphics } from 'pixi.js';
import { pixiApp } from '../../Pixi';
import { ComponentType } from '../../components/ComponentTypes';
import { getComponentIfExists } from '../../components/ComponentOperations';
import { BaseRenderSystem } from './BaseRenderSystem';

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
      const renderComponent = getComponentIfExists(entity, ComponentType.Render);
      
      if (!renderComponent) {
        // If no render component, don't render in sidebar
        return false;
      }
      
      return renderComponent.section === 'sidebar';
    });

    this.updateStageAndPositions(sidebarEntities);
  }
}

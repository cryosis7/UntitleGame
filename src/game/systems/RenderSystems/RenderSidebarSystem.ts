import type { UpdateArgs } from '../Systems';
import { Container, Graphics } from 'pixi.js';
import { pixiApp } from '../../Pixi';
import { ComponentType } from '../../components/ComponentTypes';
import { getEntitiesWithComponents } from '../../utils/EntityUtils';
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
    const sidebarEntities = getEntitiesWithComponents(
      [ComponentType.RenderInSidebar],
      entities,
    );

    this.updateStageAndPositions(sidebarEntities);
  }
}

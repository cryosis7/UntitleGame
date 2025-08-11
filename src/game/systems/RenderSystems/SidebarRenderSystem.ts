import type { UpdateArgs } from '../Framework/Systems';
import { Graphics } from 'pixi.js';
import { pixiApp } from '../../Pixi';
import { ComponentType } from '../../components';
import { getEntitiesWithComponents } from '../../utils/EntityUtils';
import { BaseRenderSystem } from './BaseRenderSystem';
import { sidebarContainerAtom, store } from '../../utils/Atoms';

export class SidebarRenderSystem extends BaseRenderSystem {
  private readonly sidebarWidth = 150;

  constructor() {
    super('sidebar', [pixiApp.canvas.width - 150, 0]);

    const sidebarContainer = store.get(sidebarContainerAtom);
    if (!sidebarContainer) {
      throw new Error('Sidebar container not found');
    }

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
import type { UpdateArgs } from '../Framework/Systems';
import { Graphics } from 'pixi.js';
import { pixiApp } from '../../Pixi';
import { ComponentType, RenderSection } from '../../components';
import { hasComponentValue } from '../../components/ComponentOperations';
import { BaseRenderSystem } from './BaseRenderSystem';
import { sidebarContainerAtom, store } from '../../atoms';

export class SidebarRenderSystem extends BaseRenderSystem {
  private static readonly SIDEBAR_WIDTH = 200;

  constructor() {
    super(RenderSection.Sidebar, [
      pixiApp.canvas.width - SidebarRenderSystem.SIDEBAR_WIDTH,
      0,
    ]);

    const sidebarContainer = store.get(sidebarContainerAtom);
    if (!sidebarContainer) {
      throw new Error('Sidebar container not found');
    }

    sidebarContainer.setSize(
      SidebarRenderSystem.SIDEBAR_WIDTH,
      pixiApp.canvas.height,
    );
    sidebarContainer.addChild(
      new Graphics({
        x: 0,
        y: 0,
      })
        .rect(0, 0, SidebarRenderSystem.SIDEBAR_WIDTH, pixiApp.canvas.height)
        .fill(0xd3d3d3),
    );
  }

  update({ entities }: UpdateArgs) {
    const sidebarEntities = entities.filter((entity) => {
      return hasComponentValue(entity, ComponentType.Render, {
        section: RenderSection.Sidebar,
      });
    });

    this.updateStageAndPositions(sidebarEntities);
  }
}

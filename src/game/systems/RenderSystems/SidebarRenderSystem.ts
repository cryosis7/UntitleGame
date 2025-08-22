import type { UpdateArgs } from '../Framework/Systems';
import { Graphics } from 'pixi.js';
import { pixiApp } from '../../Pixi';
import { ComponentType } from '../../components';
import { hasComponentValue } from '../../components/ComponentOperations';
import { RenderSection } from '../../components/individualComponents/RenderComponent';
import { BaseRenderSystem } from './BaseRenderSystem';
import { sidebarContainerAtom, store } from '../../atoms';

export class SidebarRenderSystem extends BaseRenderSystem {
  private readonly sidebarWidth = 150;

  constructor() {
    super(RenderSection.Sidebar, [pixiApp.canvas.width - 150, 0]);

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
    const sidebarEntities = entities.filter((entity) => {
      return hasComponentValue(entity, ComponentType.Render, {
        section: RenderSection.Sidebar,
      });
    });

    this.updateStageAndPositions(sidebarEntities);
  }
}

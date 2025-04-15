import { Graphics } from 'pixi.js';
import { pixiApp } from '../../Pixi';
import { BaseRenderSystem } from './BaseRenderSystem';

export class SidebarRenderSystem extends BaseRenderSystem {
  private sidebarWidth = 150;

  constructor() {
    super({
      interfaceConfig: {
        tileSize: 16,
        gap: 4,
      },
    });
    this.rootContainer.position.set(
      pixiApp.canvas.width - this.sidebarWidth,
      0,
    );
    this.rootContainer.setSize({
      width: this.sidebarWidth,
      height: pixiApp.canvas.height,
    });
    this.rootContainer.addChild(
      new Graphics({
        x: 0,
        y: 0,
      })
        .rect(0, 0, this.sidebarWidth, pixiApp.canvas.height)
        .fill(0xd3d3d3),
    );
  }
}

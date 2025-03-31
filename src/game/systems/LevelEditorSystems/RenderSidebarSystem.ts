import type { System, UpdateArgs } from '../Systems';
import { Container, Graphics } from 'pixi.js';
import { pixiApp } from '../../Pixi';
import { ComponentType } from '../../components/Components';
import { hasComponent } from '../../utils/ComponentUtils';

export class RenderSidebarSystem implements System {
  private sidebarWidth = 150;
  private readonly sidebarContainer: Container;

  constructor() {
    this.sidebarContainer = new Container({
      x: pixiApp.canvas.width - this.sidebarWidth,
      y: 0,
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
  }

  update({ entities }: UpdateArgs) {
    const sidebarEntities = entities.filter((entity) =>
      hasComponent(entity, ComponentType.Sprite),
    );
  }
}

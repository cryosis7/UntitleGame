import type { BaseSystem, UpdateArgs } from './Systems';
import type { Container, Point } from 'pixi.js';

export abstract class BaseMouseMoveSystem implements BaseSystem {
  protected readonly stage: Container;

  protected constructor(container: Container) {
    container.eventMode = 'static';
    container.onmousemove = (event) => {
      const localPosition = container.toLocal(event.global);
      this.handleMouseMove(localPosition);
    };
    container.onmouseleave = () => {
      this.handleMouseLeave();
    };
    this.stage = container;
  }

  abstract handleMouseMove(localPosition: Point): void;

  abstract handleMouseLeave(): void;

  abstract update(updateArgs: UpdateArgs): void;
}

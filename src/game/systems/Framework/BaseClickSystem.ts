import type { System, UpdateArgs } from './Systems';
import type { Container, FederatedPointerEvent, Point } from 'pixi.js';

export abstract class BaseClickSystem implements System {
  constructor(container: Container) {
    container.eventMode = 'static';
    container.onclick = (event) => {
      const localPosition = container.toLocal(event.global);

      this.handleClick(event, localPosition);
    };
  }

  abstract handleClick(
    event: FederatedPointerEvent,
    localPosition: Point,
  ): void;

  abstract update(updateArgs: UpdateArgs): void;
}

import type { BaseSystem, UpdateArgs } from './Systems';
import type { Container, FederatedPointerEvent, Point } from 'pixi.js';

export abstract class BaseClickSystem implements BaseSystem {
  constructor(container: Container) {
    container.eventMode = 'static';
    container.onclick = (event) => {
      const localPosition = container.toLocal(event.global);

      this.handleClick(event, localPosition);
    };
  }

  abstract handleClick(
    _event: FederatedPointerEvent,
    _localPosition: Point,
  ): void;

  abstract update(_updateArgs: UpdateArgs): void;
}
import type { SystemBase, UpdateArgs } from './SystemBase';
import type { Container, FederatedPointerEvent, Point } from 'pixi.js';
import { ClickHandlerSystem } from './ClickHandlerSystem';

export type CustomPointerEvent = FederatedPointerEvent & {
  localPosition: Point;
};
export type PixiClickHandler = (event: CustomPointerEvent) => void;

export abstract class BaseClickSystem implements SystemBase {
  private readonly clickHandler: PixiClickHandler;

  constructor(container: Container) {
    this.clickHandler = this.handleClick.bind(this);
    ClickHandlerSystem.registerHandler(container, this.clickHandler);
  }

  abstract handleClick(event: CustomPointerEvent): void;

  update(_: UpdateArgs): void {
    // No update logic needed for the base class.
  }
}

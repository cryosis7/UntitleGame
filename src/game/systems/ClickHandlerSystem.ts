import type { SystemBase, UpdateArgs } from './SystemBase';
import type { Container, FederatedPointerEvent } from 'pixi.js';
import { store } from '../../App';
import type { PixiClickHandler } from './BaseClickSystem';
import { containerHandlersAtom } from '../atoms/Atoms';

export class ClickHandlerSystem implements SystemBase {
  constructor() {
    const containerHandlers = store.get(containerHandlersAtom);

    containerHandlers.forEach((handlers, container) => {
      container.eventMode = 'static'; // Enable interaction for the container
      container.on('pointerdown', (event: FederatedPointerEvent) => {
        handlers.forEach((handler) => handler(event));
      });
    });
  }

  static registerHandler(container: Container, clickHandler: PixiClickHandler) {
    const containerHandlers = store.get(containerHandlersAtom);
    if (!containerHandlers.has(container)) {
      containerHandlers.set(container, []);
    }
    containerHandlers.get(container)!.push(clickHandler);
    store.set(containerHandlersAtom, containerHandlers);
  }

  update(_: UpdateArgs): void {
    // No update logic needed; click handling is event-driven.
  }
}

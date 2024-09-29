import type { System, Ticker } from 'pixi.js';
import type { Entity } from '../../../utils/ecsUtils';
import { getComponent, hasComponent, setComponent } from '../../../utils/ecsUtils';
import type { PositionComponent } from '../Components';

export class KeyboardInputSystem implements System {
  private keys: { [key: string]: boolean } = {};
  private hasChanged: boolean = false;

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.hasChanged = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.hasChanged = true;
    });
  }

  init() {
    // Should constructor stuff be in here? Should I remove the init function?
  }

  update(_time: Ticker, entities: Entity[]) {
    if (!this.hasChanged) return;

    const playerEntity = entities.find((entity) =>
      hasComponent(entity, 'player'),
    );

    if (!playerEntity) return;

    const positionComponent = getComponent<PositionComponent>(
      playerEntity,
      'position',
    );

    if (!positionComponent) return;

    let updated = false;
    if (this.keys['ArrowUp']) {
      positionComponent.y -= 1;
      updated = true;
    }
    if (this.keys['ArrowDown']) {
      positionComponent.y += 1;
      updated = true;
    }
    if (this.keys['ArrowLeft']) {
      positionComponent.x -= 1;
      updated = true;
    }
    if (this.keys['ArrowRight']) {
      positionComponent.x += 1;
      updated = true;
    }

    if (updated) {
      setComponent(playerEntity, positionComponent);
    }

    this.hasChanged = false;
  }
}

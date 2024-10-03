import type { PositionComponent } from '../components/Components';
import type { System } from './Systems';
import type { Entity } from '../utils/ecsUtils';
import { getComponent, hasComponent, setComponent } from '../utils/ecsUtils';

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

  update(entities: Entity[]) {
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

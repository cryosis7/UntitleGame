import type { VelocityComponent } from '../components/Components';
import type { System, UpdateArgs } from './Systems';
import {
  canMoveInDirection,
  getComponent,
  hasComponent,
  setComponent,
} from '../utils/ecsUtils';

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

  update({ entities, map }: UpdateArgs) {
    if (!entities || !map || !this.hasChanged) return;

    const playerEntity = entities.find((entity) =>
      hasComponent(entity, 'player'),
    );

    if (!playerEntity) return;

    const velocityComponent = getComponent<VelocityComponent>(
      playerEntity,
      'velocity',
    )

    if (!velocityComponent) return;

    velocityComponent.vx = 0;
    velocityComponent.vy = 0;

    if (this.keys['ArrowUp']) {
      velocityComponent.vy = -1;
    }
    if (this.keys['ArrowDown']) {
      velocityComponent.vy = 1;
    }
    if (this.keys['ArrowLeft']) {
      velocityComponent.vx = -1;
    }
    if (this.keys['ArrowRight']) {
      velocityComponent.vx = 1;
    }

    setComponent(playerEntity, velocityComponent);

    this.hasChanged = false;
  }
}

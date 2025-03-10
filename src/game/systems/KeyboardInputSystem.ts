import { HandlingComponent, VelocityComponent } from '../components/Components';
import { ComponentType, InteractingComponent } from '../components/Components';
import type { System, UpdateArgs } from './Systems';
import type { Entity} from '../utils/ecsUtils';
import { getEntitiesWithComponent } from '../utils/EntityUtils';
import { getComponent, setComponent } from '../utils/ComponentUtils';

export class KeyboardInputSystem implements System {
  private keys: { [key: string]: boolean } = {};
  
  // Indicates if the state of the keys has changed since the last update
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

    const playerEntities = getEntitiesWithComponent(
      ComponentType.Player,
      entities,
    );
    if (playerEntities.length !== 1) return;
    const playerEntity = playerEntities[0];

    this.handleMovement(playerEntity);
    this.handleInteraction(playerEntity);
    this.handlePickup(playerEntity);
    this.hasChanged = false;
  }

  private handleMovement(playerEntity: Entity) {
    const velocityComponent = getComponent<VelocityComponent>(
      playerEntity,
      ComponentType.Velocity,
    );

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
  }

  private handleInteraction(playerEntity: Entity) {
    if (this.keys['E']) {
      setComponent(playerEntity, new InteractingComponent());
    }
  }

  private handlePickup(playerEntity: Entity) {
    if (this.keys[' ']) {
      setComponent(playerEntity, new HandlingComponent());
    }
  }
}

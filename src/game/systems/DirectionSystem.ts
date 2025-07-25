import type { System, UpdateArgs } from './Systems';
import { getEntitiesWithComponents } from '../utils/EntityUtils';
import { ComponentType } from '../components/ComponentTypes';
import {
  getComponentAbsolute,
  setComponent,
} from '../components/ComponentOperations';

export class DirectionSystem implements System {
  update({ entities }: UpdateArgs): void {
    getEntitiesWithComponents(
      [ComponentType.Direction, ComponentType.Velocity],
      entities,
    ).forEach((entity) => {
      const directionComponent = getComponentAbsolute(
        entity,
        ComponentType.Direction,
      );
      const velocityComponent = getComponentAbsolute(
        entity,
        ComponentType.Velocity,
      );

      if (velocityComponent.vx === 0 && velocityComponent.vy === 0) {
        return;
      }

      if (Math.abs(velocityComponent.vx) > Math.abs(velocityComponent.vy)) {
        directionComponent.direction =
          velocityComponent.vx > 0 ? 'right' : 'left';
      } else {
        directionComponent.direction = velocityComponent.vy > 0 ? 'down' : 'up';
      }

      setComponent(entity, directionComponent);
    });
  }
}

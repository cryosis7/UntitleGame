import type { System, UpdateArgs } from './Systems';
import type {
  VelocityComponent} from '../components/Components';
import {
  ComponentType,
  PositionComponent
} from '../components/Components';
import type {
  Entity} from '../utils/ecsUtils';
import {
  getEntitiesWithComponent,
  hasEntitiesAtPosition,
} from '../utils/EntityUtils';
import { setComponent, getComponentIfExists, hasAnyComponent } from '../utils/ComponentUtils';

export class MovementSystem implements System {
  update({ entities, map }: UpdateArgs) {
    if (!entities || !map) return;

    const resetVelocity = (entity: Entity) => {
      setComponent(entity, {
        type: ComponentType.Velocity,
        vx: 0,
        vy: 0,
      });
    };

    entities.forEach((entity) => {
      const positionComponent = getComponentIfExists<PositionComponent>(
        entity,
        ComponentType.Position
      );
      const velocityComponent = getComponentIfExists<VelocityComponent>(
        entity,
        ComponentType.Velocity
      );

      if (
        !positionComponent ||
        !velocityComponent ||
        (velocityComponent.vx === 0 && velocityComponent.vy === 0)
      ) {
        return;
      }

      const newPosition = {
        x: positionComponent.x + velocityComponent.vx,
        y: positionComponent.y + velocityComponent.vy,
      };

      if (!map.isValidPosition(newPosition)) {
        resetVelocity(entity);
        return;
      }

      const entitiesAtNewPosition = entities.filter((e) => {
        if (e.id === entity.id) return false;
        const otherPositionComponent = getComponentIfExists<PositionComponent>(
          e,
          ComponentType.Position
        );
        return (
          otherPositionComponent?.x === newPosition.x &&
          otherPositionComponent?.y === newPosition.y
        );
      });

      if (entitiesAtNewPosition.length !== 0) {
        // Only movable entities can be pushed and pickable entities can be walked on.
        const isMovementBlocked = entitiesAtNewPosition.some((e) => {
          return !hasAnyComponent(
            e,
            ComponentType.Movable,
            ComponentType.Pickable,
          );
        });

        if (isMovementBlocked) {
          resetVelocity(entity);
          return;
        }

        // For the movable entities, we need to check if they are free to move.
        const movableEntities = getEntitiesWithComponent(
          ComponentType.Movable,
          entitiesAtNewPosition,
        );
        if (movableEntities.length > 0) {
          const movableEntitiesNewPosition = {
            x: newPosition.x + velocityComponent.vx,
            y: newPosition.y + velocityComponent.vy,
          };

          if (
            !map.isValidPosition(movableEntitiesNewPosition) ||
            hasEntitiesAtPosition(movableEntitiesNewPosition)
          ) {
            resetVelocity(entity);
            return;
          }

          movableEntities.forEach((movableEntity) => {
            setComponent(
              movableEntity,
              new PositionComponent(movableEntitiesNewPosition),
            );
          });
        }
      }

      resetVelocity(entity);
      setComponent(entity, new PositionComponent(newPosition));
    });
  }
}

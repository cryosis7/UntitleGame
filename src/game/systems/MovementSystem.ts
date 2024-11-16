import type { System, UpdateArgs } from './Systems';
import type {
  PositionComponent,
  VelocityComponent,
} from '../components/Components';
import type { Entity } from '../utils/ecsUtils';
import { getComponent, hasComponent, setComponent } from '../utils/ecsUtils';

export class MovementSystem implements System {
  update({ entities, map }: UpdateArgs) {
    if (!entities || !map) return;

    const resetVelocity = (entity: Entity) => {
      setComponent(entity, {
        type: 'velocity',
        vx: 0,
        vy: 0,
      });
    };

    entities.forEach((entity) => {
      const positionComponent = getComponent<PositionComponent>(
        entity,
        'position',
      );
      const velocityComponent = getComponent<VelocityComponent>(
        entity,
        'velocity',
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
        const otherPositionComponent = getComponent<PositionComponent>(
          e,
          'position',
        );
        return (
          otherPositionComponent?.x === newPosition.x &&
          otherPositionComponent?.y === newPosition.y
        );
      });

      if (entitiesAtNewPosition.length !== 0) {
        const isMovementBlocked = entitiesAtNewPosition.some((e) => {
          return !hasComponent(e, 'movable');
        });

        if (isMovementBlocked) {
          resetVelocity(entity);
          return;
        }

        // The above return statement guarantees all entities at the new position are movable

        const movableEntitiesNewPosition = {
          x: newPosition.x + velocityComponent.vx,
          y: newPosition.y + velocityComponent.vy,
        };

        if (!map.isValidPosition(movableEntitiesNewPosition)) {
          resetVelocity(entity);
          return;
        }

        entitiesAtNewPosition.forEach((movableEntity) => {
          if (
            !entities.some((otherEntity) => {
              if (otherEntity.id === movableEntity.id) return false;
              const otherEntityPositionComponent =
                getComponent<PositionComponent>(otherEntity, 'position');
              return (
                otherEntityPositionComponent?.x ===
                  movableEntitiesNewPosition.x &&
                otherEntityPositionComponent?.y === movableEntitiesNewPosition.y
              );
            })
          ) {
            setComponent(movableEntity, {
              ...getComponent<PositionComponent>(movableEntity, 'position'),
              ...movableEntitiesNewPosition,
              type: 'position',
            });
          } else {
            resetVelocity(entity);
            return;
          }
        });
      }

      resetVelocity(entity);
      setComponent(entity, { ...positionComponent, ...newPosition });
    });
  }
}

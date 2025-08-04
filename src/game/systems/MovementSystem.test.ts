import { beforeEach, describe, expect, it } from 'vitest';
import { MovementSystem } from './MovementSystem';
import { createEntity } from '../utils/EntityFactory';
import type { Entity } from '../utils/ecsUtils';
import type { UpdateArgs } from './Systems';
import { entitiesAtom, store } from '../utils/Atoms';
import type { GameMap, Position } from '../map/GameMap';
import type {
  PositionComponentProps,
  VelocityComponentProps,
} from '../components';
import {
  ComponentType,
  MovableComponent,
  PickableComponent,
  PositionComponent,
  VelocityComponent,
} from '../components';
import { getEntity } from '../utils/EntityUtils';

describe('MovementSystem', () => {
  let system: MovementSystem;
  let entities: Entity[];

  // Create a mock GameMap that allows movement in a 50x50 area
  const map = {
    isValidPosition: ({ x, y }: Position) =>
      x >= 0 && y >= 0 && x < 50 && y < 50,
    isPositionInMap: ({ x, y }: Position) =>
      x >= 0 && y >= 0 && x < 50 && y < 50,
    isTileWalkable: ({ x, y }: Position) => true,
    getTile: ({ x, y }: Position) => null,
  } as GameMap;

  beforeEach(() => {
    system = new MovementSystem();
    entities = [];
    store.set(entitiesAtom, entities);
  });

  const createMovingEntity = ({
    position = { x: 0, y: 0 },
    velocity = { vx: 0, vy: 0 },
  }: {
    position?: PositionComponentProps;
    velocity?: VelocityComponentProps;
  } = {}) => {
    return createEntity([
      new PositionComponent(position),
      new VelocityComponent(velocity),
    ]);
  };

  const createMovableEntity = (position: PositionComponentProps) => {
    return createEntity([
      new PositionComponent(position),
      new MovableComponent(),
    ]);
  };

  const createPickableEntity = (position: PositionComponentProps) => {
    return createEntity([
      new PositionComponent(position),
      new PickableComponent(),
    ]);
  };

  const getUpdateArgs = (): UpdateArgs => {
    const entities = store.get(entitiesAtom);
    return {
      entities,
      map,
      time: undefined,
    };
  };

  describe('Core Movement Logic', () => {
    describe('Basic Movement', () => {
      it('should update position based on velocity when movement is valid', () => {
        const entity = createMovingEntity({
          position: { x: 5, y: 5 },
          velocity: { vx: 2, vy: -1 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        expect(updatedEntity).toBeDefined();

        const position = updatedEntity!.components[
          ComponentType.Position
        ] as PositionComponentProps;
        expect(position.x).toBe(7);
        expect(position.y).toBe(4);
      });

      it('should reset velocity to zero after processing movement', () => {
        const entity = createMovingEntity({
          position: { x: 5, y: 5 },
          velocity: { vx: 2, vy: -1 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        expect(updatedEntity).toBeDefined();

        const velocity = updatedEntity!.components[
          ComponentType.Velocity
        ] as VelocityComponentProps;
        expect(velocity.vx).toBe(0);
        expect(velocity.vy).toBe(0);
      });

      it('should not move entity when velocity is zero', () => {
        const entity = createMovingEntity({
          position: { x: 10, y: 15 },
          velocity: { vx: 0, vy: 0 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const position = updatedEntity!.components[
          ComponentType.Position
        ] as PositionComponentProps;
        expect(position.x).toBe(10);
        expect(position.y).toBe(15);
      });

      it('should not move entity when missing position component', () => {
        const entity = createEntity([new VelocityComponent({ vx: 1, vy: 1 })]);

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        expect(
          updatedEntity!.components[ComponentType.Position],
        ).toBeUndefined();
      });

      it('should not move entity when missing velocity component', () => {
        const entity = createEntity([new PositionComponent({ x: 5, y: 5 })]);

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const position = updatedEntity!.components[
          ComponentType.Position
        ] as PositionComponentProps;
        expect(position.x).toBe(5);
        expect(position.y).toBe(5);
      });
    });

    describe('Collision Detection', () => {
      describe('Map Boundary Collision', () => {
        it('should not move entity when target position is invalid on map', () => {
          const entity = createMovingEntity({
            position: { x: 0, y: 0 },
            velocity: { vx: -1, vy: 0 }, // Moving to invalid position
          });

          store.set(entitiesAtom, [entity]);
          system.update(getUpdateArgs());

          const updatedEntity = getEntity(entity.id);
          const position = updatedEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(position.x).toBe(0);
          expect(position.y).toBe(0);

          // Velocity should still be reset
          const velocity = updatedEntity!.components[
            ComponentType.Velocity
          ] as VelocityComponentProps;
          expect(velocity.vx).toBe(0);
          expect(velocity.vy).toBe(0);
        });

        it('should not move entity when target position is beyond map bounds', () => {
          const entity = createMovingEntity({
            position: { x: 49, y: 49 }, // Near edge
            velocity: { vx: 2, vy: 2 }, // Moving beyond bounds
          });

          store.set(entitiesAtom, [entity]);
          system.update(getUpdateArgs());

          const updatedEntity = getEntity(entity.id);
          const position = updatedEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(position.x).toBe(49);
          expect(position.y).toBe(49);
        });
      });

      describe('Entity Collision', () => {
        it('should not move entity when target position is occupied by non-movable, non-pickable entity', () => {
          const movingEntity = createMovingEntity({
            position: { x: 5, y: 5 },
            velocity: { vx: 1, vy: 0 },
          });

          const blockingEntity = createEntity([
            new PositionComponent({ x: 6, y: 5 }),
          ]);

          store.set(entitiesAtom, [movingEntity, blockingEntity]);
          system.update(getUpdateArgs());

          const updatedMovingEntity = getEntity(movingEntity.id);
          const position = updatedMovingEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(position.x).toBe(5); // Should not move
          expect(position.y).toBe(5);

          // Velocity should be reset
          const velocity = updatedMovingEntity!.components[
            ComponentType.Velocity
          ] as VelocityComponentProps;
          expect(velocity.vx).toBe(0);
          expect(velocity.vy).toBe(0);
        });

        it('should move entity when target position has pickable entity', () => {
          const movingEntity = createMovingEntity({
            position: { x: 5, y: 5 },
            velocity: { vx: 1, vy: 0 },
          });

          const pickableEntity = createPickableEntity({ x: 6, y: 5 });

          store.set(entitiesAtom, [movingEntity, pickableEntity]);
          system.update(getUpdateArgs());

          const updatedMovingEntity = getEntity(movingEntity.id);
          const position = updatedMovingEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(position.x).toBe(6); // Should move successfully
          expect(position.y).toBe(5);
        });

        it('should push movable entity when target position is occupied by movable entity', () => {
          const movingEntity = createMovingEntity({
            position: { x: 5, y: 5 },
            velocity: { vx: 1, vy: 0 },
          });

          const movableEntity = createMovableEntity({ x: 6, y: 5 });

          store.set(entitiesAtom, [movingEntity, movableEntity]);
          system.update(getUpdateArgs());

          // Moving entity should move to target position
          const updatedMovingEntity = getEntity(movingEntity.id);
          const movingPosition = updatedMovingEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(movingPosition.x).toBe(6);
          expect(movingPosition.y).toBe(5);

          // Movable entity should be pushed to new position
          const updatedMovableEntity = getEntity(movableEntity.id);
          const movablePosition = updatedMovableEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(movablePosition.x).toBe(7); // Pushed in same direction
          expect(movablePosition.y).toBe(5);
        });

        it('should not move entity when movable entity cannot be pushed due to invalid position', () => {
          const movingEntity = createMovingEntity({
            position: { x: 48, y: 5 },
            velocity: { vx: 1, vy: 0 },
          });

          const movableEntity = createMovableEntity({ x: 49, y: 5 }); // Near map edge

          store.set(entitiesAtom, [movingEntity, movableEntity]);
          system.update(getUpdateArgs());

          // Neither entity should move
          const updatedMovingEntity = getEntity(movingEntity.id);
          const movingPosition = updatedMovingEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(movingPosition.x).toBe(48);
          expect(movingPosition.y).toBe(5);

          const updatedMovableEntity = getEntity(movableEntity.id);
          const movablePosition = updatedMovableEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(movablePosition.x).toBe(49);
          expect(movablePosition.y).toBe(5);

          // Velocity should be reset
          const velocity = updatedMovingEntity!.components[
            ComponentType.Velocity
          ] as VelocityComponentProps;
          expect(velocity.vx).toBe(0);
          expect(velocity.vy).toBe(0);
        });

        it('should not move entity when movable entity cannot be pushed due to entity blocking push target', () => {
          const movingEntity = createMovingEntity({
            position: { x: 5, y: 5 },
            velocity: { vx: 1, vy: 0 },
          });

          const movableEntity = createMovableEntity({ x: 6, y: 5 });

          const blockingEntity = createEntity([
            new PositionComponent({ x: 7, y: 5 }), // Blocks push target
          ]);

          store.set(entitiesAtom, [
            movingEntity,
            movableEntity,
            blockingEntity,
          ]);
          system.update(getUpdateArgs());

          // No entities should move
          const updatedMovingEntity = getEntity(movingEntity.id);
          const movingPosition = updatedMovingEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(movingPosition.x).toBe(5);
          expect(movingPosition.y).toBe(5);
          const velocity = updatedMovingEntity!.components[
            ComponentType.Velocity
          ] as VelocityComponentProps;
          expect(velocity.vx).toBe(0);
          expect(velocity.vy).toBe(0);

          const updatedMovableEntity = getEntity(movableEntity.id);
          const movablePosition = updatedMovableEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(movablePosition.x).toBe(6);
          expect(movablePosition.y).toBe(5);

          const updatedBlockingEntity = getEntity(blockingEntity.id);
          const blockingPosition = updatedBlockingEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(blockingPosition.x).toBe(7);
          expect(blockingPosition.y).toBe(5);
        });
      });
    });

    describe('Advanced Scenarios', () => {
      describe('Multiple Entity Movement', () => {
        it('should handle multiple entities moving simultaneously', () => {
          const entity1 = createMovingEntity({
            position: { x: 1, y: 1 },
            velocity: { vx: 1, vy: 0 },
          });

          const entity2 = createMovingEntity({
            position: { x: 10, y: 10 },
            velocity: { vx: 0, vy: -1 },
          });

          store.set(entitiesAtom, [entity1, entity2]);
          system.update(getUpdateArgs());

          const updatedEntity1 = getEntity(entity1.id);
          const position1 = updatedEntity1!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(position1.x).toBe(2);
          expect(position1.y).toBe(1);

          const updatedEntity2 = getEntity(entity2.id);
          const position2 = updatedEntity2!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(position2.x).toBe(10);
          expect(position2.y).toBe(9);

          // Both velocities should be reset
          const velocity1 = updatedEntity1!.components[
            ComponentType.Velocity
          ] as VelocityComponentProps;
          const velocity2 = updatedEntity2!.components[
            ComponentType.Velocity
          ] as VelocityComponentProps;
          expect(velocity1.vx).toBe(0);
          expect(velocity2.vy).toBe(0);
        });

        it('should handle diagonal movement correctly', () => {
          const entity = createMovingEntity({
            position: { x: 10, y: 10 },
            velocity: { vx: -2, vy: 3 },
          });

          store.set(entitiesAtom, [entity]);
          system.update(getUpdateArgs());

          const updatedEntity = getEntity(entity.id);
          const position = updatedEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(position.x).toBe(8);
          expect(position.y).toBe(13);
        });

        it('should handle entity with both movable and pickable components correctly', () => {
          const movingEntity = createMovingEntity({
            position: { x: 5, y: 5 },
            velocity: { vx: 1, vy: 0 },
          });

          const targetEntity = createEntity([
            new PositionComponent({ x: 6, y: 5 }),
            new MovableComponent(),
            new PickableComponent(),
          ]);

          store.set(entitiesAtom, [movingEntity, targetEntity]);
          system.update(getUpdateArgs());

          // Should move successfully since target has pickable component
          const updatedMovingEntity = getEntity(movingEntity.id);
          const movingPosition = updatedMovingEntity!.components[
            ComponentType.Position
          ] as PositionComponentProps;
          expect(movingPosition.x).toBe(6);
          expect(movingPosition.y).toBe(5);
        });
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    describe('Data Integrity Issues', () => {
      it('should handle empty entities array gracefully', () => {
        store.set(entitiesAtom, []);

        expect(() => system.update(getUpdateArgs())).not.toThrow();
      });

      it('should handle null or undefined entities gracefully', () => {
        const invalidUpdateArgs: UpdateArgs = {
          entities: null as any,
          map,
        };

        expect(() => system.update(invalidUpdateArgs)).not.toThrow();
      });

      it('should handle null or undefined map gracefully', () => {
        const entity = createMovingEntity({
          position: { x: 5, y: 5 },
          velocity: { vx: 1, vy: 0 },
        });

        const invalidUpdateArgs: UpdateArgs = {
          entities: [entity],
          map: null as any,
        };

        expect(() => system.update(invalidUpdateArgs)).not.toThrow();

        // Entity should remain unchanged
        const position = entity.components[
          ComponentType.Position
        ] as PositionComponentProps;
        expect(position.x).toBe(5);
        expect(position.y).toBe(5);
      });

      it('should handle fractional velocity values correctly', () => {
        const entity = createMovingEntity({
          position: { x: 5, y: 5 },
          velocity: { vx: 2.7, vy: -1.3 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const position = updatedEntity!.components[
          ComponentType.Position
        ] as PositionComponentProps;
        expect(position.x).toBe(7.7); // 5 + 2.7
        expect(position.y).toBe(3.7); // 5 + (-1.3)
      });

      it('should handle very large velocity values when blocked by boundaries', () => {
        const entity = createMovingEntity({
          position: { x: 5, y: 5 },
          velocity: { vx: 1000, vy: -500 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        // Movement should be blocked by map boundaries
        const updatedEntity = getEntity(entity.id);
        const position = updatedEntity!.components[
          ComponentType.Position
        ] as PositionComponentProps;
        expect(position.x).toBe(5);
        expect(position.y).toBe(5);

        // Velocity should still be reset
        const velocity = updatedEntity!.components[
          ComponentType.Velocity
        ] as VelocityComponentProps;
        expect(velocity.vx).toBe(0);
        expect(velocity.vy).toBe(0);
      });
    });
  });
});

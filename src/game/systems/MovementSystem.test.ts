import { describe, it, expect, beforeEach } from 'vitest';
import { MovementSystem } from './MovementSystem';
import { createEntityFromTemplate } from '../utils/EntityFactory';
import { createStandardUpdateArgs } from '../../../tests/helpers/testUtils';
import { setupECSTestEnvironment } from '../../../tests/helpers/ecsTestSetup';
import { ComponentType } from '../components/ComponentTypes';
import { getComponentIfExists } from '../components/ComponentOperations';
import type { Entity } from '../utils/ecsUtils';
import type { UpdateArgs } from './Systems';
import { store } from '../../App';
import { entitiesAtom } from '../utils/Atoms';

describe('MovementSystem', () => {
  setupECSTestEnvironment();

  let system: MovementSystem;
  let entities: Entity[];
  let updateArgs: UpdateArgs;

  // Helper function to set up entities for testing
  const setupEntities = (entityList: Entity[]) => {
    entities = entityList;
    store.set(entitiesAtom, entities);
    updateArgs = createStandardUpdateArgs(entities);
  };

  // Helper function to get updated entities from the store
  const getUpdatedEntities = () => store.get(entitiesAtom);
  const getUpdatedEntity = (originalEntity: Entity) => {
    const updated = getUpdatedEntities();
    return updated.find((e) => e.id === originalEntity.id)!;
  };

  beforeEach(() => {
    system = new MovementSystem();
    entities = [];

    // Clear the global entity store before each test
    store.set(entitiesAtom, []);
  });

  describe('Basic Movement', () => {
    it('should update position based on velocity when movement is valid', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 5, y: 5 },
          [ComponentType.Velocity]: { vx: 2, vy: -1 },
        },
      });

      setupEntities([entity]);
      system.update(updateArgs);

      const updatedEntity = getUpdatedEntity(entity);
      const position = getComponentIfExists(
        updatedEntity,
        ComponentType.Position,
      );
      expect(position).toBeDefined();
      expect(position!.x).toBe(7);
      expect(position!.y).toBe(4);

      const velocity = getComponentIfExists(
        updatedEntity,
        ComponentType.Velocity,
      );
      expect(velocity!.vx).toBe(0); // Should be reset
      expect(velocity!.vy).toBe(0); // Should be reset
    });

    it('should reset velocity to zero after processing movement', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 0, y: 0 },
          [ComponentType.Velocity]: { vx: 3, vy: 4 },
        },
      });

      setupEntities([entity]);
      system.update(updateArgs);

      const updatedEntity = getUpdatedEntity(entity);
      const velocity = getComponentIfExists(
        updatedEntity,
        ComponentType.Velocity,
      );
      expect(velocity).toBeDefined();
      expect(velocity!.vx).toBe(0);
      expect(velocity!.vy).toBe(0);
    });

    it('should not move entity when velocity is zero', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 10, y: 15 },
          [ComponentType.Velocity]: { vx: 0, vy: 0 },
        },
      });
      entities = [entity];

      updateArgs = createStandardUpdateArgs(entities);
      system.update(updateArgs);

      const position = getComponentIfExists(entity, ComponentType.Position);
      expect(position).toBeDefined();
      expect(position!.x).toBe(10);
      expect(position!.y).toBe(15);
    });

    it('should not move entity when missing position component', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Velocity]: { vx: 1, vy: 1 },
        },
      });
      entities = [entity];

      updateArgs = createStandardUpdateArgs(entities);
      system.update(updateArgs);

      // Entity should remain unchanged
      const position = getComponentIfExists(entity, ComponentType.Position);
      expect(position).toBeUndefined();
    });

    it('should not move entity when missing velocity component', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 5, y: 5 },
        },
      });
      entities = [entity];

      updateArgs = createStandardUpdateArgs(entities);
      system.update(updateArgs);

      const position = getComponentIfExists(entity, ComponentType.Position);
      expect(position).toBeDefined();
      expect(position!.x).toBe(5);
      expect(position!.y).toBe(5);
    });
  });

  describe('Map Boundary Collision', () => {
    it('should not move entity when target position is invalid on map', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 0, y: 0 },
          [ComponentType.Velocity]: { vx: -1, vy: 0 }, // Moving to invalid position
        },
      });

      setupEntities([entity]);
      system.update(updateArgs);

      const updatedEntity = getUpdatedEntity(entity);
      const position = getComponentIfExists(
        updatedEntity,
        ComponentType.Position,
      );
      expect(position).toBeDefined();
      expect(position!.x).toBe(0);
      expect(position!.y).toBe(0);

      // Velocity should still be reset
      const velocity = getComponentIfExists(
        updatedEntity,
        ComponentType.Velocity,
      );
      expect(velocity!.vx).toBe(0);
      expect(velocity!.vy).toBe(0);
    });

    it('should not move entity when target position is beyond map bounds', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 49, y: 49 }, // Near edge
          [ComponentType.Velocity]: { vx: 2, vy: 2 }, // Moving beyond bounds
        },
      });
      entities = [entity];

      updateArgs = createStandardUpdateArgs(entities);
      system.update(updateArgs);

      const position = getComponentIfExists(entity, ComponentType.Position);
      expect(position).toBeDefined();
      expect(position!.x).toBe(49);
      expect(position!.y).toBe(49);
    });
  });

  describe('Entity Collision', () => {
    it('should not move entity when target position is occupied by non-movable, non-pickable entity', () => {
      const movingEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 5, y: 5 },
          [ComponentType.Velocity]: { vx: 1, vy: 0 },
        },
      });

      const blockingEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 6, y: 5 },
        },
      });

      setupEntities([movingEntity, blockingEntity]);
      system.update(updateArgs);

      const updatedMovingEntity = getUpdatedEntity(movingEntity);
      const position = getComponentIfExists(
        updatedMovingEntity,
        ComponentType.Position,
      );
      expect(position).toBeDefined();
      expect(position!.x).toBe(5); // Should not move
      expect(position!.y).toBe(5);

      // Velocity should be reset
      const velocity = getComponentIfExists(
        updatedMovingEntity,
        ComponentType.Velocity,
      );
      expect(velocity!.vx).toBe(0);
      expect(velocity!.vy).toBe(0);
    });

    it('should move entity when target position has pickable entity', () => {
      const movingEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 5, y: 5 },
          [ComponentType.Velocity]: { vx: 1, vy: 0 },
        },
      });

      const pickableEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 6, y: 5 },
          [ComponentType.Pickable]: {},
        },
      });

      setupEntities([movingEntity, pickableEntity]);
      system.update(updateArgs);

      const updatedMovingEntity = getUpdatedEntity(movingEntity);
      const position = getComponentIfExists(
        updatedMovingEntity,
        ComponentType.Position,
      );
      expect(position).toBeDefined();
      expect(position!.x).toBe(6); // Should move successfully
      expect(position!.y).toBe(5);
    });

    it('should push movable entity when target position is occupied by movable entity', () => {
      const movingEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 5, y: 5 },
          [ComponentType.Velocity]: { vx: 1, vy: 0 },
        },
      });

      const movableEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 6, y: 5 },
          [ComponentType.Movable]: {},
        },
      });

      setupEntities([movingEntity, movableEntity]);
      system.update(updateArgs);

      // Moving entity should move to target position
      const updatedMovingEntity = getUpdatedEntity(movingEntity);
      const movingPosition = getComponentIfExists(
        updatedMovingEntity,
        ComponentType.Position,
      );
      expect(movingPosition).toBeDefined();
      expect(movingPosition!.x).toBe(6);
      expect(movingPosition!.y).toBe(5);

      // Movable entity should be pushed to new position
      const updatedMovableEntity = getUpdatedEntity(movableEntity);
      const movablePosition = getComponentIfExists(
        updatedMovableEntity,
        ComponentType.Position,
      );
      expect(movablePosition).toBeDefined();
      expect(movablePosition!.x).toBe(7); // Pushed in same direction
      expect(movablePosition!.y).toBe(5);
    });

    it('should not move entity when movable entity cannot be pushed due to invalid position', () => {
      const movingEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 48, y: 5 },
          [ComponentType.Velocity]: { vx: 1, vy: 0 },
        },
      });

      const movableEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 49, y: 5 }, // Near map edge
          [ComponentType.Movable]: {},
        },
      });

      setupEntities([movingEntity, movableEntity]);
      system.update(updateArgs);

      // Neither entity should move
      const updatedMovingEntity = getUpdatedEntity(movingEntity);
      const movingPosition = getComponentIfExists(
        updatedMovingEntity,
        ComponentType.Position,
      );
      expect(movingPosition!.x).toBe(48);
      expect(movingPosition!.y).toBe(5);

      const updatedMovableEntity = getUpdatedEntity(movableEntity);
      const movablePosition = getComponentIfExists(
        updatedMovableEntity,
        ComponentType.Position,
      );
      expect(movablePosition!.x).toBe(49);
      expect(movablePosition!.y).toBe(5);

      // Velocity should be reset
      const velocity = getComponentIfExists(
        updatedMovingEntity,
        ComponentType.Velocity,
      );
      expect(velocity!.vx).toBe(0);
    });

    it('should not move entity when movable entity cannot be pushed due to entity blocking push target', () => {
      const movingEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 5, y: 5 },
          [ComponentType.Velocity]: { vx: 1, vy: 0 },
        },
      });

      const movableEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 6, y: 5 },
          [ComponentType.Movable]: {},
        },
      });

      const blockingEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 7, y: 5 }, // Blocks push target
        },
      });

      entities = [movingEntity, movableEntity, blockingEntity];

      updateArgs = createStandardUpdateArgs(entities);
      system.update(updateArgs);

      // No entities should move
      const movingPosition = getComponentIfExists(
        movingEntity,
        ComponentType.Position,
      );
      expect(movingPosition!.x).toBe(5);

      const movablePosition = getComponentIfExists(
        movableEntity,
        ComponentType.Position,
      );
      expect(movablePosition!.x).toBe(6);

      const blockingPosition = getComponentIfExists(
        blockingEntity,
        ComponentType.Position,
      );
      expect(blockingPosition!.x).toBe(7);
    });
  });

  describe('Complex Movement Scenarios', () => {
    it('should handle multiple entities moving simultaneously', () => {
      const entity1 = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 1, y: 1 },
          [ComponentType.Velocity]: { vx: 1, vy: 0 },
        },
      });

      const entity2 = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 10, y: 10 },
          [ComponentType.Velocity]: { vx: 0, vy: -1 },
        },
      });

      setupEntities([entity1, entity2]);
      system.update(updateArgs);

      const updatedEntity1 = getUpdatedEntity(entity1);
      const position1 = getComponentIfExists(
        updatedEntity1,
        ComponentType.Position,
      );
      expect(position1!.x).toBe(2);
      expect(position1!.y).toBe(1);

      const updatedEntity2 = getUpdatedEntity(entity2);
      const position2 = getComponentIfExists(
        updatedEntity2,
        ComponentType.Position,
      );
      expect(position2!.x).toBe(10);
      expect(position2!.y).toBe(9);

      // Both velocities should be reset
      const velocity1 = getComponentIfExists(
        updatedEntity1,
        ComponentType.Velocity,
      );
      const velocity2 = getComponentIfExists(
        updatedEntity2,
        ComponentType.Velocity,
      );
      expect(velocity1!.vx).toBe(0);
      expect(velocity2!.vy).toBe(0);
    });

    it('should handle diagonal movement correctly', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 10, y: 10 },
          [ComponentType.Velocity]: { vx: -2, vy: 3 },
        },
      });

      setupEntities([entity]);
      system.update(updateArgs);

      const updatedEntity = getUpdatedEntity(entity);
      const position = getComponentIfExists(
        updatedEntity,
        ComponentType.Position,
      );
      expect(position!.x).toBe(8);
      expect(position!.y).toBe(13);
    });

    it('should handle entity with both movable and pickable components correctly', () => {
      const movingEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 5, y: 5 },
          [ComponentType.Velocity]: { vx: 1, vy: 0 },
        },
      });

      const targetEntity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 6, y: 5 },
          [ComponentType.Movable]: {},
          [ComponentType.Pickable]: {},
        },
      });

      setupEntities([movingEntity, targetEntity]);
      system.update(updateArgs);

      // Should move successfully since target has pickable component
      const updatedMovingEntity = getUpdatedEntity(movingEntity);
      const movingPosition = getComponentIfExists(
        updatedMovingEntity,
        ComponentType.Position,
      );
      expect(movingPosition!.x).toBe(6);
      expect(movingPosition!.y).toBe(5);
    });
  });

  describe('Edge Cases and Invalid Inputs', () => {
    it('should handle empty entities array gracefully', () => {
      entities = [];
      updateArgs = createStandardUpdateArgs(entities);

      expect(() => system.update(updateArgs)).not.toThrow();
    });

    it('should handle null or undefined entities gracefully', () => {
      updateArgs = {
        entities: null as any,
        map: createStandardUpdateArgs([]).map,
        time: undefined,
      };

      expect(() => system.update(updateArgs)).not.toThrow();
    });

    it('should handle null or undefined map gracefully', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 5, y: 5 },
          [ComponentType.Velocity]: { vx: 1, vy: 0 },
        },
      });
      entities = [entity];

      updateArgs = { entities, map: null as any, time: undefined };

      expect(() => system.update(updateArgs)).not.toThrow();

      // Entity should remain unchanged
      const position = getComponentIfExists(entity, ComponentType.Position);
      expect(position!.x).toBe(5);
      expect(position!.y).toBe(5);
    });

    it('should handle fractional velocity values correctly', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 5, y: 5 },
          [ComponentType.Velocity]: { vx: 2.7, vy: -1.3 },
        },
      });

      setupEntities([entity]);
      system.update(updateArgs);

      const updatedEntity = getUpdatedEntity(entity);
      const position = getComponentIfExists(
        updatedEntity,
        ComponentType.Position,
      );
      expect(position!.x).toBe(7.7); // 5 + 2.7
      expect(position!.y).toBe(3.7); // 5 + (-1.3)
    });

    it('should handle very large velocity values when blocked by boundaries', () => {
      const entity = createEntityFromTemplate({
        components: {
          [ComponentType.Position]: { x: 5, y: 5 },
          [ComponentType.Velocity]: { vx: 1000, vy: -500 },
        },
      });

      setupEntities([entity]);
      system.update(updateArgs);

      // Movement should be blocked by map boundaries
      const updatedEntity = getUpdatedEntity(entity);
      const position = getComponentIfExists(
        updatedEntity,
        ComponentType.Position,
      );
      expect(position!.x).toBe(5);
      expect(position!.y).toBe(5);

      // Velocity should still be reset
      const velocity = getComponentIfExists(
        updatedEntity,
        ComponentType.Velocity,
      );
      expect(velocity!.vx).toBe(0);
      expect(velocity!.vy).toBe(0);
    });
  });
});

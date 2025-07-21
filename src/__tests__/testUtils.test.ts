import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTestEntity,
  createTestComponent,
  createEntityWithComponents,
  expectEntityHasComponent,
  expectEntityDoesNotHaveComponent,
  expectComponentProps,
  createTestUpdateArgs,
  createMockGameMap,
  cleanupTestState,
  createTestEnvironment,
  findEntitiesWithComponents,
  createMultipleTestEntities,
} from './testUtils';
import { ComponentType } from '../game/components/ComponentTypes';

describe('ECS Test Utilities', () => {
  beforeEach(() => {
    cleanupTestState();
  });

  describe('Entity Factory Functions', () => {
    it('should create a test entity with no components', () => {
      const entity = createTestEntity();

      expect(entity).toBeDefined();
      expect(entity.id).toBeDefined();
      expect(entity.components).toEqual({});
    });

    it('should create a test entity with provided components', () => {
      const positionComponent = createTestComponent(ComponentType.Position, {
        x: 5,
        y: 10,
      });
      const entity = createTestEntity({
        [ComponentType.Position]: positionComponent,
      });

      expect(entity.components[ComponentType.Position]).toBe(positionComponent);
    });

    it('should create test components of all types', () => {
      const positionComponent = createTestComponent(ComponentType.Position, {
        x: 1,
        y: 2,
      });
      expect(positionComponent.type).toBe(ComponentType.Position);
      expect(positionComponent.x).toBe(1);
      expect(positionComponent.y).toBe(2);

      const playerComponent = createTestComponent(ComponentType.Player);
      expect(playerComponent.type).toBe(ComponentType.Player);

      const velocityComponent = createTestComponent(ComponentType.Velocity, {
        vx: 3,
        vy: 4,
      });
      expect(velocityComponent.type).toBe(ComponentType.Velocity);
      expect(velocityComponent.vx).toBe(3);
      expect(velocityComponent.vy).toBe(4);
    });

    it('should create entity with multiple components using factory', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 10 }],
        [ComponentType.Player, {}],
        [ComponentType.Movable, {}],
      ]);

      expect(entity.components[ComponentType.Position]).toBeDefined();
      expect(entity.components[ComponentType.Player]).toBeDefined();
      expect(entity.components[ComponentType.Movable]).toBeDefined();
    });
  });

  describe('Component Assertion Helpers', () => {
    it('should correctly assert entity has component', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 0, y: 0 }],
      ]);

      expect(() =>
        expectEntityHasComponent(entity, ComponentType.Position),
      ).not.toThrow();
      expect(() =>
        expectEntityHasComponent(entity, ComponentType.Player),
      ).toThrow();
    });

    it('should correctly assert entity does not have component', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 0, y: 0 }],
      ]);

      expect(() =>
        expectEntityDoesNotHaveComponent(entity, ComponentType.Player),
      ).not.toThrow();
      expect(() =>
        expectEntityDoesNotHaveComponent(entity, ComponentType.Position),
      ).toThrow();
    });

    it('should correctly assert component properties', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 10 }],
      ]);

      expect(() =>
        expectComponentProps(entity, ComponentType.Position, { x: 5, y: 10 }),
      ).not.toThrow();
      expect(() =>
        expectComponentProps(entity, ComponentType.Position, { x: 999 }),
      ).toThrow();
    });
  });

  describe('System Testing Utilities', () => {
    it('should create test update args', () => {
      const entities = [createTestEntity()];
      const updateArgs = createTestUpdateArgs(entities);

      expect(updateArgs.entities).toBe(entities);
      expect(updateArgs.map).toBeDefined();
      expect(updateArgs.time).toBeDefined();
    });

    it('should create mock game map', () => {
      const map = createMockGameMap(5, 5);

      expect(map).toBeDefined();
      expect(map.id).toBeDefined();
      expect(map.isPositionInMap).toBeDefined();
      expect(map.getTile).toBeDefined();
    });

    it('should create mock game map with entities', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 2, y: 3 }],
      ]);

      const map = createMockGameMap(5, 5, [entity]);

      expect(map).toBeDefined();
      expect(map.getTile).toBeDefined();
      expect(map.getAllEntities()).toContain(entity);
    });
  });

  describe('Test Environment', () => {
    it('should create isolated test environment', () => {
      const env = createTestEnvironment();

      expect(env.addEntity).toBeDefined();
      expect(env.removeEntity).toBeDefined();
      expect(env.getEntities).toBeDefined();
      expect(env.setMap).toBeDefined();
      expect(env.cleanup).toBeDefined();
    });

    it('should manage entities in test environment', () => {
      const env = createTestEnvironment();
      const entity = createTestEntity();

      env.addEntity(entity);
      expect(env.getEntities()).toHaveLength(1);
      expect(env.getEntities()[0]).toBe(entity);

      env.removeEntity(entity.id);
      expect(env.getEntities()).toHaveLength(0);
    });
  });

  describe('Advanced Utilities', () => {
    it('should create multiple test entities', () => {
      const entities = createMultipleTestEntities(3, (index) => ({
        [ComponentType.Position]: createTestComponent(ComponentType.Position, {
          x: index,
          y: 0,
        }),
      }));

      expect(entities).toHaveLength(3);
      entities.forEach((entity, index) => {
        expectEntityHasComponent(entity, ComponentType.Position);
        expectComponentProps(entity, ComponentType.Position, {
          x: index,
          y: 0,
        });
      });
    });

    it('should find entities with specific components', () => {
      const entities = [
        createEntityWithComponents([[ComponentType.Position, { x: 0, y: 0 }]]),
        createEntityWithComponents([
          [ComponentType.Position, { x: 1, y: 1 }],
          [ComponentType.Player, {}],
        ]),
        createEntityWithComponents([[ComponentType.Player, {}]]),
      ];

      const entitiesWithPosition = findEntitiesWithComponents(
        entities,
        ComponentType.Position,
      );
      expect(entitiesWithPosition).toHaveLength(2);

      const entitiesWithBoth = findEntitiesWithComponents(
        entities,
        ComponentType.Position,
        ComponentType.Player,
      );
      expect(entitiesWithBoth).toHaveLength(1);
    });
  });
});

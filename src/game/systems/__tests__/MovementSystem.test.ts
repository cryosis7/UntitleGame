import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MovementSystem } from '../MovementSystem';
import { ComponentType } from '../../components/ComponentTypes';
import { createTestUpdateArgs, createMockGameMap, createEntityWithComponents } from '../../../__tests__/testUtils';
import { getComponentIfExists, setComponent } from '../../components/ComponentOperations';
import { PositionComponent } from '../../components/individualComponents/PositionComponent';
import type { Entity } from '../../utils/ecsUtils';

// Mock ComponentOperations to work with test entities directly
vi.mock('../../components/ComponentOperations', async () => {
  const actual = await vi.importActual('../../components/ComponentOperations');
  
  return {
    ...actual,
    setComponent: vi.fn((entity: Entity, component: any) => {
      // For testing, directly modify the entity's components
      (entity.components as any)[component.type] = component;
    })
  };
});

// Global variable to track current test entities for EntityUtils mock
let currentTestEntities: Entity[] = [];

// Mock EntityUtils to work with test entities directly  
vi.mock('../../utils/EntityUtils', async () => {
  const actual = await vi.importActual('../../utils/EntityUtils');
  
  return {
    ...actual,
    hasEntitiesAtPosition: vi.fn((position: { x: number; y: number }) => {
      const result = currentTestEntities.some(entity => {
        const positionComponent = entity.components.position as any;
        return positionComponent?.x === position.x && positionComponent?.y === position.y;
      });
      return result;
    }),
    getEntitiesAtPosition: vi.fn((position: { x: number; y: number }, entities?: Entity[]) => {
      const entitiesToCheck = entities || currentTestEntities;
      return entitiesToCheck.filter(entity => {
        const positionComponent = entity.components.position as any;
        return positionComponent?.x === position.x && positionComponent?.y === position.y;
      });
    })
  };
});

// Helper function to update the test entities context
function setCurrentTestEntities(entities: Entity[]) {
  currentTestEntities = entities;
}

describe('MovementSystem', () => {
  let system: MovementSystem;
  let updateArgs: ReturnType<typeof createTestUpdateArgs>;

  beforeEach(() => {
    system = new MovementSystem();
  });

  describe('Entity Position Updates', () => {
    it('manual setComponent test for position', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Velocity, { vx: 1, vy: -1 }]
      ]);
      
      // Test manual setComponent calls directly
      console.log('Initial position:', getComponentIfExists(entity, ComponentType.Position));
      
      // Test setting velocity component
      setComponent(entity, { type: ComponentType.Velocity, vx: 99, vy: 88 });
      const velocityAfterSet = getComponentIfExists(entity, ComponentType.Velocity);
      console.log('After setting velocity:', velocityAfterSet);
      expect(velocityAfterSet?.vx).toBe(99);
      expect(velocityAfterSet?.vy).toBe(88);
      
      // Test setting position component
      setComponent(entity, new PositionComponent({ x: 77, y: 66 }));
      const positionAfterSet = getComponentIfExists(entity, ComponentType.Position);
      console.log('After setting position:', positionAfterSet);
      expect(positionAfterSet?.x).toBe(77);
      expect(positionAfterSet?.y).toBe(66);
    });

    it('should update entity position based on velocity', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Velocity, { vx: 1, vy: -1 }]
      ]);
      
      // Test that setComponent mock is working by manually setting a position
      const testPosition = new PositionComponent({ x: 99, y: 99 });
      setComponent(entity, testPosition);
      
      // Verify the manual setComponent worked
      const manualSetPosition = getComponentIfExists(entity, ComponentType.Position);
      expect(manualSetPosition?.x).toBe(99);
      expect(manualSetPosition?.y).toBe(99);
      
      // Reset position for actual test
      const originalPosition = new PositionComponent({ x: 5, y: 5 });
      setComponent(entity, originalPosition);
      
      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      system.update(updateArgs);

      const position = getComponentIfExists(entity, ComponentType.Position);
      expect(position?.x).toBe(6);
      expect(position?.y).toBe(4);
    });

    it('should reset velocity to zero after processing', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 0, y: 0 }],
        [ComponentType.Velocity, { vx: 2, vy: 3 }]
      ]);
      
      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      system.update(updateArgs);

      const velocity = getComponentIfExists(entity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(0);
      expect(velocity?.vy).toBe(0);
    });

    it('should not move entity if velocity is zero', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Velocity, { vx: 0, vy: 0 }]
      ]);
      
      const originalPosition = getComponentIfExists(entity, ComponentType.Position);
      
      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      system.update(updateArgs);

      const newPosition = getComponentIfExists(entity, ComponentType.Position);
      expect(newPosition?.x).toBe(originalPosition?.x);
      expect(newPosition?.y).toBe(originalPosition?.y);
    });

    it('should not move entity without position component', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Velocity, { vx: 1, vy: 1 }]
      ]);
      
      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      
      expect(() => {
        system.update(updateArgs);
      }).not.toThrow();
      
      const velocity = getComponentIfExists(entity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(1); // Should remain unchanged
      expect(velocity?.vy).toBe(1);
    });

    it('should not move entity without velocity component', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }]
      ]);
      
      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      
      expect(() => {
        system.update(updateArgs);
      }).not.toThrow();
      
      const position = getComponentIfExists(entity, ComponentType.Position);
      expect(position?.x).toBe(5); // Should remain unchanged
      expect(position?.y).toBe(5);
    });
  });

  describe('Collision Detection and Validation', () => {
    it('should prevent movement to invalid map positions', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 9, y: 9 }], // At edge of default 10x10 map
        [ComponentType.Velocity, { vx: 1, vy: 1 }] // Would move to (10, 10) which is out of bounds
      ]);
      
      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      system.update(updateArgs);

      // Position should remain unchanged due to invalid destination
      const position = getComponentIfExists(entity, ComponentType.Position);
      expect(position?.x).toBe(9);
      expect(position?.y).toBe(9);
      
      // Velocity should be reset to zero
      const velocity = getComponentIfExists(entity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(0);
      expect(velocity?.vy).toBe(0);
    });

    it('should allow movement through pickable entities', () => {
      const movingEntity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Velocity, { vx: 1, vy: 0 }]
      ]);
      
      const pickableEntity = createEntityWithComponents([
        [ComponentType.Position, { x: 6, y: 5 }],
        [ComponentType.Pickable, {}]
      ]);
      
      updateArgs = createTestUpdateArgs([movingEntity, pickableEntity], createMockGameMap());
      system.update(updateArgs);

      const position = getComponentIfExists(movingEntity, ComponentType.Position);
      expect(position?.x).toBe(6);
      expect(position?.y).toBe(5);
    });

    it('should prevent movement when blocked by immovable entity', () => {
      const movingEntity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Velocity, { vx: 1, vy: 0 }]
      ]);
      
      const blockingEntity = createEntityWithComponents([
        [ComponentType.Position, { x: 6, y: 5 }]
        // No Movable or Pickable component, so it blocks movement
      ]);
      
      updateArgs = createTestUpdateArgs([movingEntity, blockingEntity], createMockGameMap());
      system.update(updateArgs);

      // Movement should be blocked
      const position = getComponentIfExists(movingEntity, ComponentType.Position);
      expect(position?.x).toBe(5);
      expect(position?.y).toBe(5);
      
      // Velocity should be reset
      const velocity = getComponentIfExists(movingEntity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(0);
      expect(velocity?.vy).toBe(0);
    });

    it('should push movable entities when possible', () => {
      const pushingEntity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Velocity, { vx: 1, vy: 0 }]
      ]);
      
      const movableEntity = createEntityWithComponents([
        [ComponentType.Position, { x: 6, y: 5 }],
        [ComponentType.Movable, {}]
      ]);
      
      updateArgs = createTestUpdateArgs([pushingEntity, movableEntity], createMockGameMap());
      system.update(updateArgs);

      // Both entities should move
      const pushingPosition = getComponentIfExists(pushingEntity, ComponentType.Position);
      expect(pushingPosition?.x).toBe(6);
      expect(pushingPosition?.y).toBe(5);
      
      const movablePosition = getComponentIfExists(movableEntity, ComponentType.Position);
      expect(movablePosition?.x).toBe(7);
      expect(movablePosition?.y).toBe(5);
    });

    it('should prevent pushing when movable entity cannot move', () => {
      const pushingEntity = createEntityWithComponents([
        [ComponentType.Position, { x: 8, y: 5 }], // Near edge of default 10x10 map
        [ComponentType.Velocity, { vx: 1, vy: 0 }]
      ]);
      
      const movableEntity = createEntityWithComponents([
        [ComponentType.Position, { x: 9, y: 5 }], // At edge - pushing would move it to (10, 5) which is out of bounds
        [ComponentType.Movable, {}]
      ]);
      
      updateArgs = createTestUpdateArgs([pushingEntity, movableEntity], createMockGameMap());
      system.update(updateArgs);

      // Neither entity should move due to out-of-bounds destination
      const pushingPosition = getComponentIfExists(pushingEntity, ComponentType.Position);
      expect(pushingPosition?.x).toBe(8);
      expect(pushingPosition?.y).toBe(5);
      
      const movablePosition = getComponentIfExists(movableEntity, ComponentType.Position);
      expect(movablePosition?.x).toBe(9);
      expect(movablePosition?.y).toBe(5);
      
      // Velocity should be reset
      const velocity = getComponentIfExists(pushingEntity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(0);
      expect(velocity?.vy).toBe(0);
    });
  });

  describe('System Edge Cases and Validation', () => {
    it('should handle empty entities array', () => {
      updateArgs = createTestUpdateArgs([], createMockGameMap());
      
      expect(() => {
        system.update(updateArgs);
      }).not.toThrow();
    });

    it('should handle null/undefined entities', () => {
      updateArgs = createTestUpdateArgs(null as any, createMockGameMap());
      
      expect(() => {
        system.update(updateArgs);
      }).not.toThrow();
    });

    it('should handle null/undefined map', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Velocity, { vx: 1, vy: 1 }]
      ]);
      
      updateArgs = createTestUpdateArgs([entity], null as any);
      
      expect(() => {
        system.update(updateArgs);
      }).not.toThrow();
    });

    it('should handle multiple entities with complex interactions', () => {
      const entities = [
        // Moving entity
        createEntityWithComponents([
          [ComponentType.Position, { x: 0, y: 0 }],
          [ComponentType.Velocity, { vx: 1, vy: 0 }]
        ]),
        // Stationary movable entity to be pushed
        createEntityWithComponents([
          [ComponentType.Position, { x: 1, y: 0 }],
          [ComponentType.Movable, {}]
        ]),
        // Pickable entity that can be walked through
        createEntityWithComponents([
          [ComponentType.Position, { x: 2, y: 0 }],
          [ComponentType.Pickable, {}]
        ]),
        // Another moving entity
        createEntityWithComponents([
          [ComponentType.Position, { x: 10, y: 10 }],
          [ComponentType.Velocity, { vx: -1, vy: -1 }]
        ])
      ];
      
      updateArgs = createTestUpdateArgs(entities, createMockGameMap());
      system.update(updateArgs);

      // First entity should move and push the movable entity
      const firstPosition = getComponentIfExists(entities[0], ComponentType.Position);
      expect(firstPosition?.x).toBe(1);
      
      // Movable entity should be pushed
      const movablePosition = getComponentIfExists(entities[1], ComponentType.Position);
      expect(movablePosition?.x).toBe(2);
      
      // Fourth entity should move independently
      const fourthPosition = getComponentIfExists(entities[3], ComponentType.Position);
      expect(fourthPosition?.x).toBe(9);
      expect(fourthPosition?.y).toBe(9);
      
      // All velocities should be reset
      entities.forEach((entity, index) => {
        const velocity = getComponentIfExists(entity, ComponentType.Velocity);
        if (velocity) {
          expect(velocity.vx).toBe(0);
          expect(velocity.vy).toBe(0);
        }
      });
    });

    it('should handle diagonal movement correctly', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Velocity, { vx: 1, vy: 1 }]
      ]);
      
      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      system.update(updateArgs);

      const position = getComponentIfExists(entity, ComponentType.Position);
      expect(position?.x).toBe(6);
      expect(position?.y).toBe(6);
    });

    it('should handle negative velocity correctly', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Velocity, { vx: -2, vy: -3 }]
      ]);
      
      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      system.update(updateArgs);

      const position = getComponentIfExists(entity, ComponentType.Position);
      expect(position?.x).toBe(3);
      expect(position?.y).toBe(2);
    });
  });
});

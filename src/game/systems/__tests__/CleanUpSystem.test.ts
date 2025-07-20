import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CleanUpSystem } from '../CleanUpSystem';
import { ComponentType } from '../../components/ComponentTypes';
import { createTestUpdateArgs, createMockGameMap, createEntityWithComponents } from '../../../__tests__/testUtils';
import type { Entity } from '../../utils/ecsUtils';

// Mock ComponentOperations to work with test entities directly
vi.mock('../../components/ComponentOperations', async () => {
  const actual = await vi.importActual('../../components/ComponentOperations');
  
  return {
    ...actual,
    removeComponent: vi.fn((entity: Entity, componentType: string) => {
      // For testing, directly remove the component
      delete (entity.components as any)[componentType];
    })
  };
});

// Mock EntityUtils
vi.mock('../../utils/EntityUtils', async () => {
  const actual = await vi.importActual('../../utils/EntityUtils');
  
  return {
    ...actual,
    getEntitiesWithComponent: vi.fn((componentType: string, entities: Entity[]) => {
      return entities.filter(entity => (entity.components as any)[componentType]);
    })
  };
});

const { removeComponent } = await import('../../components/ComponentOperations');
const { getEntitiesWithComponent } = await import('../../utils/EntityUtils');

describe('CleanUpSystem', () => {
  let system: CleanUpSystem;
  let updateArgs: ReturnType<typeof createTestUpdateArgs>;

  beforeEach(() => {
    system = new CleanUpSystem();
    vi.clearAllMocks();
  });

  describe('Entity Cleanup Operations', () => {
    it('should remove interacting components from entities', () => {
      const entity1 = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 5, y: 5 }]
      ]);

      const entity2 = createEntityWithComponents([
        [ComponentType.Pickable, { item: 'test' }],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 3, y: 3 }]
      ]);

      updateArgs = createTestUpdateArgs([entity1, entity2], createMockGameMap());
      
      system.update(updateArgs);

      expect(getEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Interacting, [entity1, entity2]);
      expect(removeComponent).toHaveBeenCalledWith(entity1, ComponentType.Interacting);
      expect(removeComponent).toHaveBeenCalledWith(entity2, ComponentType.Interacting);
    });

    it('should handle entities without interacting components', () => {
      const entity1 = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 5, y: 5 }]
      ]);

      const entity2 = createEntityWithComponents([
        [ComponentType.Pickable, { item: 'test' }],
        [ComponentType.Position, { x: 3, y: 3 }]
      ]);

      updateArgs = createTestUpdateArgs([entity1, entity2], createMockGameMap());
      
      system.update(updateArgs);

      expect(getEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Interacting, [entity1, entity2]);
      expect(removeComponent).not.toHaveBeenCalled();
    });

    it('should handle mixed entities (some with, some without interacting)', () => {
      const entityWithInteracting = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 5, y: 5 }]
      ]);

      const entityWithoutInteracting = createEntityWithComponents([
        [ComponentType.Pickable, { item: 'test' }],
        [ComponentType.Position, { x: 3, y: 3 }]
      ]);

      updateArgs = createTestUpdateArgs([entityWithInteracting, entityWithoutInteracting], createMockGameMap());
      
      system.update(updateArgs);

      expect(getEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Interacting, [entityWithInteracting, entityWithoutInteracting]);
      expect(removeComponent).toHaveBeenCalledTimes(1);
      expect(removeComponent).toHaveBeenCalledWith(entityWithInteracting, ComponentType.Interacting);
    });
  });

  describe('System Entity Filtering', () => {
    it('should properly filter entities by interacting component', () => {
      const entities = [
        createEntityWithComponents([[ComponentType.Player, {}]]),
        createEntityWithComponents([[ComponentType.Interacting, {}]]),
        createEntityWithComponents([[ComponentType.Position, { x: 0, y: 0 }]]),
        createEntityWithComponents([[ComponentType.Interacting, {}], [ComponentType.Player, {}]])
      ];

      updateArgs = createTestUpdateArgs(entities, createMockGameMap());
      
      system.update(updateArgs);

      expect(getEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Interacting, entities);
    });

    it('should handle entities with multiple components correctly', () => {
      const complexEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Velocity, { vx: 1, vy: 0 }],
        [ComponentType.Sprite, { sprite: 'player' }]
      ]);

      updateArgs = createTestUpdateArgs([complexEntity], createMockGameMap());
      
      system.update(updateArgs);

      // Should only remove the interacting component, leaving others intact
      expect(removeComponent).toHaveBeenCalledWith(complexEntity, ComponentType.Interacting);
      expect(removeComponent).toHaveBeenCalledTimes(1);
    });

    it('should process all interacting entities in a single update', () => {
      const multipleInteractingEntities = [
        createEntityWithComponents([[ComponentType.Interacting, {}], [ComponentType.Player, {}]]),
        createEntityWithComponents([[ComponentType.Interacting, {}], [ComponentType.Pickable, { item: 'item1' }]]),
        createEntityWithComponents([[ComponentType.Interacting, {}], [ComponentType.Position, { x: 1, y: 1 }]]),
        createEntityWithComponents([[ComponentType.Position, { x: 2, y: 2 }]]), // No interacting component
      ];

      updateArgs = createTestUpdateArgs(multipleInteractingEntities, createMockGameMap());
      
      system.update(updateArgs);

      expect(removeComponent).toHaveBeenCalledTimes(3); // Only the 3 entities with interacting components
      expect(removeComponent).toHaveBeenCalledWith(multipleInteractingEntities[0], ComponentType.Interacting);
      expect(removeComponent).toHaveBeenCalledWith(multipleInteractingEntities[1], ComponentType.Interacting);
      expect(removeComponent).toHaveBeenCalledWith(multipleInteractingEntities[2], ComponentType.Interacting);
    });
  });

  describe('System Edge Cases', () => {
    it('should handle empty entities array', () => {
      updateArgs = createTestUpdateArgs([], createMockGameMap());
      
      expect(() => system.update(updateArgs)).not.toThrow();
      expect(getEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Interacting, []);
      expect(removeComponent).not.toHaveBeenCalled();
    });

    it('should handle null/undefined entities array', () => {
      const mockGameMap = createMockGameMap();
      updateArgs = { entities: null as any, map: mockGameMap as any };
      
      expect(() => system.update(updateArgs)).not.toThrow();
      // Should return early and not call any functions
      expect(getEntitiesWithComponent).not.toHaveBeenCalled();
      expect(removeComponent).not.toHaveBeenCalled();
    });

    it('should handle undefined entities array', () => {
      const mockGameMap = createMockGameMap();
      updateArgs = { entities: undefined as any, map: mockGameMap as any };
      
      expect(() => system.update(updateArgs)).not.toThrow();
      // Should return early and not call any functions
      expect(getEntitiesWithComponent).not.toHaveBeenCalled();
      expect(removeComponent).not.toHaveBeenCalled();
    });

    it('should handle entities with null/undefined components', () => {
      const entityWithNullComponents = {
        id: 'test-entity',
        components: null
      } as any;

      // The mock EntityUtils should handle this gracefully
      (getEntitiesWithComponent as any).mockImplementation(() => []); // Return empty array for null components

      updateArgs = createTestUpdateArgs([entityWithNullComponents], createMockGameMap());
      
      expect(() => system.update(updateArgs)).not.toThrow();
      expect(getEntitiesWithComponent).toHaveBeenCalled();
    });
  });

  describe('Component Cleanup Verification', () => {
    it('should ensure interacting components are actually removed', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}]
      ]);

      // Verify component exists before cleanup
      expect((entity.components as any)[ComponentType.Interacting]).toBeDefined();

      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      
      system.update(updateArgs);

      // Verify component was removed (our mock actually removes it)
      expect((entity.components as any)[ComponentType.Interacting]).toBeUndefined();
    });

    it('should preserve other components while removing interacting', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 10, y: 20 }]
      ]);

      const originalPlayer = (entity.components as any)[ComponentType.Player];
      const originalPosition = (entity.components as any)[ComponentType.Position];

      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      
      system.update(updateArgs);

      // Verify other components are preserved
      expect((entity.components as any)[ComponentType.Player]).toBe(originalPlayer);
      expect((entity.components as any)[ComponentType.Position]).toBe(originalPosition);
      
      // Verify interacting component was removed
      expect((entity.components as any)[ComponentType.Interacting]).toBeUndefined();
    });

    it('should handle cleanup idempotently', () => {
      const entity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}]
      ]);

      updateArgs = createTestUpdateArgs([entity], createMockGameMap());
      
      // Run cleanup twice
      system.update(updateArgs);
      system.update(updateArgs);

      // Should not cause errors and component should remain removed
      expect((entity.components as any)[ComponentType.Interacting]).toBeUndefined();
    });
  });
});

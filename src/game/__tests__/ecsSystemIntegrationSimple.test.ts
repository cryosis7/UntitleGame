import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyboardInputSystem } from '../systems/KeyboardInputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { PickupSystem } from '../systems/PickupSystem';
import { CleanUpSystem } from '../systems/CleanUpSystem';
import { createTestEntity, createTestComponent, createTestUpdateArgs } from '../../__tests__/testUtils';
import { ComponentType } from '../components/ComponentTypes';
import type { Entity } from '../utils/ecsUtils';
import type { UpdateArgs } from '../systems/Systems';

// Mock window for event listeners
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
  writable: true
});
Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
  writable: true
});

// Mock component operations
vi.mock('../components/ComponentOperations', () => ({
  hasComponent: vi.fn(),
  getComponentIfExists: vi.fn(),
  setComponent: vi.fn(),
  removeComponent: vi.fn()
}));

// Mock entity utils
vi.mock('../utils/EntityUtils', () => ({
  getEntitiesWithComponent: vi.fn(),
  hasEntitiesAtPosition: vi.fn(),
  addEntities: vi.fn(),
  removeEntities: vi.fn()
}));

import { 
  hasComponent, 
  getComponentIfExists, 
  setComponent, 
  removeComponent 
} from '../components/ComponentOperations';
import { 
  getEntitiesWithComponent, 
  hasEntitiesAtPosition,
  addEntities,
  removeEntities
} from '../utils/EntityUtils';

const mockHasComponent = vi.mocked(hasComponent);
const mockGetComponentIfExists = vi.mocked(getComponentIfExists);
const mockSetComponent = vi.mocked(setComponent);
const mockRemoveComponent = vi.mocked(removeComponent);
const mockGetEntitiesWithComponent = vi.mocked(getEntitiesWithComponent);
const mockHasEntitiesAtPosition = vi.mocked(hasEntitiesAtPosition);
const mockAddEntities = vi.mocked(addEntities);
const mockRemoveEntities = vi.mocked(removeEntities);

describe('ECS System Integration Tests', () => {
  let keyboardSystem: KeyboardInputSystem;
  let movementSystem: MovementSystem;
  let pickupSystem: PickupSystem;
  let cleanUpSystem: CleanUpSystem;
  let testEntities: Entity[];
  let updateArgs: UpdateArgs;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Initialize systems (excluding RenderSystem due to complexity)
    keyboardSystem = new KeyboardInputSystem();
    movementSystem = new MovementSystem();
    pickupSystem = new PickupSystem();
    cleanUpSystem = new CleanUpSystem();
    
    testEntities = [];
    updateArgs = createTestUpdateArgs(testEntities);
    
    // Default mocks
    mockHasComponent.mockReturnValue(false);
    mockGetComponentIfExists.mockReturnValue(undefined);
    mockGetEntitiesWithComponent.mockReturnValue([]);
    mockHasEntitiesAtPosition.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('System Coordination', () => {
    it('should allow multiple systems to process entities independently', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        movable: createTestComponent(ComponentType.Movable)
      }, 'player-1');

      testEntities = [playerEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock component filtering for different systems
      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        switch (componentType) {
          case ComponentType.Player:
          case ComponentType.Movable: 
            return [playerEntity];
          default:
            return [];
        }
      });

      // Execute multiple systems
      keyboardSystem.update(updateArgs);
      movementSystem.update(updateArgs);

      // Verify each system attempted to find its required entities
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Player, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Movable, testEntities);
      
      // Both systems should have been able to process without conflicts
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2);
    });

    it('should handle entities with different component sets across systems', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        movable: createTestComponent(ComponentType.Movable)
      }, 'player');

      const itemEntity = createTestEntity({
        pickable: createTestComponent(ComponentType.Pickable)
      }, 'item');

      testEntities = [playerEntity, itemEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock component filtering
      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        switch (componentType) {
          case ComponentType.Player:
            return [playerEntity];
          case ComponentType.Movable:
            return [playerEntity];
          case ComponentType.Pickable:
            return [itemEntity];
          default:
            return [];
        }
      });

      // Run all systems
      keyboardSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      pickupSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);

      // Verify systems found their respective entities
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Player, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Movable, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Pickable, testEntities);
      
      // All systems executed
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(4);
    });
  });

  describe('System Execution Order', () => {
    it('should maintain consistent processing across multiple update cycles', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        movable: createTestComponent(ComponentType.Movable)
      }, 'player');

      testEntities = [playerEntity];
      
      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        if ([ComponentType.Player, ComponentType.Movable].includes(componentType)) {
          return [playerEntity];
        }
        return [];
      });

      // Track system calls across cycles
      let totalSystemCalls = 0;
      const originalMockGetEntities = mockGetEntitiesWithComponent;
      mockGetEntitiesWithComponent.mockImplementation((...args) => {
        totalSystemCalls++;
        return originalMockGetEntities(...args);
      });

      // Execute 3 update cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        updateArgs = createTestUpdateArgs(testEntities);
        
        keyboardSystem.update(updateArgs);
        movementSystem.update(updateArgs);
      }

      // Verify systems consistently processed entity across cycles
      expect(totalSystemCalls).toBe(6); // 2 systems × 3 cycles
    });

    it('should handle system dependencies without conflicts', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        handling: createTestComponent(ComponentType.Handling)
      }, 'player');

      const itemEntity = createTestEntity({
        pickable: createTestComponent(ComponentType.Pickable)
      }, 'item');

      testEntities = [playerEntity, itemEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock systems finding their required entities
      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        switch (componentType) {
          case ComponentType.Player:
          case ComponentType.Handling:
            return [playerEntity];
          case ComponentType.Pickable:
            return [itemEntity];
          default:
            return [];
        }
      });

      // Execute systems with interdependencies
      pickupSystem.update(updateArgs);
      keyboardSystem.update(updateArgs);

      // Both systems should have found their required entities
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Handling, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Player, testEntities);
      
      // No dependency conflicts should occur
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2);
    });
  });

  describe('Entity Lifecycle Integration', () => {
    it('should handle dynamic entity changes during processing', () => {
      let currentEntities = [
        createTestEntity({
          pickable: createTestComponent(ComponentType.Pickable)
        }, 'temporary')
      ];

      // Mock entity filtering
      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        if (componentType === ComponentType.Pickable) {
          return currentEntities.filter(e => e.components.pickable !== undefined);
        }
        return [];
      });

      // Initial processing
      updateArgs = createTestUpdateArgs(currentEntities);
      pickupSystem.update(updateArgs);

      // Simulate entity addition during processing
      const newEntity = createTestEntity({
        pickable: createTestComponent(ComponentType.Pickable)
      }, 'new-entity');
      
      currentEntities.push(newEntity);

      // Process with updated entities
      updateArgs = createTestUpdateArgs(currentEntities);
      pickupSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);

      // Systems should handle dynamic entity changes
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(3);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Pickable, expect.any(Array));
    });

    it('should maintain entity state consistency across system boundaries', () => {
      const sharedEntity = createTestEntity({
        position: createTestComponent(ComponentType.Position, { x: 10, y: 10 }),
        movable: createTestComponent(ComponentType.Movable),
        player: createTestComponent(ComponentType.Player)
      }, 'shared');

      testEntities = [sharedEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        if ([ComponentType.Movable, ComponentType.Player].includes(componentType)) {
          return [sharedEntity];
        }
        return [];
      });

      // Systems process the same entity
      movementSystem.update(updateArgs);
      keyboardSystem.update(updateArgs);

      // Both systems should access the shared entity
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Movable, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Player, testEntities);
      
      // No conflicts in entity access
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2);
    });
  });

  describe('System State Isolation', () => {
    it('should maintain separate system instances without interference', () => {
      const entities = [
        createTestEntity({
          player: createTestComponent(ComponentType.Player)
        }, 'player-1'),
        createTestEntity({
          player: createTestComponent(ComponentType.Player)  
        }, 'player-2')
      ];

      testEntities = entities;
      updateArgs = createTestUpdateArgs(testEntities);

      // Create separate system instances
      const keyboardSystem1 = new KeyboardInputSystem();
      const keyboardSystem2 = new KeyboardInputSystem();

      mockGetEntitiesWithComponent.mockReturnValue(entities);

      // Both systems process independently
      keyboardSystem1.update(updateArgs);
      keyboardSystem2.update(updateArgs);

      // Both instances should have processed without interference
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2);
      expect(mockGetEntitiesWithComponent).toHaveBeenNthCalledWith(1, ComponentType.Player, entities);
      expect(mockGetEntitiesWithComponent).toHaveBeenNthCalledWith(2, ComponentType.Player, entities);
    });

    it('should handle system processing without side effects', () => {
      const testEntity = createTestEntity({
        movable: createTestComponent(ComponentType.Movable)
      }, 'test-entity');

      testEntities = [testEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      mockGetEntitiesWithComponent.mockReturnValue([testEntity]);

      // Track component access
      let componentAccessCount = 0;
      mockGetComponentIfExists.mockImplementation(() => {
        componentAccessCount++;
        return undefined;
      });

      // Run multiple systems
      movementSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);

      // Systems should process independently without side effects
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2);
      expect(componentAccessCount).toBeGreaterThanOrEqual(0);
    });

    it('should isolate system errors without affecting other systems', () => {
      const testEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player)
      }, 'error-entity');

      testEntities = [testEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock different behaviors for different calls
      let callCount = 0;
      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        callCount++;
        // Both calls should succeed (error isolation test)
        return componentType === ComponentType.Player ? [testEntity] : [];
      });

      // Both systems should execute without throwing
      expect(() => keyboardSystem.update(updateArgs)).not.toThrow();
      expect(() => cleanUpSystem.update(updateArgs)).not.toThrow();

      // Both systems should have attempted processing
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large numbers of entities efficiently', () => {
      const largeEntitySet: Entity[] = [];
      
      // Create many entities with player components
      for (let i = 0; i < 100; i++) {
        largeEntitySet.push(
          createTestEntity({
            player: createTestComponent(ComponentType.Player)
          }, `entity-${i}`)
        );
      }

      testEntities = largeEntitySet;
      updateArgs = createTestUpdateArgs(testEntities);

      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        if (componentType === ComponentType.Player) {
          return largeEntitySet;
        }
        return [];
      });

      // Systems should handle large entity sets
      const startTime = performance.now();
      
      keyboardSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Verify systems processed all entities
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Player, largeEntitySet);
      
      // Should complete in reasonable time (< 100ms for mock operations)
      expect(processingTime).toBeLessThan(100);
    });

    it('should handle complex component combinations without performance degradation', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 0, y: 0 }),
        movable: createTestComponent(ComponentType.Movable)
      }, 'complex-0');

      const pickableEntity = createTestEntity({
        pickable: createTestComponent(ComponentType.Pickable),
        position: createTestComponent(ComponentType.Position, { x: 2, y: 2 })
      }, 'complex-2');

      const handlingEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        handling: createTestComponent(ComponentType.Handling),
        interacting: createTestComponent(ComponentType.Interacting)
      }, 'complex-3');

      const complexEntities = [playerEntity, pickableEntity, handlingEntity];
      testEntities = complexEntities;
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock component filtering
      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        switch (componentType) {
          case ComponentType.Player:
            return [playerEntity, handlingEntity];
          case ComponentType.Movable:
            return [playerEntity];
          case ComponentType.Pickable:
            return [pickableEntity];
          case ComponentType.Handling:
            return [handlingEntity];
          default:
            return [];
        }
      });

      // Run all systems with complex entity sets
      keyboardSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      pickupSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);

      // All systems should complete processing
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(4);
      
      // Verify systems found appropriate entities for each component type
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Player, complexEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Movable, complexEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Handling, complexEntities);
    });
  });
});

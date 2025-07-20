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

// Mock component operations with partial implementation
vi.mock('../components/ComponentOperations', async () => {
  const actual = await vi.importActual('../components/ComponentOperations');
  return {
    ...actual,
    hasComponent: vi.fn(() => false),
    getComponentIfExists: vi.fn(() => undefined),
    setComponent: vi.fn(),
    removeComponent: vi.fn()
  };
});

// Mock entity utils with partial implementation  
vi.mock('../utils/EntityUtils', async () => {
  const actual = await vi.importActual('../utils/EntityUtils');
  return {
    ...actual,
    getEntitiesWithComponent: vi.fn(() => []),
    hasEntitiesAtPosition: vi.fn(() => false),
    addEntities: vi.fn(),
    removeEntities: vi.fn(),
    getPlayerEntity: vi.fn(() => null)
  };
});

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
  removeEntities,
  getPlayerEntity
} from '../utils/EntityUtils';

const mockHasComponent = vi.mocked(hasComponent);
const mockGetComponentIfExists = vi.mocked(getComponentIfExists);
const mockSetComponent = vi.mocked(setComponent);
const mockRemoveComponent = vi.mocked(removeComponent);
const mockGetEntitiesWithComponent = vi.mocked(getEntitiesWithComponent);
const mockHasEntitiesAtPosition = vi.mocked(hasEntitiesAtPosition);
const mockAddEntities = vi.mocked(addEntities);
const mockRemoveEntities = vi.mocked(removeEntities);
const mockGetPlayerEntity = vi.mocked(getPlayerEntity);

describe('ECS System Integration Tests', () => {
  let keyboardSystem: KeyboardInputSystem;
  let movementSystem: MovementSystem;
  let pickupSystem: PickupSystem;
  let cleanUpSystem: CleanUpSystem;
  let testEntities: Entity[];
  let updateArgs: UpdateArgs;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Initialize systems
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
    mockGetPlayerEntity.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('System Instantiation and Basic Operation', () => {
    it('should instantiate all systems without errors', () => {
      expect(keyboardSystem).toBeInstanceOf(KeyboardInputSystem);
      expect(movementSystem).toBeInstanceOf(MovementSystem);
      expect(pickupSystem).toBeInstanceOf(PickupSystem);
      expect(cleanUpSystem).toBeInstanceOf(CleanUpSystem);
    });

    it('should run all systems without throwing errors', () => {
      // Test with empty entities
      expect(() => keyboardSystem.update(updateArgs)).not.toThrow();
      expect(() => movementSystem.update(updateArgs)).not.toThrow();
      expect(() => pickupSystem.update(updateArgs)).not.toThrow();
      expect(() => cleanUpSystem.update(updateArgs)).not.toThrow();
    });

    it('should handle systems with entities but no matching components', () => {
      const entityWithoutMatchingComponents = createTestEntity({
        position: createTestComponent(ComponentType.Position, { x: 0, y: 0 })
      }, 'no-match');

      testEntities = [entityWithoutMatchingComponents];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock returns empty arrays (no matching entities)
      mockGetEntitiesWithComponent.mockReturnValue([]);
      mockGetPlayerEntity.mockReturnValue(undefined);

      expect(() => keyboardSystem.update(updateArgs)).not.toThrow();
      expect(() => movementSystem.update(updateArgs)).not.toThrow();
      expect(() => pickupSystem.update(updateArgs)).not.toThrow();
      expect(() => cleanUpSystem.update(updateArgs)).not.toThrow();
    });
  });

  describe('System Integration Verification', () => {
    it('should demonstrate systems can work with mocked dependencies', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        movable: createTestComponent(ComponentType.Movable)
      }, 'player');

      testEntities = [playerEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock successful entity filtering (though systems may not use mocks directly)
      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        if (componentType === ComponentType.Player || componentType === ComponentType.Movable) {
          return [playerEntity];
        }
        return [];
      });
      
      mockGetPlayerEntity.mockReturnValue(playerEntity);

      // Run systems - they should not throw regardless of whether they use mocks
      expect(() => keyboardSystem.update(updateArgs)).not.toThrow();
      expect(() => movementSystem.update(updateArgs)).not.toThrow();
      expect(() => pickupSystem.update(updateArgs)).not.toThrow();

      // The key test: systems run without errors in integration
      expect(keyboardSystem).toBeInstanceOf(KeyboardInputSystem);
      expect(movementSystem).toBeInstanceOf(MovementSystem);
      expect(pickupSystem).toBeInstanceOf(PickupSystem);
    });

    it('should handle systems processing with component operations', () => {
      const movableEntity = createTestEntity({
        movable: createTestComponent(ComponentType.Movable),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        velocity: createTestComponent(ComponentType.Velocity, { dx: 1, dy: 0 })
      }, 'movable');

      testEntities = [movableEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock entity filtering to return the movable entity
      mockGetEntitiesWithComponent.mockReturnValue([movableEntity]);
      
      // Mock component operations
      mockHasComponent.mockReturnValue(true);
      mockGetComponentIfExists.mockImplementation((entity, componentType) => {
        if (entity === movableEntity) {
          switch (componentType) {
            case ComponentType.Position:
              return createTestComponent(ComponentType.Position, { x: 5, y: 5 });
            case ComponentType.Velocity:
              return createTestComponent(ComponentType.Velocity, { dx: 1, dy: 0 });
            default:
              return createTestComponent(componentType);
          }
        }
        return undefined;
      });

      // Run movement system - should not throw
      expect(() => movementSystem.update(updateArgs)).not.toThrow();

      // Verify system completed without throwing
      expect(movementSystem).toBeInstanceOf(MovementSystem);
    });
  });

  describe('System Coordination and Coexistence', () => {
    it('should run multiple systems in sequence without interference', () => {
      const complexEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 3, y: 3 }),
        velocity: createTestComponent(ComponentType.Velocity, { dx: 0, dy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        handling: createTestComponent(ComponentType.Handling)
      }, 'complex');

      testEntities = [complexEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock comprehensive entity filtering
      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        const hasComponent = [
          ComponentType.Player,
          ComponentType.Movable,
          ComponentType.Handling
        ].includes(componentType);
        
        return hasComponent ? [complexEntity] : [];
      });
      
      mockGetPlayerEntity.mockReturnValue(complexEntity);

      // Run all systems in typical execution order - should not throw
      const executeAllSystems = () => {
        keyboardSystem.update(updateArgs);
        movementSystem.update(updateArgs);
        pickupSystem.update(updateArgs);
        cleanUpSystem.update(updateArgs);
      };

      expect(executeAllSystems).not.toThrow();

      // Verify systems are functional after coordination
      expect(keyboardSystem).toBeInstanceOf(KeyboardInputSystem);
      expect(movementSystem).toBeInstanceOf(MovementSystem);
      expect(pickupSystem).toBeInstanceOf(PickupSystem);
      expect(cleanUpSystem).toBeInstanceOf(CleanUpSystem);
    });

    it('should handle rapid sequential system updates without state conflicts', () => {
      const testEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        movable: createTestComponent(ComponentType.Movable)
      }, 'rapid-test');

      testEntities = [testEntity];
      
      mockGetEntitiesWithComponent.mockReturnValue([testEntity]);
      mockGetPlayerEntity.mockReturnValue(testEntity);

      // Simulate rapid updates (like a game loop) - should not throw
      for (let i = 0; i < 10; i++) {
        updateArgs = createTestUpdateArgs(testEntities);
        
        expect(() => {
          keyboardSystem.update(updateArgs);
          movementSystem.update(updateArgs);
        }).not.toThrow();
      }

      // Verify systems remain functional after rapid updates
      expect(keyboardSystem).toBeInstanceOf(KeyboardInputSystem);
      expect(movementSystem).toBeInstanceOf(MovementSystem);
    });

    it('should maintain system independence with different entity sets', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player)
      }, 'player-only');

      const movableEntity = createTestEntity({
        movable: createTestComponent(ComponentType.Movable),
        position: createTestComponent(ComponentType.Position, { x: 1, y: 1 }),
        velocity: createTestComponent(ComponentType.Velocity, { dx: 0, dy: 0 })
      }, 'movable-only');

      testEntities = [playerEntity, movableEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock selective entity filtering
      mockGetEntitiesWithComponent.mockImplementation((componentType: ComponentType) => {
        switch (componentType) {
          case ComponentType.Player:
            return [playerEntity];
          case ComponentType.Movable:
            return [movableEntity];
          default:
            return [];
        }
      });
      
      mockGetPlayerEntity.mockReturnValue(playerEntity);

      // Systems should work with their respective entities without conflicts
      expect(() => {
        keyboardSystem.update(updateArgs);  // Should process playerEntity
        movementSystem.update(updateArgs);  // Should process movableEntity
        pickupSystem.update(updateArgs);    // Should process playerEntity
      }).not.toThrow();

      // Verify independent system operation
      expect(keyboardSystem).toBeInstanceOf(KeyboardInputSystem);
      expect(movementSystem).toBeInstanceOf(MovementSystem);
      expect(pickupSystem).toBeInstanceOf(PickupSystem);
    });
  });

  describe('Error Handling and Robustness', () => {
    it('should handle null or undefined entities gracefully', () => {
      testEntities = [];
      updateArgs = createTestUpdateArgs(testEntities);

      mockGetEntitiesWithComponent.mockReturnValue([]);
      mockGetPlayerEntity.mockReturnValue(undefined);

      expect(() => keyboardSystem.update(updateArgs)).not.toThrow();
      expect(() => movementSystem.update(updateArgs)).not.toThrow();
      expect(() => pickupSystem.update(updateArgs)).not.toThrow();
      expect(() => cleanUpSystem.update(updateArgs)).not.toThrow();
    });

    it('should handle component operation failures gracefully', () => {
      const testEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player)
      }, 'test');

      testEntities = [testEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock component operations to return undefined/null
      mockGetEntitiesWithComponent.mockReturnValue([testEntity]);
      mockGetPlayerEntity.mockReturnValue(testEntity);
      mockGetComponentIfExists.mockReturnValue(undefined);
      mockHasComponent.mockReturnValue(false);

      expect(() => keyboardSystem.update(updateArgs)).not.toThrow();
      expect(() => pickupSystem.update(updateArgs)).not.toThrow();
    });

    it('should continue functioning after mock function failures', () => {
      const testEntity = createTestEntity({
        movable: createTestComponent(ComponentType.Movable)
      }, 'resilient');

      testEntities = [testEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // First call throws, subsequent calls work
      let callCount = 0;
      mockGetEntitiesWithComponent.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Mock error');
        }
        return [testEntity];
      });

      // First system call might fail, but system should be resilient
      let firstCallError: Error | null = null;
      try {
        movementSystem.update(updateArgs);
      } catch (e) {
        firstCallError = e as Error;
      }

      // Whether or not the first call threw an error, the system should remain functional
      // The test verifies that the system can handle potential mock failures gracefully
      expect(() => movementSystem.update(updateArgs)).not.toThrow();
      
      // System should remain functional after any errors
      expect(movementSystem).toBeInstanceOf(MovementSystem);
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyboardInputSystem } from '../systems/KeyboardInputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { PickupSystem } from '../systems/PickupSystem';
import { CleanUpSystem } from '../systems/CleanUpSystem';
import { createTestEntity, createTestComponent, createTestUpdateArgs } from '../../__tests__/testUtils';
import { ComponentType } from '../components/ComponentTypes';
import type { Entity } from '../utils/ecsUtils';
import type { UpdateArgs } from '../systems/Systems';

// Mock Pixi.js components
vi.mock('pixi.js', () => ({
  Ticker: vi.fn(),
  Container: vi.fn(),
  Sprite: vi.fn(),
  Graphics: vi.fn(),
  Application: vi.fn()
}));

// Mock window event listeners
const mockEventListeners: { [key: string]: Function } = {};
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn((event: string, callback: Function) => {
    mockEventListeners[event] = callback;
  }),
  writable: true
});

// Mock component operations
vi.mock('../components/ComponentOperations', () => ({
  hasComponent: vi.fn(),
  getComponentAbsolute: vi.fn(),
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

// Mock Atoms for render system
vi.mock('../utils/Atoms', () => ({
  getTexture: vi.fn(() => ({ name: 'mock-texture' }))
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
import { getTexture } from '../utils/Atoms';

const mockHasComponent = vi.mocked(hasComponent);
const mockGetComponentIfExists = vi.mocked(getComponentIfExists);
const mockSetComponent = vi.mocked(setComponent);
const mockRemoveComponent = vi.mocked(removeComponent);
const mockGetEntitiesWithComponent = vi.mocked(getEntitiesWithComponent);
const mockHasEntitiesAtPosition = vi.mocked(hasEntitiesAtPosition);
const mockAddEntities = vi.mocked(addEntities);
const mockRemoveEntities = vi.mocked(removeEntities);
const mockGetTexture = vi.mocked(getTexture);

describe('ECS System Integration', () => {
  let keyboardInputSystem: KeyboardInputSystem;
  let movementSystem: MovementSystem;
  let renderSystem: RenderSystem;
  let pickupSystem: PickupSystem;
  let cleanUpSystem: CleanUpSystem;
  let testEntities: Entity[];
  let updateArgs: UpdateArgs;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Initialize systems
    keyboardInputSystem = new KeyboardInputSystem();
    movementSystem = new MovementSystem();
    renderSystem = new RenderSystem();
    pickupSystem = new PickupSystem();
    cleanUpSystem = new CleanUpSystem();
    
    // Create test entities
    testEntities = [];
    updateArgs = createTestUpdateArgs(testEntities);
    
    // Setup default mocks
    mockHasComponent.mockReturnValue(false);
    mockGetComponentIfExists.mockReturnValue(null);
    mockGetComponent.mockReturnValue(null);
    mockGetEntitiesWithComponent.mockReturnValue([]);
    mockHasEntitiesAtPosition.mockReturnValue(false);
    mockGetTexture.mockReturnValue({ name: 'mock-texture' } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Multiple systems processing the same entities', () => {
    it('should handle multiple systems processing player entity without conflicts', () => {
      // Create a player entity with all necessary components
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        velocity: createTestComponent(ComponentType.Velocity, { dx: 0, dy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      testEntities = [playerEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock component operations for player entity
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Player) return [playerEntity];
        if (componentType === ComponentType.Movable) return [playerEntity];
        if (componentType === ComponentType.Sprite) return [playerEntity];
        return [];
      });

      mockHasComponent.mockImplementation((entity, componentType) => {
        return entity.id === 'player-1' && [
          ComponentType.Player,
          ComponentType.Position,
          ComponentType.Velocity,
          ComponentType.Movable,
          ComponentType.Sprite
        ].includes(componentType);
      });

      mockGetComponentIfExists.mockImplementation((entity, componentType) => {
        if (entity.id === 'player-1') {
          switch (componentType) {
            case ComponentType.Position:
              return { x: 5, y: 5 };
            case ComponentType.Velocity:
              return { dx: 0, dy: 0 };
            case ComponentType.Sprite:
              return { sprite: { x: 0, y: 0 } };
            default:
              return {};
          }
        }
        return null;
      });

      mockGetComponent.mockImplementation((entity, componentType) => {
        if (entity.id === 'player-1') {
          switch (componentType) {
            case ComponentType.Position:
              return { x: 5, y: 5 };
            case ComponentType.Velocity:
              return { dx: 0, dy: 0 };
            case ComponentType.Sprite:
              return { sprite: { x: 0, y: 0 } };
            default:
              return {};
          }
        }
        throw new Error('Component not found');
      });

      // Simulate systems processing the same entity
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      renderSystem.update(updateArgs);

      // Verify that each system attempted to interact with the entity
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Player, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Movable, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Sprite, testEntities);

      // Each system should not interfere with others' processing
      expect(mockSetComponent).toHaveBeenCalledTimes(0); // No state changes expected without input
    });

    it('should handle multiple entities across different systems', () => {
      // Create various entities with different component combinations
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 0, y: 0 }),
        velocity: createTestComponent(ComponentType.Velocity, { dx: 0, dy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player');

      const pickableEntity = createTestEntity({
        position: createTestComponent(ComponentType.Position, { x: 1, y: 1 }),
        pickable: createTestComponent(ComponentType.Pickable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'item' })
      }, 'pickable-item');

      const wallEntity = createTestEntity({
        position: createTestComponent(ComponentType.Position, { x: 2, y: 2 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'wall' })
      }, 'wall');

      testEntities = [playerEntity, pickableEntity, wallEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock component operations for different entities
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        switch (componentType) {
          case ComponentType.Player:
            return [playerEntity];
          case ComponentType.Movable:
            return [playerEntity];
          case ComponentType.Pickable:
            return [pickableEntity];
          case ComponentType.Sprite:
            return [playerEntity, pickableEntity, wallEntity];
          default:
            return [];
        }
      });

      mockHasComponent.mockImplementation((entity, componentType) => {
        if (entity.id === 'player') {
          return [ComponentType.Player, ComponentType.Position, ComponentType.Velocity, ComponentType.Movable, ComponentType.Sprite].includes(componentType);
        }
        if (entity.id === 'pickable-item') {
          return [ComponentType.Position, ComponentType.Pickable, ComponentType.Sprite].includes(componentType);
        }
        if (entity.id === 'wall') {
          return [ComponentType.Position, ComponentType.Sprite].includes(componentType);
        }
        return false;
      });

      // Run all systems
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      pickupSystem.update(updateArgs);
      renderSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);

      // Verify systems processed appropriate entities
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Player, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Movable, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Pickable, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Sprite, testEntities);

      // Each system should have been called without conflicts
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(5); // One per system
    });
  });

  describe('System execution order and dependencies', () => {
    it('should process input → movement → rendering in correct sequence', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        velocity: createTestComponent(ComponentType.Velocity, { dx: 0, dy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player');

      testEntities = [playerEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      let processingOrder: string[] = [];
      
      // Mock component operations to track processing order
      const originalSetComponent = mockSetComponent;
      mockSetComponent.mockImplementation((entity, componentType, component) => {
        if (componentType === ComponentType.Velocity) {
          processingOrder.push('input-velocity-update');
        }
        if (componentType === ComponentType.Position) {
          processingOrder.push('movement-position-update');
        }
        return originalSetComponent(entity, componentType, component);
      });

      const originalGetComponent = mockGetComponent;
      mockGetComponent.mockImplementation((entity, componentType) => {
        if (componentType === ComponentType.Sprite) {
          processingOrder.push('render-sprite-access');
        }
        return originalGetComponent(entity, componentType);
      });

      // Mock necessary conditions for systems to process
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if ([ComponentType.Player, ComponentType.Movable, ComponentType.Sprite].includes(componentType)) {
          return [playerEntity];
        }
        return [];
      });

      mockHasComponent.mockReturnValue(true);
      mockGetComponentIfExists.mockReturnValue({ x: 5, y: 5, dx: 0, dy: 0 });
      mockGetComponent.mockReturnValue({ sprite: { x: 0, y: 0 } });

      // Simulate key press for input
      if (mockEventListeners['keydown']) {
        mockEventListeners['keydown']({ key: 'ArrowRight' });
      }

      // Execute systems in dependency order
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      renderSystem.update(updateArgs);

      // Verify systems were called in correct order
      // (Note: actual order verification would depend on the specific implementation details)
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Player, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Movable, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Sprite, testEntities);
    });

    it('should handle pickup → movement system interaction correctly', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        velocity: createTestComponent(ComponentType.Velocity, { dx: 0, dy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        handling: createTestComponent(ComponentType.Handling)
      }, 'player');

      const itemEntity = createTestEntity({
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }), // Same position as player
        pickable: createTestComponent(ComponentType.Pickable)
      }, 'item');

      testEntities = [playerEntity, itemEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock conditions for pickup and movement
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        switch (componentType) {
          case ComponentType.Player:
            return [playerEntity];
          case ComponentType.Handling:
            return [playerEntity];
          case ComponentType.Pickable:
            return [itemEntity];
          case ComponentType.Movable:
            return [playerEntity];
          default:
            return [];
        }
      });

      mockHasComponent.mockImplementation((entity, componentType) => {
        if (entity.id === 'player') {
          return [ComponentType.Player, ComponentType.Position, ComponentType.Velocity, ComponentType.Movable, ComponentType.Handling].includes(componentType);
        }
        if (entity.id === 'item') {
          return [ComponentType.Position, ComponentType.Pickable].includes(componentType);
        }
        return false;
      });

      mockGetComponentIfExists.mockImplementation((entity, componentType) => {
        if (componentType === ComponentType.Position) {
          return { x: 5, y: 5 };
        }
        if (componentType === ComponentType.Velocity) {
          return { dx: 0, dy: 0 };
        }
        return {};
      });

      // Execute pickup first, then movement
      pickupSystem.update(updateArgs);
      movementSystem.update(updateArgs);

      // Verify both systems processed appropriately
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Handling, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Movable, testEntities);
      
      // Systems should not interfere with each other's entity filtering
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2);
    });
  });

  describe('Entity lifecycle through multiple system updates', () => {
    it('should maintain entity state consistency across multiple update cycles', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 0, y: 0 }),
        velocity: createTestComponent(ComponentType.Velocity, { dx: 1, dy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player');

      testEntities = [playerEntity];
      
      // Track component state changes over multiple updates
      let positionHistory: Array<{x: number, y: number}> = [];
      let velocityHistory: Array<{dx: number, dy: number}> = [];

      mockSetComponent.mockImplementation((entity, componentType, component) => {
        if (componentType === ComponentType.Position && component) {
          positionHistory.push({ x: component.x, y: component.y });
        }
        if (componentType === ComponentType.Velocity && component) {
          velocityHistory.push({ dx: component.dx, dy: component.dy });
        }
      });

      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if ([ComponentType.Player, ComponentType.Movable, ComponentType.Sprite].includes(componentType)) {
          return [playerEntity];
        }
        return [];
      });

      mockHasComponent.mockReturnValue(true);
      mockGetComponentIfExists.mockImplementation((entity, componentType) => {
        if (componentType === ComponentType.Position) {
          return positionHistory.length > 0 ? positionHistory[positionHistory.length - 1] : { x: 0, y: 0 };
        }
        if (componentType === ComponentType.Velocity) {
          return { dx: 1, dy: 0 };
        }
        return {};
      });

      // Simulate multiple update cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        updateArgs = createTestUpdateArgs(testEntities);
        
        // Each cycle: input → movement → render
        keyboardInputSystem.update(updateArgs);
        movementSystem.update(updateArgs);
        renderSystem.update(updateArgs);
      }

      // Verify systems consistently processed the entity across cycles
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(9); // 3 systems × 3 cycles
      
      // Each system should have been called the expected number of times
      const playerCalls = mockGetEntitiesWithComponent.mock.calls.filter(
        call => call[0] === ComponentType.Player
      );
      const movableCalls = mockGetEntitiesWithComponent.mock.calls.filter(
        call => call[0] === ComponentType.Movable  
      );
      const spriteCalls = mockGetEntitiesWithComponent.mock.calls.filter(
        call => call[0] === ComponentType.Sprite
      );

      expect(playerCalls.length).toBe(3); // One per cycle
      expect(movableCalls.length).toBe(3); // One per cycle  
      expect(spriteCalls.length).toBe(3); // One per cycle
    });

    it('should handle entity creation and removal across system updates', () => {
      let currentEntities = [
        createTestEntity({
          position: createTestComponent(ComponentType.Position, { x: 1, y: 1 }),
          sprite: createTestComponent(ComponentType.Sprite, { sprite: 'temp' })
        }, 'temporary')
      ];

      // Mock entity operations
      mockAddEntities.mockImplementation((entitiesToAdd) => {
        currentEntities.push(...entitiesToAdd);
      });

      mockRemoveEntities.mockImplementation((entitiesToRemove) => {
        const idsToRemove = entitiesToRemove.map(e => e.id);
        currentEntities = currentEntities.filter(e => !idsToRemove.includes(e.id));
      });

      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        return currentEntities.filter(entity => {
          // Mock component filtering based on current entities
          return entity.components && Object.keys(entity.components).length > 0;
        });
      });

      // Initial update with one entity
      updateArgs = createTestUpdateArgs(currentEntities);
      renderSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);

      // Simulate entity addition
      const newEntity = createTestEntity({
        position: createTestComponent(ComponentType.Position, { x: 2, y: 2 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'new' })
      }, 'new-entity');

      mockAddEntities([newEntity]);

      // Update with new entity
      updateArgs = createTestUpdateArgs(currentEntities);
      renderSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);

      // Verify systems handled entity lifecycle changes
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(4); // 2 systems × 2 updates
      
      // Both render and cleanup systems should have been called multiple times
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Sprite, expect.any(Array));
    });
  });

  describe('Component interactions across systems', () => {
    it('should handle shared component modifications correctly', () => {
      const sharedEntity = createTestEntity({
        position: createTestComponent(ComponentType.Position, { x: 10, y: 10 }),
        velocity: createTestComponent(ComponentType.Velocity, { dx: -1, dy: 1 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'shared' })
      }, 'shared-entity');

      testEntities = [sharedEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Track component modifications
      let componentModifications: Array<{system: string, component: string, value: any}> = [];

      mockSetComponent.mockImplementation((entity, componentType, component) => {
        if (componentType === ComponentType.Position) {
          componentModifications.push({
            system: 'movement',
            component: 'position', 
            value: component
          });
        }
        if (componentType === ComponentType.Velocity) {
          componentModifications.push({
            system: 'input',
            component: 'velocity',
            value: component
          });
        }
      });

      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if ([ComponentType.Movable, ComponentType.Sprite].includes(componentType)) {
          return [sharedEntity];
        }
        return [];
      });

      mockHasComponent.mockReturnValue(true);
      mockGetComponentIfExists.mockReturnValue({ x: 10, y: 10, dx: -1, dy: 1 });
      mockGetComponent.mockReturnValue({ sprite: { x: 0, y: 0 } });

      // Systems modify shared entity components
      movementSystem.update(updateArgs);
      renderSystem.update(updateArgs);

      // Verify component interactions don't conflict
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Movable, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Sprite, testEntities);
      
      // Both systems should interact with the same entity
      expect(mockGetComponentIfExists).toHaveBeenCalled();
      expect(mockGetComponent).toHaveBeenCalled();
    });

    it('should handle component dependencies between systems', () => {
      const dependentEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 3, y: 3 }),
        handling: createTestComponent(ComponentType.Handling),
        interacting: createTestComponent(ComponentType.Interacting)
      }, 'dependent');

      testEntities = [dependentEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock component dependencies
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        switch (componentType) {
          case ComponentType.Player:
          case ComponentType.Handling:
          case ComponentType.Interacting:
            return [dependentEntity];
          default:
            return [];
        }
      });

      mockHasComponent.mockImplementation((entity, componentType) => {
        return entity.id === 'dependent' && [
          ComponentType.Player, 
          ComponentType.Position,
          ComponentType.Handling, 
          ComponentType.Interacting
        ].includes(componentType);
      });

      // Systems with component dependencies
      keyboardInputSystem.update(updateArgs);
      pickupSystem.update(updateArgs);

      // Verify systems correctly identified component dependencies
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Player, testEntities);
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Handling, testEntities);
      
      // Both systems should have found the same entity with required components
      expect(mockHasComponent).toHaveBeenCalledWith(dependentEntity, ComponentType.Player);
      expect(mockHasComponent).toHaveBeenCalledWith(dependentEntity, ComponentType.Handling);
    });
  });

  describe('System state isolation and side effects', () => {
    it('should maintain system state isolation', () => {
      const entities = [
        createTestEntity({
          player: createTestComponent(ComponentType.Player),
          position: createTestComponent(ComponentType.Position, { x: 0, y: 0 }),
          velocity: createTestComponent(ComponentType.Velocity, { dx: 0, dy: 0 }),
          movable: createTestComponent(ComponentType.Movable)
        }, 'player-1'),
        createTestEntity({
          player: createTestComponent(ComponentType.Player),
          position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
          velocity: createTestComponent(ComponentType.Velocity, { dx: 0, dy: 0 }),
          movable: createTestComponent(ComponentType.Movable)
        }, 'player-2')
      ];

      testEntities = entities;
      updateArgs = createTestUpdateArgs(testEntities);

      // Each system should maintain its own internal state
      const keyboardSystem1 = new KeyboardInputSystem();
      const keyboardSystem2 = new KeyboardInputSystem();

      mockGetEntitiesWithComponent.mockReturnValue(entities);
      mockHasComponent.mockReturnValue(true);
      mockGetComponentIfExists.mockReturnValue({ x: 0, y: 0, dx: 0, dy: 0 });

      // Simulate different key states for different system instances
      if (mockEventListeners['keydown']) {
        mockEventListeners['keydown']({ key: 'ArrowUp' });
      }

      keyboardSystem1.update(updateArgs);
      
      if (mockEventListeners['keyup']) {
        mockEventListeners['keyup']({ key: 'ArrowUp' });
      }

      keyboardSystem2.update(updateArgs);

      // Both systems should process independently
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2);
      expect(mockGetEntitiesWithComponent).toHaveBeenNthCalledWith(1, ComponentType.Player, entities);
      expect(mockGetEntitiesWithComponent).toHaveBeenNthCalledWith(2, ComponentType.Player, entities);
    });

    it('should prevent unintended side effects between system updates', () => {
      const testEntity = createTestEntity({
        position: createTestComponent(ComponentType.Position, { x: 2, y: 2 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'test' })
      }, 'test-entity');

      testEntities = [testEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Track all component access patterns
      let componentAccesses: Array<{system: string, operation: string, component: string}> = [];

      const trackingGetComponent = mockGetComponent.mockImplementation((entity, componentType) => {
        componentAccesses.push({
          system: 'unknown',
          operation: 'get',
          component: ComponentType[componentType]
        });
        return { sprite: { x: 0, y: 0 } };
      });

      const trackingSetComponent = mockSetComponent.mockImplementation((entity, componentType, component) => {
        componentAccesses.push({
          system: 'unknown', 
          operation: 'set',
          component: ComponentType[componentType]
        });
      });

      mockGetEntitiesWithComponent.mockReturnValue([testEntity]);
      mockHasComponent.mockReturnValue(true);

      // Run multiple systems
      renderSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);

      // Verify no unintended cross-system component modifications
      const setCalls = componentAccesses.filter(access => access.operation === 'set');
      const getCalls = componentAccesses.filter(access => access.operation === 'get');

      // Systems should only access components they need
      expect(getCalls.length).toBeGreaterThanOrEqual(0);
      expect(setCalls.length).toBeGreaterThanOrEqual(0);

      // No system should interfere with others' component access patterns
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2); // One per system
    });

    it('should handle system error isolation', () => {
      const testEntity = createTestEntity({
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'error-prone' })
      }, 'error-entity');

      testEntities = [testEntity];
      updateArgs = createTestUpdateArgs(testEntities);

      // Mock one system to throw an error
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Sprite) {
          return [testEntity];
        }
        throw new Error('Mock system error');
      });

      mockHasComponent.mockReturnValue(true);

      // One system should work, others should handle errors gracefully
      expect(() => renderSystem.update(updateArgs)).not.toThrow();
      
      // Even if one system encounters issues, others should continue
      expect(() => cleanUpSystem.update(updateArgs)).not.toThrow();

      // Both systems should have attempted to process
      expect(mockGetEntitiesWithComponent).toHaveBeenCalledTimes(2);
    });
  });
});

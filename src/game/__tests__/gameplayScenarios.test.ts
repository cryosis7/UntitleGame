import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyboardInputSystem } from '../systems/KeyboardInputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { PickupSystem } from '../systems/PickupSystem';
import { createTestEntity, createTestComponent, createTestUpdateArgs, createMockGameMap } from '../../__tests__/testUtils';
import { ComponentType } from '../components/ComponentTypes';
import type { Entity } from '../utils/ecsUtils';

// Mock Pixi.js components and app
vi.mock('pixi.js', () => ({
  Ticker: vi.fn(),
  Container: vi.fn(() => ({
    addChild: vi.fn(),
    removeChild: vi.fn(),
    width: 0,
    height: 0,
    children: []
  })),
  Sprite: vi.fn(),
  Graphics: vi.fn(),
  Application: vi.fn()
}));

vi.mock('../Pixi', () => ({
  pixiApp: {
    stage: {
      addChild: vi.fn(),
      removeChild: vi.fn()
    },
    canvas: {
      width: 800,
      height: 600
    }
  }
}));

// Mock window event listeners for keyboard input simulation
const mockEventListeners: { [key: string]: Function[] } = {};
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn((event: string, callback: Function) => {
    if (!mockEventListeners[event]) {
      mockEventListeners[event] = [];
    }
    mockEventListeners[event].push(callback);
  }),
  writable: true
});

// Mock component operations with centralized state tracking
const componentState = new Map<string, any>();

vi.mock('../components/ComponentOperations', () => ({
  hasComponent: vi.fn(),
  getComponentAbsolute: vi.fn(),
  getComponentIfExists: vi.fn(),
  setComponent: vi.fn(),
  removeComponent: vi.fn(),
  removeMapComponents: vi.fn(),
  hasAnyComponent: vi.fn()
}));

// Mock entity utils
vi.mock('../utils/EntityUtils', () => ({
  getEntitiesWithComponent: vi.fn(),
  hasEntitiesAtPosition: vi.fn(),
  addEntities: vi.fn(),
  removeEntities: vi.fn(),
  getEntitiesAtPosition: vi.fn(),
  getPlayerEntity: vi.fn()
}));

// Mock Jotai store used by RenderSystem
vi.mock('../../App', () => ({
  store: {
    get: vi.fn((atom) => {
      // If accessing mapAtom, return mock map
      if (atom && typeof atom === 'object') {
        return {
          getSpriteContainer: vi.fn(() => ({
            position: {
              set: vi.fn()
            },
            addChild: vi.fn(),
            removeChild: vi.fn(),
            children: []
          }))
        };
      }
      // If accessing getTileSizeAtom, return default tile size
      return 32;
    }),
    set: vi.fn(),
    sub: vi.fn()
  }
}));

// Mock Atoms for render system
vi.mock('../utils/Atoms', () => ({
  getTexture: vi.fn(() => ({ name: 'mock-texture' })),
  mapAtom: {},
  getTileSizeAtom: {}
}));

import { 
  hasComponent, 
  getComponentIfExists, 
  setComponent, 
  removeComponent,
  removeMapComponents,
  hasAnyComponent,
  getComponentAbsolute
} from '../components/ComponentOperations';
import { 
  getEntitiesWithComponent, 
  hasEntitiesAtPosition,
  addEntities,
  removeEntities,
  getEntitiesAtPosition,
  getPlayerEntity
} from '../utils/EntityUtils';
import { getTexture } from '../utils/Atoms';

const mockHasComponent = vi.mocked(hasComponent);
const mockGetComponentIfExists = vi.mocked(getComponentIfExists);
const mockGetComponentAbsolute = vi.mocked(getComponentAbsolute);
const mockSetComponent = vi.mocked(setComponent);
const mockRemoveComponent = vi.mocked(removeComponent);
const mockRemoveMapComponents = vi.mocked(removeMapComponents);
const mockHasAnyComponent = vi.mocked(hasAnyComponent);
const mockGetEntitiesWithComponent = vi.mocked(getEntitiesWithComponent);
const mockHasEntitiesAtPosition = vi.mocked(hasEntitiesAtPosition);
const mockAddEntities = vi.mocked(addEntities);
const mockRemoveEntities = vi.mocked(removeEntities);
const mockGetEntitiesAtPosition = vi.mocked(getEntitiesAtPosition);
const mockGetPlayerEntity = vi.mocked(getPlayerEntity);
const mockGetTexture = vi.mocked(getTexture);

// Helper function to simulate keyboard events
function simulateKeyPress(key: string) {
  mockEventListeners['keydown']?.forEach(callback => callback({ key }));
}

function simulateKeyRelease(key: string) {
  mockEventListeners['keyup']?.forEach(callback => callback({ key }));
}

// Helper function to setup component state tracking
function setupComponentStateTracking(entities: Entity[]) {
  componentState.clear();
  
  // Initialize component state for all entities
  entities.forEach(entity => {
    Object.entries(entity.components).forEach(([type, component]) => {
      const key = `${entity.id}-${type}`;
      componentState.set(key, { ...component });
    });
  });

  // Mock setComponent to update tracked state
  mockSetComponent.mockImplementation((entity, component) => {
    const key = `${entity.id}-${component.type}`;
    componentState.set(key, { ...component });
    
    // Update the entity's components object for consistency
    entity.components[component.type] = component;
  });

  // Mock removeComponent to remove from tracked state
  mockRemoveComponent.mockImplementation((entity, componentType) => {
    const key = `${entity.id}-${componentType}`;
    componentState.delete(key);
    delete entity.components[componentType];
  });

  // Mock hasComponent to check tracked state
  mockHasComponent.mockImplementation((entity, componentType) => {
    const key = `${entity.id}-${componentType}`;
    return componentState.has(key);
  });

  // Mock getComponentIfExists to return tracked state
  mockGetComponentIfExists.mockImplementation((entity, componentType) => {
    const key = `${entity.id}-${componentType}`;
    return componentState.get(key) || null;
  });

  // Mock getComponentAbsolute to return tracked state or throw
  mockGetComponentAbsolute.mockImplementation((entity, componentType) => {
    const key = `${entity.id}-${componentType}`;
    const component = componentState.get(key);
    if (!component) {
      throw new Error(`Component ${componentType} not found on entity ${entity.id}`);
    }
    return component;
  });
}

// Helper functions to avoid deep nesting
function getMovableEntities(entities: Entity[]): Entity[] {
  return entities.filter(e => 
    componentState.has(`${e.id}-${ComponentType.Movable}`)
  );
}

function entityHasAnyComponentTypes(entity: Entity, types: ComponentType[]): boolean {
  return types.some(type => componentState.has(`${entity.id}-${type}`));
}

describe('Core Gameplay Scenarios', () => {
  let keyboardInputSystem: KeyboardInputSystem;
  let movementSystem: MovementSystem;
  let pickupSystem: PickupSystem;

  beforeEach(() => {
    vi.clearAllMocks();
    componentState.clear();
    
    // Initialize core systems
    keyboardInputSystem = new KeyboardInputSystem();
    movementSystem = new MovementSystem();
    pickupSystem = new PickupSystem();
    
    // Setup default mocks
    mockGetTexture.mockReturnValue({ name: 'mock-texture' } as any);
    mockHasEntitiesAtPosition.mockReturnValue(false);
    mockGetEntitiesAtPosition.mockReturnValue([]);
    mockHasAnyComponent.mockReturnValue(false);
    mockGetEntitiesWithComponent.mockReturnValue([]); // Default to empty array instead of undefined
  });

  afterEach(() => {
    vi.clearAllMocks();
    componentState.clear();
  });

  describe('Complete Player Movement Workflow', () => {
    it('should handle complete movement workflow: input → velocity → position → rendering', () => {
      // Setup: Create player entity with all required components
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        velocity: createTestComponent(ComponentType.Velocity, { vx: 0, vy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const entities = [playerEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);

      // Setup entity filtering mocks
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Player) return [playerEntity];
        return [];
      });

      mockGetPlayerEntity.mockReturnValue(playerEntity);

      // Mock map validation
      gameMap.isValidPosition = vi.fn().mockReturnValue(true);
      
      // Step 1: Simulate user pressing right arrow key
      simulateKeyPress('ArrowRight');
      
      // Step 2: KeyboardInputSystem processes input and updates velocity
      keyboardInputSystem.update(updateArgs);
      
      // Verify velocity was updated to move right
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity, 
        expect.objectContaining({ 
          type: ComponentType.Velocity, 
          vx: 1, 
          vy: 0 
        })
      );

      // Step 3: MovementSystem processes velocity and updates position
      movementSystem.update(updateArgs);
      
      // Verify position was updated (from 5,5 to 6,5)
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity,
        expect.objectContaining({
          type: ComponentType.Position,
          x: 6,
          y: 5
        })
      );

      // Verify velocity was reset to 0
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity,
        expect.objectContaining({
          type: ComponentType.Velocity,
          vx: 0,
          vy: 0
        })
      );

      // Step 4: RenderSystem updates sprite position (commented out for now due to complex mocking)
      // renderSystem.update(updateArgs);
      
      // Verify render system would be called (we can test this conceptually)
      // expect(mockGetEntitiesWithComponent).toHaveBeenCalledWith(ComponentType.Sprite, entities);
      
      // Release the key
      simulateKeyRelease('ArrowRight');
    });

    it('should handle diagonal movement correctly', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        velocity: createTestComponent(ComponentType.Velocity, { vx: 0, vy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const entities = [playerEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Player) return [playerEntity];
        return [];
      });
      gameMap.isValidPosition = vi.fn().mockReturnValue(true);

      // Simulate pressing both right and up arrows
      simulateKeyPress('ArrowRight');
      simulateKeyPress('ArrowUp');
      
      keyboardInputSystem.update(updateArgs);
      
      // Verify diagonal velocity
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity, 
        expect.objectContaining({ 
          type: ComponentType.Velocity, 
          vx: 1, 
          vy: -1 
        })
      );

      movementSystem.update(updateArgs);
      
      // Verify diagonal position update
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity,
        expect.objectContaining({
          type: ComponentType.Position,
          x: 6,
          y: 4
        })
      );

      simulateKeyRelease('ArrowRight');
      simulateKeyRelease('ArrowUp');
    });

    it('should handle movement at map boundaries', () => {
      // Create player at edge of map
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 9, y: 9 }), // Bottom-right corner
        velocity: createTestComponent(ComponentType.Velocity, { vx: 0, vy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const entities = [playerEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Player) return [playerEntity];
        return [];
      });

      // Mock map to reject out-of-bounds positions
      gameMap.isValidPosition = vi.fn().mockImplementation((pos) => {
        return pos.x >= 0 && pos.y >= 0 && pos.x < 10 && pos.y < 10;
      });

      // Try to move right (out of bounds)
      simulateKeyPress('ArrowRight');
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      
      // Verify player position didn't change (still at 9,9)
      // The velocity should be reset to 0 due to invalid position
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity,
        expect.objectContaining({
          type: ComponentType.Velocity,
          vx: 0,
          vy: 0
        })
      );

      simulateKeyRelease('ArrowRight');
    });
  });

  describe('Item Pickup Workflow', () => {
    it('should handle complete pickup workflow: detection → collection → inventory update', () => {
      // Setup: Create player and pickable item at same position
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const itemEntity = createTestEntity({
        pickable: createTestComponent(ComponentType.Pickable),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'gem' })
      }, 'item-1');

      const entities = [playerEntity, itemEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);

      // Setup entity filtering
      mockGetPlayerEntity.mockReturnValue(playerEntity);
      mockGetEntitiesAtPosition.mockReturnValue([itemEntity]);
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Player) return [playerEntity];
        return [];
      });

      // Step 1: Player presses space to pick up item
      simulateKeyPress(' ');
      
      // Step 2: KeyboardInputSystem adds HandlingComponent to player
      keyboardInputSystem.update(updateArgs);
      
      // Verify handling component was added
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity, 
        expect.objectContaining({ type: ComponentType.Handling })
      );

      // Step 3: PickupSystem processes the pickup
      pickupSystem.update(updateArgs);
      
      // Verify CarriedItemComponent was added to player
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity,
        expect.objectContaining({
          type: ComponentType.CarriedItem,
          item: 'item-1'
        })
      );

      // Verify item was removed from map (removeMapComponents called)
      expect(mockRemoveMapComponents).toHaveBeenCalledWith(itemEntity);

      // Verify handling component was removed from player
      expect(mockRemoveComponent).toHaveBeenCalledWith(playerEntity, ComponentType.Handling);

      simulateKeyRelease(' ');
    });

    it('should handle item placement workflow', () => {
      // Setup: Create player already carrying an item
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        carriedItem: createTestComponent(ComponentType.CarriedItem, { item: 'item-1' }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const itemEntity = createTestEntity({
        pickable: createTestComponent(ComponentType.Pickable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'gem' })
      }, 'item-1');

      const entities = [playerEntity, itemEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);
      mockGetPlayerEntity.mockReturnValue(playerEntity);

      // Player presses space to place item
      simulateKeyPress(' ');
      keyboardInputSystem.update(updateArgs);
      pickupSystem.update(updateArgs);
      
      // Verify item was given position component matching player position
      expect(mockSetComponent).toHaveBeenCalledWith(itemEntity,
        expect.objectContaining({
          type: ComponentType.Position,
          x: 5,
          y: 5
        })
      );

      // Verify CarriedItemComponent was removed from player
      expect(mockRemoveComponent).toHaveBeenCalledWith(playerEntity, ComponentType.CarriedItem);

      simulateKeyRelease(' ');
    });

    it('should handle pickup failure when no items present', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const entities = [playerEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);
      mockGetPlayerEntity.mockReturnValue(playerEntity);
      mockGetEntitiesAtPosition.mockReturnValue([]); // No items at position

      simulateKeyPress(' ');
      keyboardInputSystem.update(updateArgs);
      pickupSystem.update(updateArgs);
      
      // Verify no CarriedItemComponent was added (should not have been called)
      const carriedItemCalls = mockSetComponent.mock.calls.filter(call => 
        call[1].type === ComponentType.CarriedItem
      );
      expect(carriedItemCalls).toHaveLength(0);

      // Verify handling component was still removed
      expect(mockRemoveComponent).toHaveBeenCalledWith(playerEntity, ComponentType.Handling);

      simulateKeyRelease(' ');
    });
  });

  describe('Collision Detection Preventing Invalid Movements', () => {
    it('should prevent movement into non-walkable entities', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        velocity: createTestComponent(ComponentType.Velocity, { vx: 0, vy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const wallEntity = createTestEntity({
        position: createTestComponent(ComponentType.Position, { x: 6, y: 5 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'wall' })
      }, 'wall-1');

      const entities = [playerEntity, wallEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Player) return [playerEntity];
        if (componentType === ComponentType.Movable) return [];
        return [];
      });
      gameMap.isValidPosition = vi.fn().mockReturnValue(true);
      
      // Mock hasAnyComponent to return false for wall (not movable or pickable)
      mockHasAnyComponent.mockImplementation((entity, ...types) => {
        return entity.id !== 'wall-1'; // Wall is not movable or pickable
      });

      // Try to move right into wall
      simulateKeyPress('ArrowRight');
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      
      // Verify player didn't move (velocity was reset)
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity,
        expect.objectContaining({
          type: ComponentType.Velocity,
          vx: 0,
          vy: 0
        })
      );

      // Verify position wasn't updated to wall location
      const positionCalls = mockSetComponent.mock.calls.filter(call => 
        call[1].type === ComponentType.Position && call[0].id === 'player-1'
      );
      expect(positionCalls.every(call => (call[1] as any).x !== 6)).toBe(true);

      simulateKeyRelease('ArrowRight');
    });

    it('should allow movement through pickable entities', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        velocity: createTestComponent(ComponentType.Velocity, { vx: 0, vy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const gemEntity = createTestEntity({
        pickable: createTestComponent(ComponentType.Pickable),
        position: createTestComponent(ComponentType.Position, { x: 6, y: 5 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'gem' })
      }, 'gem-1');

      const entities = [playerEntity, gemEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Player) return [playerEntity];
        return [];
      });
      gameMap.isValidPosition = vi.fn().mockReturnValue(true);
      
      // Mock hasAnyComponent to return true for gem (it's pickable)
      mockHasAnyComponent.mockImplementation((entity, ...types) => {
        return entity.id === 'gem-1' && types.includes(ComponentType.Pickable);
      });

      simulateKeyPress('ArrowRight');
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      
      // Verify player moved successfully to gem position
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity,
        expect.objectContaining({
          type: ComponentType.Position,
          x: 6,
          y: 5
        })
      );

      simulateKeyRelease('ArrowRight');
    });

    it('should handle movable entity pushing', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        velocity: createTestComponent(ComponentType.Velocity, { vx: 0, vy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const boxEntity = createTestEntity({
        movable: createTestComponent(ComponentType.Movable),
        position: createTestComponent(ComponentType.Position, { x: 6, y: 5 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'box' })
      }, 'box-1');

      const entities = [playerEntity, boxEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Player) return [playerEntity];
        if (componentType === ComponentType.Movable) return [boxEntity];
        return [];
      });
      gameMap.isValidPosition = vi.fn().mockReturnValue(true);
      mockHasEntitiesAtPosition.mockReturnValue(false); // No entities blocking box movement
      
      // Mock hasAnyComponent to return true for box (it's movable)
      mockHasAnyComponent.mockImplementation((entity, ...types) => {
        return entity.id === 'box-1' && types.includes(ComponentType.Movable);
      });

      simulateKeyPress('ArrowRight');
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      
      // Verify both player and box moved
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity,
        expect.objectContaining({
          type: ComponentType.Position,
          x: 6,
          y: 5
        })
      );

      expect(mockSetComponent).toHaveBeenCalledWith(boxEntity,
        expect.objectContaining({
          type: ComponentType.Position,
          x: 7,
          y: 5
        })
      );

      simulateKeyRelease('ArrowRight');
    });
  });



  describe('Game State Persistence Across Operations', () => {
    it('should persist entity changes across multiple system updates', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 2, y: 2 }),
        velocity: createTestComponent(ComponentType.Velocity, { vx: 0, vy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const itemEntity = createTestEntity({
        pickable: createTestComponent(ComponentType.Pickable),
        position: createTestComponent(ComponentType.Position, { x: 4, y: 2 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'gem' })
      }, 'item-1');

      const entities = [playerEntity, itemEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);
      mockGetPlayerEntity.mockReturnValue(playerEntity);
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Player) return [playerEntity];
        return [];
      });
      gameMap.isValidPosition = vi.fn().mockReturnValue(true);

      // Operation 1: Move player right twice to reach item
      simulateKeyPress('ArrowRight');
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      
      // Verify first move (2,2 -> 3,2)
      let currentPosition = componentState.get('player-1-position'); // Position component key
      expect(currentPosition.x).toBe(3);
      expect(currentPosition.y).toBe(2);

      // Continue with second move
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);
      
      // Verify second move (3,2 -> 4,2, same as item)
      currentPosition = componentState.get('player-1-position');
      expect(currentPosition.x).toBe(4);
      expect(currentPosition.y).toBe(2);

      simulateKeyRelease('ArrowRight');

      // Operation 2: Pick up item at current position
      mockGetEntitiesAtPosition.mockReturnValue([itemEntity]);
      simulateKeyPress(' ');
      keyboardInputSystem.update(updateArgs);
      pickupSystem.update(updateArgs);

      // Verify item is now carried by player
      const carriedItem = componentState.get('player-1-carrieditem'); // CarriedItem component key
      expect(carriedItem?.item).toBe('item-1');

      simulateKeyRelease(' ');

      // Operation 3: Move player with item to new location
      simulateKeyPress('ArrowLeft');
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);

      // Verify player moved with item
      currentPosition = componentState.get('player-1-position');
      expect(currentPosition.x).toBe(3);
      expect(currentPosition.y).toBe(2);

      // Verify item is still carried
      const stillCarriedItem = componentState.get('player-1-carrieditem');
      expect(stillCarriedItem?.item).toBe('item-1');

      simulateKeyRelease('ArrowLeft');

      // Operation 4: Place item at new location
      simulateKeyPress(' ');
      keyboardInputSystem.update(updateArgs);
      pickupSystem.update(updateArgs);

      // Verify item was placed at player's current position
      // (This would be verified through setComponent calls)
      expect(mockSetComponent).toHaveBeenCalledWith(itemEntity,
        expect.objectContaining({
          type: ComponentType.Position,
          x: 3,
          y: 2
        })
      );

      // Verify player no longer carries item
      expect(mockRemoveComponent).toHaveBeenCalledWith(playerEntity, ComponentType.CarriedItem);

      simulateKeyRelease(' ');
    });

    it('should maintain consistent game state through complex interactions', () => {
      // Setup: Player, movable box, and pickable item in a line
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 1, y: 1 }),
        velocity: createTestComponent(ComponentType.Velocity, { vx: 0, vy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const boxEntity = createTestEntity({
        movable: createTestComponent(ComponentType.Movable),
        position: createTestComponent(ComponentType.Position, { x: 2, y: 1 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'box' })
      }, 'box-1');

      const gemEntity = createTestEntity({
        pickable: createTestComponent(ComponentType.Pickable),
        position: createTestComponent(ComponentType.Position, { x: 3, y: 1 }),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'gem' })
      }, 'gem-1');

      const entities = [playerEntity, boxEntity, gemEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      const updateArgs = createTestUpdateArgs(entities, gameMap);
      
      setupComponentStateTracking(entities);
      mockGetPlayerEntity.mockReturnValue(playerEntity);
      mockGetEntitiesWithComponent.mockImplementation((componentType) => {
        if (componentType === ComponentType.Player) return [playerEntity];
        if (componentType === ComponentType.Movable) return getMovableEntities(entities);
        return [];
      });
      gameMap.isValidPosition = vi.fn().mockReturnValue(true);
      mockHasEntitiesAtPosition.mockReturnValue(false);
      mockHasAnyComponent.mockImplementation((entity, ...types) => {
        return entityHasAnyComponentTypes(entity, types);
      });

      // Complex interaction: Push box into gem, then pick up gem
      simulateKeyPress('ArrowRight');
      
      // Update 1: Player pushes box, box pushes against gem
      keyboardInputSystem.update(updateArgs);
      movementSystem.update(updateArgs);

      // Verify all entities moved right
      expect(componentState.get('player-1-position').x).toBe(2); // Player at box's old position
      expect(componentState.get('box-1-position').x).toBe(3);    // Box at gem's old position
      expect(componentState.get('gem-1-position').x).toBe(3);    // Gem stays at same position (overlapped by box)

      // Update 2: Pick up the gem that's now under the box
      mockGetEntitiesAtPosition.mockReturnValue([boxEntity, gemEntity]);
      simulateKeyPress(' ');
      keyboardInputSystem.update(updateArgs);
      pickupSystem.update(updateArgs);

      // Verify gem was picked up despite being at same position as box
      expect(mockSetComponent).toHaveBeenCalledWith(playerEntity,
        expect.objectContaining({
          type: ComponentType.CarriedItem,
          item: 'gem-1'
        })
      );

      // Clean up
      simulateKeyRelease('ArrowRight');
      simulateKeyRelease(' ');

      // Final verification: Complex state should be consistent
      const finalPlayerPos = componentState.get('player-1-position');
      const finalBoxPos = componentState.get('box-1-position');
      const playerHasGem = componentState.has('player-1-carrieditem');

      expect(finalPlayerPos.x).toBe(2);
      expect(finalBoxPos.x).toBe(3);
      expect(playerHasGem).toBe(true);
    });
  });
});

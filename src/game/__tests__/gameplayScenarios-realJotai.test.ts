import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyboardInputSystem } from '../systems/KeyboardInputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { PickupSystem } from '../systems/PickupSystem';
import { createTestEntity, createTestComponent, createTestUpdateArgs, createMockGameMap } from '../../__tests__/testUtils';
import { ComponentType } from '../components/ComponentTypes';
import type { Entity } from '../utils/ecsUtils';
import { createStore } from 'jotai';
import { 
  entitiesAtom, 
  mapAtom, 
  spritesheetsAtom, 
  mapConfigAtom 
} from '../utils/Atoms';

let testStore: ReturnType<typeof createStore>;

// Mock ComponentOperations to use test store instead of global store
vi.mock('../components/ComponentOperations', async () => {
  const actual = await vi.importActual('../components/ComponentOperations');
  
  return {
    ...actual,
    setComponent: vi.fn((entity: Entity, component: any) => {
      testStore.set(entitiesAtom, (entities) => {
        return entities.map((e) => {
          if (e.id === entity.id) {
            return {
              ...e,
              components: {
                ...e.components,
                [component.type]: component,
              },
            };
          }
          return e;
        });
      });
    }),
    setComponents: vi.fn((entity: Entity, ...components: any[]) => {
      testStore.set(entitiesAtom, (entities) => {
        return entities.map((e) => {
          if (e.id === entity.id) {
            return {
              ...e,
              components: {
                ...e.components,
                ...components.reduce(
                  (accumulation, component) => ({
                    ...accumulation,
                    [component.type]: component,
                  }),
                  {},
                ),
              },
            };
          }
          return e;
        });
      });
    })
  };
});

// Mock getTexture function to return mock texture
vi.mock('../utils/Atoms', async () => {
  const actual = await vi.importActual('../utils/Atoms');
  return {
    ...actual,
    getTexture: vi.fn(() => ({ name: 'mock-texture' }))
  };
});

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
  Sprite: vi.fn(() => ({
    position: { set: vi.fn() },
    width: 32,
    height: 32
  })),
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

import { 
  getComponentIfExists
} from '../components/ComponentOperations';

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

// Test store and helper functions
function setupTestStore(entities: Entity[], gameMap?: any) {
  testStore = createStore();
  
  testStore.set(entitiesAtom, entities);
  if (gameMap) {
    testStore.set(mapAtom, gameMap);
  }
  testStore.set(mapConfigAtom, { tileSize: 32 });
  testStore.set(spritesheetsAtom, []);
  
  vi.doMock('../../App', () => ({
    store: testStore
  }));
}

// Helper function to simulate keyboard events
function simulateKeyPress(key: string) {
  mockEventListeners['keydown']?.forEach(callback => callback({ key }));
}

function simulateKeyRelease(key: string) {
  mockEventListeners['keyup']?.forEach(callback => callback({ key }));
}

describe('Core Gameplay Scenarios - Real Jotai Integration', () => {
  let keyboardInputSystem: KeyboardInputSystem;
  let movementSystem: MovementSystem;
  let pickupSystem: PickupSystem;

  beforeEach(() => {
    vi.clearAllMocks();
    
    keyboardInputSystem = new KeyboardInputSystem();
    movementSystem = new MovementSystem();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Player Movement Workflow', () => {
    it('should handle complete movement workflow using real Jotai state: input → velocity → position', () => {
      const playerEntity = createTestEntity({
        player: createTestComponent(ComponentType.Player),
        position: createTestComponent(ComponentType.Position, { x: 5, y: 5 }),
        velocity: createTestComponent(ComponentType.Velocity, { vx: 0, vy: 0 }),
        movable: createTestComponent(ComponentType.Movable),
        sprite: createTestComponent(ComponentType.Sprite, { sprite: 'player' })
      }, 'player-1');

      const entities = [playerEntity];
      const gameMap = createMockGameMap(10, 10, entities);
      
      setupTestStore(entities, gameMap);
      
      const updateArgs = createTestUpdateArgs(entities, gameMap);

      gameMap.isValidPosition = vi.fn().mockReturnValue(true);
      
      simulateKeyPress('ArrowRight');
      
      keyboardInputSystem.update(updateArgs);
      
      let entitiesAfterKeyboard = testStore.get(entitiesAtom);
      let playerAfterKeyboard = entitiesAfterKeyboard.find(e => e.id === 'player-1');
      let velocityAfterKeyboard = getComponentIfExists(playerAfterKeyboard!, ComponentType.Velocity);
      
      console.log('Velocity after keyboard input:', velocityAfterKeyboard);
      
      const updatedUpdateArgs = createTestUpdateArgs(entitiesAfterKeyboard, gameMap);
      movementSystem.update(updatedUpdateArgs);
      
      const updatedEntities = testStore.get(entitiesAtom);
      const updatedPlayer = updatedEntities.find(e => e.id === 'player-1');
      const positionComponent = getComponentIfExists(updatedPlayer!, ComponentType.Position);
      const velocityComponent = getComponentIfExists(updatedPlayer!, ComponentType.Velocity);
      
      console.log('Final position:', positionComponent);
      console.log('Final velocity:', velocityComponent);
      
      expect(positionComponent).toEqual(
        expect.objectContaining({
          type: ComponentType.Position,
          x: 6,
          y: 5
        })
      );

      expect(velocityComponent).toEqual(
        expect.objectContaining({
          type: ComponentType.Velocity,
          vx: 0,
          vy: 0
        })
      );
      
      simulateKeyRelease('ArrowRight');
    });
  });
});

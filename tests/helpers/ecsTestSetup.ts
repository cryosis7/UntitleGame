import { afterEach, beforeEach, vi } from 'vitest';
import { setupPixiMocks } from '../mocks/pixiMocks';
import { createStore } from 'jotai';
import { entitiesAtom, mapAtom, systemsAtom, spritesheetsAtom, mapConfigAtom } from '../../src/game/utils/Atoms';
import { GameMap } from '../../src/game/map/GameMap';

let testStore: ReturnType<typeof createStore>;

/**
 * Standard test setup for ECS components and systems in describe blocks for consistent test environment
 * It initializes a Jotai store, sets up PIXI mocks, and provides a clean environment for each test.
 */
export function setupECSTestEnvironment() {
  beforeEach(async () => {
    vi.clearAllMocks();

    setupPixiMocks();

    testStore = createStore();
    testStore.set(entitiesAtom, []);
    testStore.set(systemsAtom, []);
    testStore.set(mapAtom, new GameMap());
    
    // Set up map config with default tile size
    testStore.set(mapConfigAtom, { tileSize: 32, rows: 10, cols: 10 });
    
    // Setup mock spritesheets for getTexture function
    const mockSpritesheet = {
      textures: {
        'opened-chest': { width: 32, height: 32, valid: true },
        'coin': { width: 16, height: 16, valid: true },
        'treasure': { width: 24, height: 24, valid: true },
        'coin1': { width: 16, height: 16, valid: true },
        'coin2': { width: 16, height: 16, valid: true },
        'transformed-sprite': { width: 32, height: 32, valid: true },
        'non-existent-sprite': { width: 32, height: 32, valid: true },
        // Add other commonly used sprite names in tests
      }
    };
    testStore.set(spritesheetsAtom, [mockSpritesheet as any]);

    // Import the actual Atoms module and replace the store's methods with our test store
    const atomsModule = await import('../../src/game/utils/Atoms');
    
    // Replace the store's methods with our test store
    Object.assign(atomsModule.store, {
      get: testStore.get.bind(testStore),
      set: testStore.set.bind(testStore),
      sub: testStore.sub.bind(testStore),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();

    if (testStore) {
      testStore.set(entitiesAtom, []);
      testStore.set(systemsAtom, []);
      testStore.set(mapAtom, new GameMap());
      testStore.set(spritesheetsAtom, []);
      testStore.set(mapConfigAtom, { tileSize: 32, rows: 10, cols: 10 });
    }
  });
}

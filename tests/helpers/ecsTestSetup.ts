import { afterEach, beforeEach, vi } from 'vitest';
import { setupPixiMocks } from '../mocks/pixiMocks';
import { createStore } from 'jotai';
import { entitiesAtom, mapAtom, systemsAtom } from '../../src/game/utils/Atoms';
import { GameMap } from '../../src/game/map/GameMap';

let testStore: ReturnType<typeof createStore>;

/**
 * Standard test setup for ECS components and systems in describe blocks for consistent test environment
 * It initializes a Jotai store, sets up PIXI mocks, and provides a clean environment for each test.
 */
export function setupECSTestEnvironment() {
  beforeEach(() => {
    vi.clearAllMocks();

    setupPixiMocks();

    // Mock the getTexture function to return dummy textures
    vi.doMock('../../src/game/utils/Atoms', async () => {
      const actual = await vi.importActual('../../src/game/utils/Atoms');
      return {
        ...actual,
        getTexture: vi
          .fn()
          .mockReturnValue({ name: 'mock-texture', width: 32, height: 32 }),
      };
    });

    testStore = createStore();
    testStore.set(entitiesAtom, []);
    testStore.set(systemsAtom, []);
    testStore.set(mapAtom, new GameMap());

    vi.doMock('../../src/App', () => ({
      store: testStore,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();

    if (testStore) {
      testStore.set(entitiesAtom, []);
      testStore.set(systemsAtom, []);
      testStore.set(mapAtom, new GameMap());
    }
  });
}

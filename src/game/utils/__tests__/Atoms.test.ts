import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStore } from 'jotai';
import { 
  spritesheetsAtom,
  addSpritesheetAtom,
  mapConfigAtom,
  updateMapConfigAtom,
  getTileSizeAtom,
  entitiesAtom,
  systemsAtom,
  mapAtom,
  playerAtom,
  getTexture
} from '../Atoms';
import { GameMap } from '../../map/GameMap';
import { createTestEntity } from '../../../__tests__/testUtils';
import { ComponentType } from '../../components/ComponentTypes';

// Mock the store from App
vi.mock('../../../App', () => ({
  store: {
    get: vi.fn(),
    set: vi.fn()
  }
}));

// Mock GameMap
vi.mock('../../map/GameMap');
const MockGameMap = vi.mocked(GameMap);

// Mock hasComponent function
vi.mock('../../components/ComponentOperations', () => ({
  hasComponent: vi.fn()
}));

import { store } from '../../../App';
import { hasComponent } from '../../components/ComponentOperations';

const mockStore = vi.mocked(store);
const mockHasComponent = vi.mocked(hasComponent);

describe('Atoms - Jotai State Management', () => {
  let testStore: ReturnType<typeof createStore>;

  beforeEach(() => {
    testStore = createStore();
    vi.clearAllMocks();
    MockGameMap.mockClear();
    
    // Reset mock store
    mockStore.get.mockClear();
    mockStore.set.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('spritesheetsAtom and related functionality', () => {
    it('should initialize with empty spritesheet array', () => {
      const spritesheets = testStore.get(spritesheetsAtom);
      expect(spritesheets).toEqual([]);
    });

    it('should add spritesheet using addSpritesheetAtom', () => {
      const mockSpritesheet = {
        textures: {
          'player': { name: 'player' },
          'wall': { name: 'wall' }
        },
        animations: {},
        data: {},
        parse: vi.fn(),
        destroy: vi.fn()
      } as any;

      testStore.set(addSpritesheetAtom, mockSpritesheet);
      const spritesheets = testStore.get(spritesheetsAtom);

      expect(spritesheets).toHaveLength(1);
      expect(spritesheets[0]).toBe(mockSpritesheet);
    });

    it('should add multiple spritesheets maintaining order', () => {
      const mockSpritesheet1 = { textures: { 'sprite1': {} }, name: 'sheet1' } as any;
      const mockSpritesheet2 = { textures: { 'sprite2': {} }, name: 'sheet2' } as any;

      testStore.set(addSpritesheetAtom, mockSpritesheet1);
      testStore.set(addSpritesheetAtom, mockSpritesheet2);
      
      const spritesheets = testStore.get(spritesheetsAtom);
      expect(spritesheets).toHaveLength(2);
      expect(spritesheets[0]).toBe(mockSpritesheet1);
      expect(spritesheets[1]).toBe(mockSpritesheet2);
    });

    it('should preserve existing spritesheets when adding new ones', () => {
      const sheet1 = { textures: { 'a': {} } } as any;
      const sheet2 = { textures: { 'b': {} } } as any;
      const sheet3 = { textures: { 'c': {} } } as any;

      testStore.set(spritesheetsAtom, [sheet1, sheet2]);
      testStore.set(addSpritesheetAtom, sheet3);
      
      const spritesheets = testStore.get(spritesheetsAtom);
      expect(spritesheets).toEqual([sheet1, sheet2, sheet3]);
    });
  });

  describe('getTexture function', () => {
    it('should return texture from spritesheet when found', () => {
      const mockTexture = { name: 'player_texture' };
      const mockSpritesheet = {
        textures: {
          'player': mockTexture,
          'wall': { name: 'wall_texture' }
        }
      } as any;

      const mockSpritesheets = [mockSpritesheet];
      mockStore.get.mockReturnValue(mockSpritesheets);
      
      const result = getTexture('player');
      expect(result).toBe(mockTexture);
    });

    it('should return null when texture not found', () => {
      const mockSpritesheet = {
        textures: {
          'player': { name: 'player_texture' }
        }
      } as any;

      const mockSpritesheets = [mockSpritesheet];
      mockStore.get.mockReturnValue(mockSpritesheets);
      
      const result = getTexture('nonexistent');
      expect(result).toBeNull();
    });

    it('should search through multiple spritesheets', () => {
      const texture1 = { name: 'texture1' };
      const texture2 = { name: 'texture2' };
      
      const spritesheet1 = { textures: { 'sprite1': texture1 } } as any;
      const spritesheet2 = { textures: { 'sprite2': texture2 } } as any;

      const mockSpritesheets = [spritesheet1, spritesheet2];
      mockStore.get.mockReturnValue(mockSpritesheets);
      
      expect(getTexture('sprite1')).toBe(texture1);
      expect(getTexture('sprite2')).toBe(texture2);
    });

    it('should return first matching texture if found in multiple spritesheets', () => {
      const texture1 = { name: 'first_texture' };
      const texture2 = { name: 'second_texture' };
      
      const spritesheet1 = { textures: { 'duplicate': texture1 } } as any;
      const spritesheet2 = { textures: { 'duplicate': texture2 } } as any;

      const mockSpritesheets = [spritesheet1, spritesheet2];
      mockStore.get.mockReturnValue(mockSpritesheets);
      
      const result = getTexture('duplicate');
      expect(result).toBe(texture1);
    });

    it('should return null when no spritesheets exist', () => {
      const mockSpritesheets: any[] = [];
      mockStore.get.mockReturnValue(mockSpritesheets);
      
      const result = getTexture('any_texture');
      expect(result).toBeNull();
    });
  });

  describe('mapConfigAtom and related functionality', () => {
    it('should initialize mapConfigAtom as undefined', () => {
      const config = testStore.get(mapConfigAtom);
      expect(config).toBeUndefined();
    });

    it('should update map config using updateMapConfigAtom', () => {
      const initialConfig = { rows: 10, cols: 15 };
      testStore.set(mapConfigAtom, initialConfig);
      
      const update = { tileSize: 32 };
      testStore.set(updateMapConfigAtom, update);
      
      const finalConfig = testStore.get(mapConfigAtom);
      expect(finalConfig).toEqual({
        rows: 10,
        cols: 15,
        tileSize: 32
      });
    });

    it('should handle partial updates to map config', () => {
      const initialConfig = { rows: 8, cols: 12, tileSize: 16 };
      testStore.set(mapConfigAtom, initialConfig);
      
      const update = { cols: 20 }; // Only update cols
      testStore.set(updateMapConfigAtom, update);
      
      const finalConfig = testStore.get(mapConfigAtom);
      expect(finalConfig).toEqual({
        rows: 8,
        cols: 20,
        tileSize: 16
      });
    });

    it('should overwrite existing properties in map config', () => {
      const initialConfig = { rows: 5, cols: 5, tileSize: 24 };
      testStore.set(mapConfigAtom, initialConfig);
      
      const update = { rows: 10, tileSize: 48 };
      testStore.set(updateMapConfigAtom, update);
      
      const finalConfig = testStore.get(mapConfigAtom);
      expect(finalConfig).toEqual({
        rows: 10,
        cols: 5,
        tileSize: 48
      });
    });

    it('should handle update when mapConfigAtom is initially undefined', () => {
      // mapConfigAtom starts as undefined
      const update = { rows: 6, cols: 8 };
      testStore.set(updateMapConfigAtom, update);
      
      const finalConfig = testStore.get(mapConfigAtom);
      expect(finalConfig).toEqual({
        rows: 6,
        cols: 8
      });
    });
  });

  describe('getTileSizeAtom', () => {
    it('should return tileSize from mapConfig when available', () => {
      testStore.set(mapConfigAtom, { rows: 10, cols: 10, tileSize: 64 });
      
      const tileSize = testStore.get(getTileSizeAtom);
      expect(tileSize).toBe(64);
    });

    it('should return 0 when mapConfig is undefined', () => {
      // mapConfigAtom is undefined by default
      const tileSize = testStore.get(getTileSizeAtom);
      expect(tileSize).toBe(0);
    });

    it('should return 0 when mapConfig exists but tileSize is undefined', () => {
      testStore.set(mapConfigAtom, { rows: 5, cols: 5 }); // No tileSize property
      
      const tileSize = testStore.get(getTileSizeAtom);
      expect(tileSize).toBe(0);
    });

    it('should return 0 when tileSize is null', () => {
      testStore.set(mapConfigAtom, { rows: 5, cols: 5, tileSize: null as any });
      
      const tileSize = testStore.get(getTileSizeAtom);
      expect(tileSize).toBe(0);
    });

    it('should handle various tileSize values correctly', () => {
      const testSizes = [8, 16, 32, 48, 64, 128];
      
      for (const size of testSizes) {
        testStore.set(mapConfigAtom, { tileSize: size });
        const retrievedSize = testStore.get(getTileSizeAtom);
        expect(retrievedSize).toBe(size);
      }
    });
  });

  describe('entitiesAtom', () => {
    it('should initialize with empty entity array', () => {
      const entities = testStore.get(entitiesAtom);
      expect(entities).toEqual([]);
    });

    it('should store and retrieve entities', () => {
      const testEntities = [
        createTestEntity({}, '1'),
        createTestEntity({}, '2'),
        createTestEntity({}, '3')
      ];
      
      testStore.set(entitiesAtom, testEntities);
      const retrievedEntities = testStore.get(entitiesAtom);
      
      expect(retrievedEntities).toEqual(testEntities);
      expect(retrievedEntities).toHaveLength(3);
    });

    it('should handle entity updates', () => {
      const initialEntities = [createTestEntity({}, '1')];
      testStore.set(entitiesAtom, initialEntities);
      
      const updatedEntities = [
        createTestEntity({}, '1'),
        createTestEntity({}, '2')
      ];
      testStore.set(entitiesAtom, updatedEntities);
      
      const finalEntities = testStore.get(entitiesAtom);
      expect(finalEntities).toEqual(updatedEntities);
      expect(finalEntities).toHaveLength(2);
    });
  });

  describe('systemsAtom', () => {
    it('should initialize with empty systems array', () => {
      const systems = testStore.get(systemsAtom);
      expect(systems).toEqual([]);
    });

    it('should store and retrieve systems', () => {
      const mockSystems = [
        { update: vi.fn(), name: 'System1' },
        { update: vi.fn(), name: 'System2' }
      ] as any[];
      
      testStore.set(systemsAtom, mockSystems);
      const retrievedSystems = testStore.get(systemsAtom);
      
      expect(retrievedSystems).toEqual(mockSystems);
      expect(retrievedSystems).toHaveLength(2);
    });
  });

  describe('mapAtom', () => {
    it('should initialize with a new GameMap instance', () => {
      // The mapAtom initializes with a new GameMap() directly
      const gameMap = testStore.get(mapAtom);
      expect(gameMap).toBeInstanceOf(GameMap);
    });

    it('should allow setting a different GameMap instance', () => {
      const newGameMap = new GameMap() as any;
      testStore.set(mapAtom, newGameMap);
      
      const retrievedMap = testStore.get(mapAtom);
      expect(retrievedMap).toBe(newGameMap);
    });
  });

  describe('playerAtom', () => {
    it('should return undefined when no entities exist', () => {
      testStore.set(entitiesAtom, []);
      const player = testStore.get(playerAtom);
      expect(player).toBeUndefined();
    });

    it('should return undefined when no player component exists', () => {
      const entities = [
        createTestEntity({}, '1'),
        createTestEntity({}, '2')
      ];
      testStore.set(entitiesAtom, entities);
      
      mockHasComponent.mockReturnValue(false);
      
      const player = testStore.get(playerAtom);
      expect(player).toBeUndefined();
    });

    it('should return player entity when player component exists', () => {
      const regularEntity = createTestEntity({}, '1');
      const playerEntity = createTestEntity({}, '2');
      const entities = [regularEntity, playerEntity];
      
      testStore.set(entitiesAtom, entities);
      
      mockHasComponent.mockImplementation((entity, componentType) => {
        return entity.id === '2' && componentType === ComponentType.Player;
      });
      
      const player = testStore.get(playerAtom);
      expect(player).toBe(playerEntity);
      expect(mockHasComponent).toHaveBeenCalledWith(regularEntity, ComponentType.Player);
      expect(mockHasComponent).toHaveBeenCalledWith(playerEntity, ComponentType.Player);
    });

    it('should return first player entity when multiple players exist', () => {
      const playerEntity1 = createTestEntity({}, '1');
      const playerEntity2 = createTestEntity({}, '2');
      const entities = [playerEntity1, playerEntity2];
      
      testStore.set(entitiesAtom, entities);
      
      mockHasComponent.mockReturnValue(true); // All entities are players
      
      const player = testStore.get(playerAtom);
      expect(player).toBe(playerEntity1); // Should return first match
    });

    it('should update when entities array changes', () => {
      // Initial state - no player
      const initialEntities = [createTestEntity({}, '1')];
      testStore.set(entitiesAtom, initialEntities);
      mockHasComponent.mockReturnValue(false);
      
      expect(testStore.get(playerAtom)).toBeUndefined();
      
      // Add player entity
      const playerEntity = createTestEntity({}, '2');
      const updatedEntities = [initialEntities[0], playerEntity];
      testStore.set(entitiesAtom, updatedEntities);
      
      mockHasComponent.mockImplementation((entity) => entity.id === '2');
      
      const player = testStore.get(playerAtom);
      expect(player).toBe(playerEntity);
    });
  });

  describe('atom integration and state consistency', () => {
    it('should maintain independent state between different atoms', () => {
      // Set up various atoms with data
      const entities = [createTestEntity({}, '1')];
      const mapConfig = { rows: 10, cols: 10, tileSize: 32 };
      const spritesheets = [{ textures: {} }] as any;
      
      testStore.set(entitiesAtom, entities);
      testStore.set(mapConfigAtom, mapConfig);
      testStore.set(spritesheetsAtom, spritesheets);
      
      // Verify each atom maintains its own state
      expect(testStore.get(entitiesAtom)).toEqual(entities);
      expect(testStore.get(mapConfigAtom)).toEqual(mapConfig);
      expect(testStore.get(spritesheetsAtom)).toEqual(spritesheets);
      expect(testStore.get(getTileSizeAtom)).toBe(32);
    });

    it('should handle derived atom updates when base atoms change', () => {
      // getTileSizeAtom is derived from mapConfigAtom
      testStore.set(mapConfigAtom, { tileSize: 16 });
      expect(testStore.get(getTileSizeAtom)).toBe(16);
      
      testStore.set(updateMapConfigAtom, { tileSize: 64 });
      expect(testStore.get(getTileSizeAtom)).toBe(64);
    });

    it('should handle playerAtom updates when entitiesAtom changes', () => {
      // Start with no player
      testStore.set(entitiesAtom, [createTestEntity({}, '1')]);
      mockHasComponent.mockReturnValue(false);
      expect(testStore.get(playerAtom)).toBeUndefined();
      
      // Add player
      const playerEntity = createTestEntity({}, 'player');
      testStore.set(entitiesAtom, [createTestEntity({}, '1'), playerEntity]);
      mockHasComponent.mockImplementation((entity) => entity.id === 'player');
      
      expect(testStore.get(playerAtom)).toBe(playerEntity);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle null/undefined values gracefully where supported', () => {
      // Test mapConfigAtom with null
      testStore.set(mapConfigAtom, null as any);
      expect(testStore.get(getTileSizeAtom)).toBe(0);
      
      // Test empty entities array (should not throw)
      testStore.set(entitiesAtom, []);
      expect(() => testStore.get(playerAtom)).not.toThrow();
      expect(testStore.get(playerAtom)).toBeUndefined();
    });

    it('should handle empty arrays and objects', () => {
      testStore.set(entitiesAtom, []);
      testStore.set(spritesheetsAtom, []);
      testStore.set(mapConfigAtom, {});
      
      expect(testStore.get(entitiesAtom)).toEqual([]);
      expect(testStore.get(spritesheetsAtom)).toEqual([]);
      expect(testStore.get(mapConfigAtom)).toEqual({});
      expect(testStore.get(getTileSizeAtom)).toBe(0);
    });

    it('should handle malformed spritesheet objects', () => {
      const malformedSheet = { /* missing textures property */ } as any;
      const mockSpritesheets = [malformedSheet];
      mockStore.get.mockReturnValue(mockSpritesheets);
      
      // getTexture will throw because spritesheet.textures is undefined
      // This test documents the current behavior - it doesn't gracefully handle missing textures
      expect(() => getTexture('any')).toThrow();
    });
  });
});

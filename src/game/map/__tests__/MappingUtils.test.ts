import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  gridToScreen,
  gridToScreenAsTuple,
  screenToGrid,
} from '../../map/MappingUtils';
import { store } from '../../../App';
import { getTileSizeAtom, mapConfigAtom } from '../../utils/Atoms';

// Mock the store and atoms
vi.mock('../../../App', () => ({
  store: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('../../utils/Atoms', async () => {
  const actual = await vi.importActual('../../utils/Atoms');
  return {
    ...actual,
    getTileSizeAtom: { __brand: 'atom' }, // Mock atom
  };
});

const mockStore = vi.mocked(store);

describe('MappingUtils', () => {
  const mockTileSize = 32;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for tile size
    mockStore.get.mockReturnValue(mockTileSize);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('gridToScreen', () => {
    it('should convert grid position to screen coordinates using default tile size', () => {
      const gridPosition = { x: 5, y: 3 };
      const result = gridToScreen(gridPosition);

      expect(mockStore.get).toHaveBeenCalledWith(getTileSizeAtom);
      expect(result).toEqual({
        x: 5 * mockTileSize, // 160
        y: 3 * mockTileSize, // 96
      });
    });

    it('should convert grid position to screen coordinates using provided tile size', () => {
      const gridPosition = { x: 2, y: 4 };
      const customTileSize = 64;
      const result = gridToScreen(gridPosition, customTileSize);

      // Should not call store.get when tileSize is provided
      expect(mockStore.get).not.toHaveBeenCalled();
      expect(result).toEqual({
        x: 2 * customTileSize, // 128
        y: 4 * customTileSize, // 256
      });
    });

    it('should handle zero coordinates', () => {
      const gridPosition = { x: 0, y: 0 };
      const result = gridToScreen(gridPosition);

      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should handle negative coordinates', () => {
      const gridPosition = { x: -2, y: -1 };
      const result = gridToScreen(gridPosition);

      expect(result).toEqual({
        x: -2 * mockTileSize, // -64
        y: -1 * mockTileSize, // -32
      });
    });

    it('should handle large coordinates', () => {
      const gridPosition = { x: 1000, y: 500 };
      const result = gridToScreen(gridPosition);

      expect(result).toEqual({
        x: 1000 * mockTileSize, // 32000
        y: 500 * mockTileSize, // 16000
      });
    });

    it('should handle fractional coordinates by preserving them in calculation', () => {
      const gridPosition = { x: 2.5, y: 1.75 };
      const result = gridToScreen(gridPosition);

      expect(result).toEqual({
        x: 2.5 * mockTileSize, // 80
        y: 1.75 * mockTileSize, // 56
      });
    });

    it('should handle zero tile size', () => {
      mockStore.get.mockReturnValue(0);
      const gridPosition = { x: 5, y: 3 };
      const result = gridToScreen(gridPosition);

      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  describe('gridToScreenAsTuple', () => {
    it('should convert grid position to screen coordinates tuple using default tile size', () => {
      const gridPosition = { x: 3, y: 2 };
      const result = gridToScreenAsTuple(gridPosition);

      expect(mockStore.get).toHaveBeenCalledWith(getTileSizeAtom);
      expect(result).toEqual([
        3 * mockTileSize, // 96
        2 * mockTileSize, // 64
      ]);
    });

    it('should convert grid position using custom tile size and no gap', () => {
      const gridPosition = { x: 1, y: 4 };
      const config = { tileSize: 48 };
      const result = gridToScreenAsTuple(gridPosition, config);

      // Should not call store.get when tileSize is provided
      expect(mockStore.get).not.toHaveBeenCalled();
      expect(result).toEqual([
        1 * 48, // 48
        4 * 48, // 192
      ]);
    });

    it('should convert grid position using default tile size with gap', () => {
      const gridPosition = { x: 2, y: 1 };
      const config = { gap: 4 };
      const result = gridToScreenAsTuple(gridPosition, config);

      expect(mockStore.get).toHaveBeenCalledWith(getTileSizeAtom);
      expect(result).toEqual([
        2 * (mockTileSize + 4), // 2 * 36 = 72
        1 * (mockTileSize + 4), // 1 * 36 = 36
      ]);
    });

    it('should convert grid position using custom tile size and gap', () => {
      const gridPosition = { x: 3, y: 2 };
      const config = { tileSize: 24, gap: 2 };
      const result = gridToScreenAsTuple(gridPosition, config);

      expect(mockStore.get).not.toHaveBeenCalled();
      expect(result).toEqual([
        3 * (24 + 2), // 3 * 26 = 78
        2 * (24 + 2), // 2 * 26 = 52
      ]);
    });

    it('should handle zero coordinates', () => {
      const gridPosition = { x: 0, y: 0 };
      const result = gridToScreenAsTuple(gridPosition);

      expect(result).toEqual([0, 0]);
    });

    it('should handle negative coordinates', () => {
      const gridPosition = { x: -1, y: -2 };
      const result = gridToScreenAsTuple(gridPosition);

      expect(result).toEqual([
        -1 * mockTileSize, // -32
        -2 * mockTileSize, // -64
      ]);
    });

    it('should handle zero gap', () => {
      const gridPosition = { x: 2, y: 3 };
      const config = { gap: 0 };
      const result = gridToScreenAsTuple(gridPosition, config);

      expect(result).toEqual([
        2 * mockTileSize, // 64
        3 * mockTileSize, // 96
      ]);
    });

    it('should handle negative gap', () => {
      const gridPosition = { x: 2, y: 1 };
      const config = { gap: -4 };
      const result = gridToScreenAsTuple(gridPosition, config);

      expect(result).toEqual([
        2 * (mockTileSize - 4), // 2 * 28 = 56
        1 * (mockTileSize - 4), // 1 * 28 = 28
      ]);
    });
  });

  describe('screenToGrid', () => {
    it('should convert screen position to grid coordinates using default tile size', () => {
      const screenPosition = { x: 96, y: 64 };
      const result = screenToGrid(screenPosition);

      expect(mockStore.get).toHaveBeenCalledWith(getTileSizeAtom);
      expect(result).toEqual({
        x: Math.floor(96 / mockTileSize), // 3
        y: Math.floor(64 / mockTileSize), // 2
      });
    });

    it('should convert screen position to grid coordinates using provided tile size', () => {
      const screenPosition = { x: 120, y: 180 };
      const customTileSize = 60;
      const result = screenToGrid(screenPosition, customTileSize);

      // Should not call store.get when tileSize is provided
      expect(mockStore.get).not.toHaveBeenCalled();
      expect(result).toEqual({
        x: Math.floor(120 / customTileSize), // 2
        y: Math.floor(180 / customTileSize), // 3
      });
    });

    it('should handle zero coordinates', () => {
      const screenPosition = { x: 0, y: 0 };
      const result = screenToGrid(screenPosition);

      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should handle negative coordinates by flooring toward negative infinity', () => {
      const screenPosition = { x: -50, y: -40 };
      const result = screenToGrid(screenPosition);

      expect(result).toEqual({
        x: Math.floor(-50 / mockTileSize), // Math.floor(-1.5625) = -2
        y: Math.floor(-40 / mockTileSize), // Math.floor(-1.25) = -2
      });
    });

    it('should handle fractional coordinates by flooring', () => {
      const screenPosition = { x: 95.8, y: 63.2 };
      const result = screenToGrid(screenPosition);

      expect(result).toEqual({
        x: Math.floor(95.8 / mockTileSize), // Math.floor(2.99375) = 2
        y: Math.floor(63.2 / mockTileSize), // Math.floor(1.975) = 1
      });
    });

    it('should handle exact tile boundaries', () => {
      const screenPosition = { x: 64, y: 32 }; // Exactly 2 tiles by 1 tile
      const result = screenToGrid(screenPosition);

      expect(result).toEqual({
        x: Math.floor(64 / mockTileSize), // 2
        y: Math.floor(32 / mockTileSize), // 1
      });
    });

    it('should handle large coordinates', () => {
      const screenPosition = { x: 3200, y: 1600 };
      const result = screenToGrid(screenPosition);

      expect(result).toEqual({
        x: Math.floor(3200 / mockTileSize), // 100
        y: Math.floor(1600 / mockTileSize), // 50
      });
    });
  });

  describe('bidirectional conversion consistency', () => {
    it('should maintain consistency between gridToScreen and screenToGrid for integer coordinates', () => {
      const originalGrid = { x: 5, y: 3 };
      const screenPos = gridToScreen(originalGrid);
      const backToGrid = screenToGrid(screenPos);

      expect(backToGrid).toEqual(originalGrid);
    });

    it('should maintain consistency for multiple coordinate pairs', () => {
      const testCoordinates = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 10, y: 5 },
        { x: -2, y: -3 },
        { x: 100, y: 50 },
      ];

      for (const coords of testCoordinates) {
        const screenPos = gridToScreen(coords);
        const backToGrid = screenToGrid(screenPos);
        expect(backToGrid).toEqual(coords);
      }
    });

    it('should handle consistency with custom tile sizes', () => {
      const originalGrid = { x: 7, y: 2 };
      const customTileSize = 48;
      const screenPos = gridToScreen(originalGrid, customTileSize);
      const backToGrid = screenToGrid(screenPos, customTileSize);

      expect(backToGrid).toEqual(originalGrid);
    });
  });

  describe('boundary conditions and edge cases', () => {
    it('should handle very small tile sizes', () => {
      const gridPosition = { x: 10, y: 5 };
      const tinyTileSize = 1;
      const result = gridToScreen(gridPosition, tinyTileSize);

      expect(result).toEqual({ x: 10, y: 5 });
    });

    it('should handle very large tile sizes', () => {
      const gridPosition = { x: 2, y: 1 };
      const hugeTileSize = 1000;
      const result = gridToScreen(gridPosition, hugeTileSize);

      expect(result).toEqual({ x: 2000, y: 1000 });
    });

    it('should handle fractional tile sizes', () => {
      const gridPosition = { x: 4, y: 2 };
      const fractionalTileSize = 16.5;
      const result = gridToScreen(gridPosition, fractionalTileSize);

      expect(result).toEqual({ x: 66, y: 33 });
    });

    it('should handle when store.get returns undefined/null for tile size', () => {
      mockStore.get.mockReturnValue(undefined);
      const gridPosition = { x: 2, y: 3 };
      const result = gridToScreen(gridPosition);

      // When tileSize is undefined, multiplication should result in NaN
      expect(result.x).toBeNaN();
      expect(result.y).toBeNaN();
    });
  });
});

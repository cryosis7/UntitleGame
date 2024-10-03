import { describe, it, expect } from 'vitest';
import {
  isPositionInMap,
  getTileAtPosition,
  getTileAtPlayerPosition,
  getAdjacentPosition,
  isTileWalkable,
  canMoveInDirection,
  movePlayer,
  initMap,
} from './mapUtils';
import type { Direction } from './mapUtils';

const mockTile: TileModel = {
  id: '1',
  properties: {
    position: { x: 0, y: 0 },
    color: 'black',
    walkable: true,
  },
};

const mockPlayer: PlayerModel = {
  id: 'player1',
  properties: {
    position: { x: 0, y: 0 },
    name: 'Player1',
  },
};

const mockMap: TileModel[][] = [
  [
    mockTile,
    {
      ...mockTile,
      properties: { ...mockTile.properties, position: { x: 1, y: 0 } },
    },
  ],
  [
    {
      ...mockTile,
      properties: { ...mockTile.properties, position: { x: 0, y: 1 } },
    },
    {
      ...mockTile,
      properties: { ...mockTile.properties, position: { x: 1, y: 1 } },
    },
  ],
];

describe('mapUtils', () => {
  describe('isValidPosition', () => {
    it('isValidPosition should return true for valid positions', () => {
      expect(isPositionInMap(mockMap, { x: 0, y: 0 })).toBe(true);
      expect(isPositionInMap(mockMap, { x: 1, y: 1 })).toBe(true);
    });

    it('isValidPosition should return false for invalid positions', () => {
      expect(isPositionInMap(mockMap, { x: -1, y: 0 })).toBe(false);
      expect(isPositionInMap(mockMap, { x: 0, y: -1 })).toBe(false);
      expect(isPositionInMap(mockMap, { x: 2, y: 0 })).toBe(false);
      expect(isPositionInMap(mockMap, { x: 0, y: 2 })).toBe(false);
    });
  });

  describe('getTileAtPosition', () => {
    it('getTileAtPosition should return the correct tile for valid positions', () => {
      expect(getTileAtPosition(mockMap, { x: 0, y: 0 })).toEqual(mockTile);
      expect(getTileAtPosition(mockMap, { x: 1, y: 1 })).toEqual({
        ...mockTile,
        properties: { ...mockTile.properties, position: { x: 1, y: 1 } },
      });
    });

    it('getTileAtPosition should return null for invalid positions', () => {
      expect(getTileAtPosition(mockMap, { x: -1, y: 0 })).toBeNull();
      expect(getTileAtPosition(mockMap, { x: 0, y: -1 })).toBeNull();
    });
  });

  describe('getTileAtPlayerPosition', () => {
    it('getTileAtPlayerPosition should return the correct tile for player position', () => {
      expect(getTileAtPlayerPosition(mockMap, mockPlayer)).toEqual(mockTile);
    });

    it('getTileAtPlayerPosition should return null for invalid player position', () => {
      const invalidPlayer = {
        ...mockPlayer,
        properties: { ...mockPlayer.properties, position: { x: -1, y: 0 } },
      };
      expect(getTileAtPlayerPosition(mockMap, invalidPlayer)).toBeNull();
    });
  });

  describe('getAdjacentPosition', () => {
    it('getAdjacentPosition should return the correct adjacent position', () => {
      expect(getAdjacentPosition({ x: 0, y: 0 }, 'up')).toEqual({
        x: 0,
        y: -1,
      });
      expect(getAdjacentPosition({ x: 0, y: 0 }, 'down')).toEqual({
        x: 0,
        y: 1,
      });
      expect(getAdjacentPosition({ x: 0, y: 0 }, 'left')).toEqual({
        x: -1,
        y: 0,
      });
      expect(getAdjacentPosition({ x: 0, y: 0 }, 'right')).toEqual({
        x: 1,
        y: 0,
      });
    });

    it('getAdjacentPosition should return the same position for invalid direction', () => {
      expect(
        getAdjacentPosition({ x: 0, y: 0 }, 'invalid' as unknown as Direction),
      ).toEqual({ x: 0, y: 0 });
    });
  });

  describe('isTileWalkable', () => {
    it('isTileWalkable should return true for walkable tiles', () => {
      expect(isTileWalkable(mockMap, { x: 0, y: 0 })).toBe(true);
    });

    it('isTileWalkable should return false for non-walkable tiles', () => {
      const nonWalkableTileMap = [
        [
          {
            ...mockTile,
            properties: { ...mockTile.properties, walkable: false },
          },
        ],
      ];
      expect(isTileWalkable(nonWalkableTileMap, { x: 0, y: 0 })).toBe(false);
    });
  });

  describe('canMoveInDirection', () => {
    it('canMoveInDirection should return true if player can move in the given direction', () => {
      expect(canMoveInDirection(mockMap, mockPlayer, 'right')).toBe(true);
    });

    it('canMoveInDirection should return false if player cannot move in the given direction', () => {
      const nonWalkableTileMap = [
        [
          {
            ...mockTile,
            properties: { ...mockTile.properties, walkable: false },
          },
        ],
      ];
      expect(canMoveInDirection(nonWalkableTileMap, mockPlayer, 'right')).toBe(
        false,
      );
    });

    it('canMoveInDirection should return false if player is at the edge of the map', () => {
      expect(canMoveInDirection(mockMap, mockPlayer, 'up')).toBe(false);
    });
  });

  describe('movePlayer', () => {
    it('movePlayer should return the player with updated position if move is valid', () => {
      expect(movePlayer(mockMap, mockPlayer, 'right')).toEqual({
        ...mockPlayer,
        properties: {
          ...mockPlayer.properties,
          position: { x: 1, y: 0 },
        },
      });
    });

    it('movePlayer should return the player with the same position if move is invalid', () => {
      const nonWalkableTileMap = [
        [
          {
            ...mockTile,
            properties: { ...mockTile.properties, walkable: false },
          },
        ],
      ];
      expect(movePlayer(nonWalkableTileMap, mockPlayer, 'right')).toEqual(
        mockPlayer,
      );
    });

    it('movePlayer should return the player with the same position if player is at the edge of the map', () => {
      expect(movePlayer(mockMap, mockPlayer, 'up')).toEqual(mockPlayer);
    });
  });

  describe('initialiseMap', () => {
    it('initialiseMap should return a map with the correct number of rows and columns', () => {
      const map = initMap(2, 2);
      expect(map.length).toBe(2);
      expect(map[0].length).toBe(2);
    });

    it('initialiseMap should return a map with the correct tile properties', () => {
      const map = initMap(2, 2);
      expect(map[0][0].properties.position).toEqual({ x: 0, y: 0 });
      expect(map[0][0].properties.color).toBe('black');
      expect(map[0][0].properties.walkable).toBe(true);
    });

    it('initialiseMap should return a map with unique tile ids', () => {
      const map = initMap(2, 2);
      expect(map[0][0].id).not.toBe(map[0][1].id);
      expect(map[0][0].id).not.toBe(map[1][0].id);
    });
  });
});

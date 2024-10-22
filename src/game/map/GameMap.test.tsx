import { describe, it, expect } from 'vitest';
import { GameMap } from './GameMap';

describe('GameMap', () => {
  let gameMap: GameMap;

  beforeEach(() => {
    gameMap = new GameMap(5, 5);
  });

  it.each`
    position           | expected
    ${{ x: 0, y: 0 }}  | ${true}
    ${{ x: 4, y: 4 }}  | ${true}
    ${{ x: 5, y: 5 }}  | ${false}
    ${{ x: -1, y: 0 }} | ${false}
  `(
    'should check if a position $position is within the map boundaries',
    ({ position, expected }) => {
      expect(gameMap.isPositionInMap(position)).toBe(expected);
    },
  );

  it.each`
    position          | expected
    ${{ x: 0, y: 0 }} | ${{ walkable: true }}
    ${{ x: 4, y: 4 }} | ${{ walkable: true }}
    ${{ x: 5, y: 5 }} | ${null}
  `('should get the tile at position $position', ({ position, expected }) => {
    expect(gameMap.getTile(position)).toEqual(expected);
  });

  it.each`
    position          | direction  | expected
    ${{ x: 2, y: 2 }} | ${'up'}    | ${{ x: 2, y: 1 }}
    ${{ x: 2, y: 2 }} | ${'down'}  | ${{ x: 2, y: 3 }}
    ${{ x: 2, y: 2 }} | ${'left'}  | ${{ x: 1, y: 2 }}
    ${{ x: 2, y: 2 }} | ${'right'} | ${{ x: 3, y: 2 }}
  `(
    'should get the adjacent position $expected when going $direction from $position',
    ({ position, direction, expected }) => {
      expect(gameMap.getAdjacentPosition(position, direction)).toEqual(
        expected,
      );
    },
  );

  it.each`
    position          | direction  | expectedTileLocation
    ${{ x: 2, y: 2 }} | ${'up'}    | ${{ x: 2, y: 1 }}
    ${{ x: 2, y: 2 }} | ${'down'}  | ${{ x: 2, y: 3 }}
    ${{ x: 2, y: 2 }} | ${'left'}  | ${{ x: 1, y: 2 }}
    ${{ x: 2, y: 2 }} | ${'right'} | ${{ x: 3, y: 2 }}
    ${{ x: 2, y: 0 }} | ${'up'}    | ${null}
    ${{ x: 0, y: 2 }} | ${'left'}  | ${null}
    ${{ x: 2, y: 4 }} | ${'down'}  | ${null}
    ${{ x: 4, y: 2 }} | ${'right'} | ${null}
  `(
    'should get the adjacent tile $expectedTileLocation from $position in direction $direction',
    ({ position, direction, expectedTileLocation }) => {
      const expectedTile = expectedTileLocation
        ? gameMap.getTile(expectedTileLocation)
        : null;
      expect(gameMap.getAdjacentTile(position, direction)).toEqual(
        expectedTile,
      );
    },
  );

  it.each`
    position          | expected
    ${{ x: 0, y: 0 }} | ${true}
    ${{ x: 4, y: 4 }} | ${true}
    ${{ x: 5, y: 5 }} | ${false}
  `(
    'should check if the tile at position $position is walkable',
    ({ position, expected }) => {
      expect(gameMap.isTileWalkable(position)).toBe(expected);
    },
  );
});

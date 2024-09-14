import type { PlayerModel } from '../models/PlayerModel';
import type { TileModel } from '../models/TileModel';
import { createTileModel } from '../models/TileModel';

export type Position = { x: number; y: number };

export type Direction = 'up' | 'down' | 'left' | 'right';

export const isPositionInMap = (
  map: TileModel[][],
  { x, y }: Position,
): boolean => {
  return x >= 0 && y >= 0 && y < map.length && x < map[y].length;
};

export const getTileAtPosition = (
  map: TileModel[][],
  { x, y }: Position,
): TileModel | null => {
  if (!isPositionInMap(map, { x, y })) {
    return null;
  }

  return map[y][x];
};

export const getTileAtPlayerPosition = (
  map: TileModel[][],
  player: PlayerModel,
): TileModel | null => {
  return getTileAtPosition(map, player.properties.position);
};

export const getAdjacentPosition = (
  { x, y }: Position,
  direction: Direction,
): { x: number; y: number } => {
  switch (direction) {
    case 'up':
      return { x, y: y - 1 };
    case 'down':
      return { x, y: y + 1 };
    case 'left':
      return { x: x - 1, y };
    case 'right':
      return { x: x + 1, y };
    default:
      return { x, y };
  }
};

export const isTileWalkable = (
  map: TileModel[][],
  { x, y }: Position,
): boolean => {
  const tileModel = getTileAtPosition(map, { x, y });
  return tileModel ? tileModel.properties.walkable : false;
};

export const canMoveInDirection = (
  map: TileModel[][],
  player: PlayerModel,
  direction: Direction,
): boolean => {
  const { x, y } = getAdjacentPosition(player.properties.position, direction);
  return isTileWalkable(map, { x, y });
};

export const movePlayer = (
  map: TileModel[][],
  player: PlayerModel,
  direction: Direction,
): PlayerModel => {
  if (!canMoveInDirection(map, player, direction)) {
    return player;
  }

  const newPosition = getAdjacentPosition(
    player.properties.position,
    direction,
  );
  return {
    ...player,
    properties: {
      ...player.properties,
      position: newPosition,
    },
  };
};

export const initMap = (rows: number, columns: number): TileModel[][] => {
  const map: TileModel[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: TileModel[] = [];
    for (let x = 0; x < columns; x++) {
      row.push(createTileModel({ position: { x, y }, walkable: true }));
    }
    map.push(row);
  }
  return map;
};

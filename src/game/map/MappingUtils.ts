import { getTileSizeAtom, store } from '../utils/Atoms';
import type { Position } from './GameMap';
import type { Direction } from '../components/individualComponents/DirectionComponent';

/**
 * Converts a grid position to a screen coordinate.
 * @param {Position} gridPosition - The grid position to convert.
 * @param {number} [tileSize] - Optional tile size to use for conversion. Defaults to the global tile size.
 * @returns {Position} The screen coordinate.
 */
export const gridToScreen = (
  gridPosition: Position,
  tileSize?: number,
): Position => {
  const size = tileSize ?? store.get(getTileSizeAtom);
  return {
    x: gridPosition.x * size,
    y: gridPosition.y * size,
  };
};

/**
 * Converts a grid position to a screen coordinate.
 * @param {Position} gridPosition - The grid position to convert.
 * @param config
 * @returns {[number, number]} The screen coordinates as [x, y].
 */
export const gridToScreenAsTuple = (
  gridPosition: Position,
  config?: {
    tileSize?: number;
    gap?: number;
  },
): [number, number] => {
  const size = config?.tileSize ?? store.get(getTileSizeAtom);
  const gap = config?.gap ?? 0;
  return [gridPosition.x * (size + gap), gridPosition.y * (size + gap)];
};

/**
 * Converts a screen coordinate to a grid position.
 * @param {Position} screenPosition - The screen coordinate to convert.
 * @param {number} [tileSize] - Optional tile size to use for conversion. Defaults to the global tile size.
 * @returns {Position} The grid position.
 */
export const screenToGrid = (
  screenPosition: Position,
  tileSize?: number,
): Position => {
  const size = tileSize ?? store.get(getTileSizeAtom);
  return {
    x: Math.floor(screenPosition.x / size),
    y: Math.floor(screenPosition.y / size),
  };
};

export const getAdjacentPosition = (
  { x, y }: Position,
  direction: Direction,
): Position => {
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

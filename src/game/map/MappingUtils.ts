import { getTileSizeAtom } from '../utils/Atoms';
import { store } from '../../App';
import type { Position } from './GameMap';

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

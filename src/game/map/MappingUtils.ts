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
 * @param {number} [tileSize] - Optional tile size to use for conversion. Defaults to the global tile size.
 * @returns {[number, number]} The screen coordinates as [x, y].
 */
export const gridToScreenAsTuple = (
  gridPosition: Position,
  tileSize?: number,
): [number, number] => {
  const size = tileSize ?? store.get(getTileSizeAtom);
  return [gridPosition.x * size, gridPosition.y * size];
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

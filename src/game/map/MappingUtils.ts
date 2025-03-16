import { getTileSizeAtom } from '../utils/Atoms';
import { store } from '../../App';
import type { Position } from './GameMap';

/**
 * Converts a grid position to a screen coordinate.
 * @param {Position} gridPosition - The grid position to convert.
 * @returns {Position} The screen coordinate.
 */
export const gridToScreen = (gridPosition: Position): Position => {
  const tileSize = store.get(getTileSizeAtom);
  return {
    x: gridPosition.x * tileSize,
    y: gridPosition.y * tileSize,
  };
};

/**
 * Converts a grid position to a screen coordinate.
 * @param {Position} gridPosition - The grid position to convert.
 * @returns {[number, number]} The screen coordinates as [x, y].
 */
export const gridToScreenAsTuple = (gridPosition: Position): [number, number] => {
  const tileSize = store.get(getTileSizeAtom);
  return [gridPosition.x * tileSize, gridPosition.y * tileSize];
}

/**
 * Converts a screen coordinate to a grid position.
 * @param {Position} screenPosition - The screen coordinate to convert.
 * @returns {Position} The grid position.
 */
export const screenToGrid = (screenPosition: Position): Position => {
  const tileSize = store.get(getTileSizeAtom);
  return {
    x: Math.floor(screenPosition.x / tileSize),
    y: Math.floor(screenPosition.y / tileSize),
  };
};
import type { SpriteConfig } from '../atoms';
import { getMapConfigAtom, store } from '../atoms';
import type { Position } from './GameMap';
import type { Direction } from '../components';

/**
 * Converts a grid position to a screen coordinate.
 * @param {Position} gridPosition - The grid position to convert.
 * @param config
 * @returns {Position} The screen coordinate.
 */
export const gridToScreen = (
  gridPosition: Position,
  config: SpriteConfig,
): Position => {
  const { tileSize, gap } = config;
  return {
    x: gridPosition.x * (tileSize + gap),
    y: gridPosition.y * (tileSize + gap),
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
  config: SpriteConfig,
): [number, number] => {
  const screenPosition = gridToScreen(gridPosition, config);
  return [screenPosition.x, screenPosition.y];
};

/**
 * Converts a screen coordinate to a grid position.
 *
 * This function takes a screen coordinate and converts it into a grid position
 * based on the tile size and gap defined in the configuration. If no configuration
 * is provided, it defaults to the map configuration stored in the application state.
 *
 * @param {Position} screenPosition - The screen coordinate to convert.
 * @param {SpriteConfig} [config=store.get(getMapConfigAtom)] - The configuration object containing tile size and gap.
 * @returns {Position} The calculated grid position.
 */
export const screenToGrid = (
  screenPosition: Position,
  config: SpriteConfig = store.get(getMapConfigAtom),
): Position => {
  const { tileSize, gap } = config;
  return {
    x: Math.floor(screenPosition.x / (tileSize + gap)),
    y: Math.floor(screenPosition.y / (tileSize + gap)),
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

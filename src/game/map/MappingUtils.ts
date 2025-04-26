import type { InterfaceConfig } from '../atoms/Atoms';
import { getMapConfigAtom } from '../atoms/Atoms';
import { store } from '../../App';
import type { Position } from './GameMap';

/**
 * Converts a grid position to a screen coordinate.
 * @param {Position} gridPosition - The grid position to convert.
 * @param config
 * @returns {Position} The screen coordinate.
 */
export const gridToScreen = (
  gridPosition: Position,
  config: InterfaceConfig,
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
  config: InterfaceConfig,
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
 * @param {InterfaceConfig} [config=store.get(getMapConfigAtom)] - The configuration object containing tile size and gap.
 * @returns {Position} The calculated grid position.
 */
export const screenToGrid = (
  screenPosition: Position,
  config: InterfaceConfig = store.get(getMapConfigAtom),
): Position => {
  const { tileSize, gap } = config;
  return {
    x: Math.floor(screenPosition.x / (tileSize + gap)),
    y: Math.floor(screenPosition.y / (tileSize + gap)),
  };
};

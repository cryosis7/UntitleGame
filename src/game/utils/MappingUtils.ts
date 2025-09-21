import { getMapSpriteConfigAtom, mapConfigAtom, mapEntitiesAtom, SpriteConfig, store } from '../atoms';
import type { Position } from '../components/individualComponents/PositionComponent';
import { ComponentType, Direction, RenderSection } from '../components';
import { hasComponent } from '../components/ComponentOperations';
import { getEntitiesAtPosition } from './EntityUtils';
import { Entity } from './ecsUtils';
import type { EntityTemplate } from './EntityFactory';
import { createEntityFromTemplate } from './EntityFactory';

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
  config: SpriteConfig = store.get(getMapSpriteConfigAtom),
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

export const isPositionInMap = ({ x, y }: Position) => {
  const mapConfig = store.get(mapConfigAtom);
  if (!mapConfig) {
    throw new Error('Map config not found');
  }
  return x >= 0 && y >= 0 && y < mapConfig.rows && x < mapConfig.cols;
};

export const isLocationWalkable = (
  position: Position,
  mapEntities?: Entity[],
) => {
  mapEntities ??= store.get(mapEntitiesAtom);
  const entities = getEntitiesAtPosition(position, mapEntities);

  return entities.every((entity) =>
    hasComponent(entity, ComponentType.Walkable),
  );
};

export const createMapTiles = () => {
  const mapConfig = store.get(mapConfigAtom);

  if (!mapConfig) {
    throw new Error('Map config not found');
  }
  if (mapConfig.rows === undefined || mapConfig.cols === undefined) {
    throw new Error('Map config not configured');
  }

  const tiles: Entity[] = [];

  for (let y = 0; y < mapConfig.rows; y++) {
    for (let x = 0; x < mapConfig.cols; x++) {
      const entity = createTileEntity(x, y);
      tiles.push(entity);
    }
  }

  return tiles;
};

export const createTileEntity = (x: number, y: number): Entity => {
  const isDirtTile = Math.random() < 1;
  const entityTemplate: EntityTemplate = {
    components: {
      [ComponentType.Sprite]: { spriteName: isDirtTile ? 'tile9B' : 'wall' },
      [ComponentType.Position]: { x, y },
      [ComponentType.Render]: { section: RenderSection.Map },
      ...(isDirtTile ? { [ComponentType.Walkable]: {} } : {}),
    },
  };
  return createEntityFromTemplate(entityTemplate);
};

import { store } from '../../App';
import type {
  Component,
  PositionComponent
} from '../components/Components';
import {
  ComponentType
} from '../components/Components';
import { entitiesAtom, mapAtom } from '../GameSystem';
import type { Direction, Position } from '../map/GameMap';
import { getComponentIfExists, hasComponent } from './ComponentUtils';

export type Entity = {
  id: string;
  components: { [key: string]: Component };
};

/**
 * Determines if an entity can move in a given direction, based on obstructions in the map and other entities.
 * @param entity 
 * @param direction 
 * @returns 
 */
export const canMoveInDirection = (
  entity: Entity,
  direction: Direction,
): boolean => {
  const map = store.get(mapAtom);
  const positionComponent = getComponentIfExists<PositionComponent>(entity, ComponentType.Position);
  if (!positionComponent) {
    return false;
  }

  const adjacentPosition = map.getAdjacentPosition(
    positionComponent,
    direction,
  );

  const entities = store.get(entitiesAtom).filter((entity) => {
    const position = getComponentIfExists<PositionComponent>(entity, ComponentType.Position);
    return (
      position?.x === adjacentPosition.x && position?.y === adjacentPosition.y
    );
  });
  const entitiesAreMoveable = entities.reduce(
    (accumulation, entity) =>
      accumulation && hasComponent(entity, ComponentType.Movable),
    true,
  );

  const isMapTileWalkable = map.isTileWalkable(adjacentPosition);

  return isMapTileWalkable && entitiesAreMoveable;
};

/**
 * Finds an empty tile on the map.
 *
 * @returns {Position} The coordinates of an empty tile.
 */
export const getEmptyPosition = (): Position => {
  let x: number;
  let y: number;
  let isOccupied: boolean;
  const map = store.get(mapAtom);
  const entities = store
    .get(entitiesAtom)
    .filter((entity) => {
      return hasComponent(entity, ComponentType.Position);
    })
    .map((entity) => {
      return getComponentIfExists<PositionComponent>(entity, ComponentType.Position)!;
    });

  do {
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
    isOccupied =
      !map.isTileWalkable({ x, y }) ||
      entities.some((entity) => {
        return entity.x === x && entity.y === y;
      });
  } while (isOccupied);

  return { x, y };
};
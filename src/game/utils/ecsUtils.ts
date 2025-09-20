import type { Position } from '../components/individualComponents/PositionComponent';
import type { ComponentDictionary } from '../components';
import { ComponentType } from '../components';
import {
  getComponentIfExists,
  hasComponent,
} from '../components/ComponentOperations';
import { entitiesAtom, store } from '../atoms';
import { isLocationWalkable } from './MappingUtils';

export type Entity = {
  id: string;
  components: ComponentDictionary;
};

/**
 * Finds an empty tile on the map.
 *
 * @returns {Position} The coordinates of an empty tile.
 */
export const getEmptyPosition = (
  entities: Entity[] = store.get(entitiesAtom),
): Position => {
  let x: number;
  let y: number;
  let isOccupied: boolean;
  const positionComponents = entities
    .filter((entity) => {
      return hasComponent(entity, ComponentType.Position);
    })
    .map((entity) => {
      return getComponentIfExists(entity, ComponentType.Position)!;
    });

  do {
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
    isOccupied =
      !isLocationWalkable({ x, y }) ||
      positionComponents.some((entity) => {
        return entity.x === x && entity.y === y;
      });
  } while (isOccupied);

  return { x, y };
};

import type {
  Component,
  PositionComponent} from '../components/Components';
import {
  ComponentType
} from '../components/Components';
import type { Direction, Position } from '../map/GameMap';
import { store } from '../../App';
import { entitiesAtom, mapAtom } from '../GameSystem';

export type Entity = {
  id: string;
  components: { [key: string]: Component };
};

/**
 * Sets a component for a given entity. If the component already exists, it will be replaced.
 *
 * @template T - The type of the component.
 * @param {Entity} entity - The entity to which the component will be added.
 * @param {T} component - The component to be added to the entity.
 */
export const setComponent = <T extends Component>(
  entity: Entity,
  component: T,
) => {
  store.set(entitiesAtom, (entities) => {
    return entities.map((e) => {
      if (e.id === entity.id) {
        return {
          ...e,
          components: {
            ...e.components,
            [component.type]: component,
          },
        };
      }
      return e;
    });
  });
};

/**
 * Sets multiple components for a given entity. If a component already exists, it will be replaced.
 *
 * @param entity
 * @param components
 */
export const setComponents = (entity: Entity, ...components: Component[]) => {
  store.set(entitiesAtom, (entities) => {
    return entities.map((e) => {
      if (e.id === entity.id) {
        return {
          ...e,
          components: {
            ...e.components,
            ...components.reduce(
              (accumulation, component) => ({
                ...accumulation,
                [component.type]: component,
              }),
              {},
            ),
          },
        };
      }
      return e;
    });
  });
};

export const getComponent = <T extends Component>(
  entity: Entity,
  type: string,
): T | undefined => {
  return entity.components[type] as T;
};

/**
 * Checks if an entity has a specified component.
 * @param entity
 * @param type
 */
export const hasComponent = (entity: Entity, type: ComponentType): boolean => {
  return entity.components[type] !== undefined;
};

/**
 * Checks if an entity has all the specified components.
 * @param entity
 * @param types
 */
export const hasComponents = (
  entity: Entity,
  ...types: ComponentType[]
): boolean => {
  return types.reduce(
    (accumulation, type) => accumulation && hasComponent(entity, type),
    true,
  );
};

/**
 * Checks if an entity has any of the specified components.
 * @param entity
 * @param types
 */
export const hasAnyComponent = (
  entity: Entity,
  ...types: ComponentType[]
): boolean => {
  return types.reduce(
    (accumulation, type) => accumulation || hasComponent(entity, type),
    false,
  );
};

export const canMoveInDirection = (
  entity: Entity,
  direction: Direction,
): boolean => {
  const map = store.get(mapAtom);
  const positionComponent = getComponent<PositionComponent>(entity, 'position');
  if (!positionComponent) {
    return false;
  }

  const adjacentPosition = map.getAdjacentPosition(
    positionComponent,
    direction,
  );

  const entities = store.get(entitiesAtom).filter((entity) => {
    const position = getComponent<PositionComponent>(entity, 'position');
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
      return getComponent<PositionComponent>(entity, 'position')!;
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

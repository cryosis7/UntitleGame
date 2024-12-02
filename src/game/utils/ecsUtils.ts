import type { Component, PositionComponent } from '../components/Components';
import type { Direction } from '../map/GameMap';
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

export const hasComponent = (entity: Entity, type: string): boolean => {
  return entity.components[type] !== undefined;
};

export const hasComponents = (entity: Entity, ...types: string[]): boolean => {
  return types.reduce(
    (accumulation, type) => accumulation && hasComponent(entity, type),
    true,
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
    (accumulation, entity) => accumulation && hasComponent(entity, 'moveable'),
    true,
  );

  const isMapTileWalkable = map.isTileWalkable(adjacentPosition);

  return isMapTileWalkable && entitiesAreMoveable;
};

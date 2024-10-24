import type { Component, PositionComponent } from '../components/Components';
import type { Direction } from '../map/GameMap';
import { store } from '../../App';
import { entitiesAtom, mapAtom } from '../GameSystem';

export type Entity = {
  id: string;
  components: { [key: string]: Component };
};

export function createEntity(components: Component[]): Entity {
  const componentDict: { [key: string]: Component } = {};
  components.forEach((component) => {
    componentDict[component.type] = component;
  });
  return { id: crypto.randomUUID(), components: componentDict };
}

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

export const getComponent = <T extends Component>(
  entity: Entity,
  type: string,
): T | undefined => {
  return entity.components[type] as T;
};

export const hasComponent = (entity: Entity, type: string): boolean => {
  return entity.components[type] !== undefined;
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

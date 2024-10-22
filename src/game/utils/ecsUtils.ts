import type { Component, PositionComponent } from '../components/Components';
import { Direction, GameMap } from '../map/GameMap';

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
  entity.components[component.type] = component;
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
  map: GameMap,
  entity: Entity,
  direction: Direction,
): boolean => {
  const positionComponent = getComponent<PositionComponent>(entity, 'position');
  if (!positionComponent) {
    return false;
  }

  const adjacentPosition = map.getAdjacentPosition(positionComponent, direction);
  return map.isTileWalkable(adjacentPosition);
};

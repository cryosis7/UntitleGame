import type { Position } from '../map/GameMap';
import { store } from '../../App';
import { entitiesAtom } from '../GameSystem';
import type { PositionComponent } from '../components/Components';
import { ComponentType } from '../components/Components';
import type { Entity} from './ecsUtils';
import { getComponent, hasAllComponents, hasComponent } from './ComponentUtils';

/**
 * Returns all entities at a given position.
 * @param position
 */
export const getEntitiesAtPosition = (position: Position | PositionComponent): Entity[] => {
  return store.get(entitiesAtom).filter((entity) => {
    const positionComponent = getComponent<PositionComponent>(
      entity,
      ComponentType.Position,
    );
    return (
      positionComponent?.x === position.x && positionComponent?.y === position.y
    );
  });
};

export const hasEntitiesAtPosition = (position: Position | PositionComponent): boolean => {
  return store.get(entitiesAtom).some((entity) => {
    const positionComponent = getComponent<PositionComponent>(
      entity,
      ComponentType.Position,
    );
    return (
      positionComponent?.x === position.x && positionComponent?.y === position.y
    );
  });
};

export const getEntitiesWithComponent = (
  type: ComponentType,
  entities?: Entity[],
): Entity[] => {
  entities = entities ?? store.get(entitiesAtom);
  return entities.filter((entity) => hasComponent(entity, type));
};

export const getEntitiesWithComponents = (
  types: ComponentType[],
  entities?: Entity[],
): Entity[] => {
  entities = entities ?? store.get(entitiesAtom);
  return entities.filter((entity) => hasAllComponents(entity, ...types));
}

export const getPlayerEntity = (entities?: Entity[]): Entity | undefined => {
  const players = getEntitiesWithComponent(ComponentType.Player, entities)
  return players.length === 1 ? players[0] : undefined;
}
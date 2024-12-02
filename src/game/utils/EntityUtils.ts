import type { Position } from '../map/GameMap';
import { store } from '../../App';
import { entitiesAtom } from '../GameSystem';
import type { ComponentType, PositionComponent } from '../components/Components';
import type { Entity} from './ecsUtils';
import { getComponent, hasComponent } from './ecsUtils';

/**
 * Returns all entities at a given position.
 * @param position
 */
export const getEntitiesAtPosition = (position: Position): Entity[] => {
  return store.get(entitiesAtom).filter((entity) => {
    const positionComponent = getComponent<PositionComponent>(
      entity,
      'position',
    );
    return (
      positionComponent?.x === position.x && positionComponent?.y === position.y
    );
  });
};

export const hasEntitiesAtPosition = (position: Position): boolean => {
  return store.get(entitiesAtom).some((entity) => {
    const positionComponent = getComponent<PositionComponent>(
      entity,
      'position',
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

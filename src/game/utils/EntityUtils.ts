import type { Position } from '../map/GameMap';
import { store } from '../../App';
import { ComponentType } from '../components/ComponentTypes';
import type { Entity } from './ecsUtils';
import {
  getComponentIfExists,
  hasAllComponents,
  hasComponent,
} from '../components/ComponentOperations';
import { entitiesAtom } from './Atoms';
import type { PositionComponent } from '../components/individualComponents/PositionComponent';

/**
 * Returns all entities at a given position.
 * @param position
 * @param entities
 */
export const getEntitiesAtPosition = (
  position: Position | PositionComponent,
  entities?: Entity[],
): Entity[] => {
  entities = entities ?? store.get(entitiesAtom);
  return entities.filter((entity) => {
    const positionComponent = getComponentIfExists(
      entity,
      ComponentType.Position,
    );
    return (
      positionComponent?.x === position.x && positionComponent?.y === position.y
    );
  });
};

export const hasEntitiesAtPosition = (
  position: Position | PositionComponent,
): boolean => {
  return store.get(entitiesAtom).some((entity) => {
    const positionComponent = getComponentIfExists(
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
};

export const getPlayerEntity = (entities?: Entity[]): Entity | undefined => {
  const players = getEntitiesWithComponent(ComponentType.Player, entities);
  return players.length === 1 ? players[0] : undefined;
};

export const addEntity = (entity: Entity) => {
  store.set(entitiesAtom, (entities) => [...entities, entity]);
};

export const addEntities = (entities: Entity[]) => {
  store.set(entitiesAtom, (currentEntities) => [
    ...currentEntities,
    ...entities,
  ]);
};

export const removeEntity = (entityId: string) => {
  store.set(entitiesAtom, (entities) =>
    entities.filter((e) => e.id !== entityId),
  );
};

export const removeEntities = (entityIds: string[]) => {
  store.set(entitiesAtom, (entities) =>
    entities.filter((e) => !entityIds.includes(e.id)),
  );
};

export const updateEntity = (entity: Entity) => {
  store.set(entitiesAtom, (entities) =>
    entities.map((e) => (e.id === entity.id ? entity : e)),
  );
};

export const getEntity = (entityId: string): Entity | undefined => {
  return store.get(entitiesAtom).find((entity) => entity.id === entityId);
};

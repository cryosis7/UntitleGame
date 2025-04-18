import { atom } from 'jotai/index';
import { hasComponent } from '../components/ComponentOperations';
import { ComponentType } from '../components/ComponentTypes';
import type { Entity } from '../utils/ecsUtils';
import type { SystemBase } from '../systems/SystemBase';

export const entitiesAtom = atom<Entity[]>([]);
export const systemsAtom = atom<SystemBase[]>([]);
export const playerAtom = atom((get) => {
  const entities = get(entitiesAtom);
  return entities.find((entity) => hasComponent(entity, ComponentType.Player));
});

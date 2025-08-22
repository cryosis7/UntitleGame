import { atom } from 'jotai';
import type { Entity } from '../utils/ecsUtils';
import type { BaseSystem } from '../systems/Framework/Systems';
import { ComponentType, RenderSection } from '../components';
import { hasComponentValue } from '../components/ComponentOperations';

export const entitiesAtom = atom<Entity[]>([]);
export const systemsAtom = atom<BaseSystem[]>([]);

export const entitiesByRenderSectionAtom = atom((get) => {
  const entities = get(entitiesAtom);
  return (section: RenderSection): Entity[] => {
    return entities.filter((entity) => {
      return hasComponentValue(entity, ComponentType.Render, { section });
    });
  };
});

export const gameEntitiesAtom = atom((get) => {
  return get(entitiesByRenderSectionAtom)(RenderSection.Game);
});

export const sidebarEntitiesAtom = atom((get) => {
  return get(entitiesByRenderSectionAtom)(RenderSection.Sidebar);
});

export const mapEntitiesAtom = atom((get) => {
  return get(entitiesByRenderSectionAtom)(RenderSection.Map);
});

export const hudEntitiesAtom = atom((get) => {
  return get(entitiesByRenderSectionAtom)(RenderSection.Hud);
});

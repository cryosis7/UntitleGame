import type { Container } from 'pixi.js';
import { atom } from 'jotai';
import { RenderSection } from '../components/';

export const renderedEntities = atom<
  Record<RenderSection, Record<string, Container>>
>({
  game: {},
  sidebar: {},
  map: {},
  hud: {},
});

export const setSprite = atom(
  null,
  (
    get,
    set,
    {
      section,
      entityId,
      sprite,
    }: { section: RenderSection; entityId: string; sprite: Container },
  ) => {
    set(
      renderedEntities,
      (
        currentRenderedEntities,
      ): Record<RenderSection, Record<string, Container>> => {
        const sectionEntities = currentRenderedEntities[section] || {};
        return {
          ...currentRenderedEntities,
          [section]: {
            ...sectionEntities,
            [entityId]: sprite,
          },
        };
      },
    );
  },
);

export const setMapSprite = atom(
  null,
  (get, set, { entityId, sprite }: { entityId: string; sprite: Container }) => {
    set(setSprite, { section: RenderSection.Map, entityId, sprite });
  },
);

const getSprite = atom((get) => {
  return (section: RenderSection, entityId: string): Container | undefined => {
    const sectionEntities = get(renderedEntities)[section];
    return sectionEntities ? sectionEntities[entityId] : undefined;
  };
});

export const getSidebarSprite = atom((get) => {
  return (entityId: string): Container | undefined => {
    return get(getSprite)(RenderSection.Sidebar, entityId);
  };
});

export const getGameSprite = atom((get) => {
  return (entityId: string): Container | undefined => {
    return get(getSprite)(RenderSection.Game, entityId);
  };
});

export const hasSidebarSprite = atom((get) => {
  return (entityId: string): boolean => {
    return get(getSidebarSprite)(entityId) !== undefined;
  };
});

export const hasGameSprite = atom((get) => {
  return (entityId: string): boolean => {
    return get(getGameSprite)(entityId) !== undefined;
  };
});

export const removeSprite = atom(
  null,
  (
    get,
    set,
    { section, entityId }: { section: RenderSection; entityId: string },
  ) => {
    set(renderedEntities, (currentRenderedEntities) => {
      const sectionEntities = currentRenderedEntities[section] || {};
      delete sectionEntities[entityId];
      return {
        ...currentRenderedEntities,
        [section]: sectionEntities,
      };
    });
  },
);

export const removeSidebarSprite = atom(null, (get, set, entityId: string) => {
  set(removeSprite, { section: RenderSection.Sidebar, entityId });
});

export const removeGameSprite = atom(null, (get, set, entityId: string) => {
  set(removeSprite, { section: RenderSection.Game, entityId });
});

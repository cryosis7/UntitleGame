import type { Container, Spritesheet } from 'pixi.js';
import { atom, createStore } from 'jotai';
import { GameMap } from '../map/GameMap';
import { ComponentType } from '../components';
import { hasComponent } from '../components/ComponentOperations';
import type { System } from '../systems/Framework/Systems';
import type { Entity } from './ecsUtils';

export const store = createStore();

export const spritesheetsAtom = atom<Spritesheet[]>([]);
export const getTexture = (textureName: string) => {
  const spritesheets = store.get(spritesheetsAtom);
  for (const spritesheet of spritesheets) {
    if (spritesheet.textures[textureName]) {
      return spritesheet.textures[textureName];
    }
  }
  return null;
};
export const addSpritesheetAtom = atom(
  null,
  (get, set, update: Spritesheet) => {
    set(spritesheetsAtom, (currentSpritesheets): Spritesheet[] => [
      ...currentSpritesheets,
      update,
    ]);
  },
);

export type RenderSection = 'game' | 'sidebar' | 'map';
export const renderedEntities = atom<
  Record<RenderSection, Record<string, Container>>
>({
  game: {},
  sidebar: {},
  map: {},
});
atom((get) => {
  return get(renderedEntities).sidebar;
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
    set(setSprite, { section: 'map', entityId, sprite });
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
    return get(getSprite)('sidebar', entityId);
  };
});
export const getGameSprite = atom((get) => {
  return (entityId: string): Container | undefined => {
    return get(getSprite)('game', entityId);
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
  set(removeSprite, { section: 'sidebar', entityId });
});
export const removeGameSprite = atom(null, (get, set, entityId: string) => {
  set(removeSprite, { section: 'game', entityId });
});

export interface InterfaceConfig {
  tileSize: number;
  gap: number;
}

export interface RenderConfig {
  interfaceConfig: InterfaceConfig;
  rootContainer: Container | null;
}

export const renderConfigAtom = atom<{
  map: RenderConfig;
  sidebar: RenderConfig;
}>({
  map: {
    interfaceConfig: { tileSize: 32, gap: 0 },
    rootContainer: null,
  },
  sidebar: {
    interfaceConfig: { tileSize: 32, gap: 4 },
    rootContainer: null,
  },
});

interface MapConfig {
  rows?: number;
  cols?: number;
  tileSize?: number;
}

export const getMapRenderConfigAtom = atom((get) => get(renderConfigAtom).map);
export const getSidebarRenderConfigAtom = atom(
  (get) => get(renderConfigAtom).sidebar,
);
export const getInterfaceConfigBySectionAtom = atom(
  (get) => (section: RenderSection) => {
    switch (section) {
      case 'map':
      case 'game':
        return get(getMapRenderConfigAtom).interfaceConfig;
      case 'sidebar':
        return get(getSidebarRenderConfigAtom).interfaceConfig;
      default:
        throw new Error(`Unknown render section: ${section}`);
    }
  },
);

export const getContainersAtom = atom((get) => {
  const mapContainer = get(getMapRenderConfigAtom).rootContainer;
  const sidebarContainer = get(getSidebarRenderConfigAtom).rootContainer;
  return {
    mapContainer,
    sidebarContainer,
  };
});
export const getMapContainerAtom = atom(
  (get) => get(getMapRenderConfigAtom).rootContainer,
);
export const getSidebarContainerAtom = atom(
  (get) => get(getSidebarRenderConfigAtom).rootContainer,
);

export const getMapConfigAtom = atom(
  (get) => get(getMapRenderConfigAtom).interfaceConfig,
);
export const getSidebarConfigAtom = atom(
  (get) => get(getSidebarRenderConfigAtom).interfaceConfig,
);

export const setContainersAtom = atom(
  null,
  (
    get,
    set,
    {
      mapContainer,
      sidebarContainer,
    }: { mapContainer: Container; sidebarContainer: Container },
  ) => {
    set(renderConfigAtom, {
      map: {
        ...get(getMapRenderConfigAtom),
        rootContainer: mapContainer,
      },
      sidebar: {
        ...get(getSidebarRenderConfigAtom),
        rootContainer: sidebarContainer,
      },
    });
  },
);

//TODO: Continue pulling changes from this commit: https://github.com/cryosis7/UntitleGame/commit/eb5c3b40b1ac3660ef389e1fa679c0fd2324f1c8#diff-252c13a77903ac6fbec7b43836c0cdd58027ae532e5bddb2946cb4aebed3f3d5
//TODO: The above atoms were from the commit, but they need to be adapted to the new structure of the game.
//TODO: The atoms below are the current ones to be replaced.
//TODO: The game will still be using the old atoms, I haven't updated the references.

export const mapConfigAtom = atom<MapConfig>();
export const updateMapConfigAtom = atom(null, (get, set, update: MapConfig) => {
  set(mapConfigAtom, { ...get(mapConfigAtom), ...update });
});
export const getTileSizeAtom = atom((get) => {
  return get(mapConfigAtom)?.tileSize ?? 0;
});

export const entitiesAtom = atom<Entity[]>([]);
export const systemsAtom = atom<System[]>([]);
export const mapAtom = atom<GameMap>(new GameMap());
export const playerAtom = atom((get) => {
  const entities = get(entitiesAtom);
  return entities.find((entity) => hasComponent(entity, ComponentType.Player));
});

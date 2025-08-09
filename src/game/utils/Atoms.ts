import type { Container, Spritesheet } from 'pixi.js';
import { atom, createStore } from 'jotai';
import { GameMap } from '../map/GameMap';
import { ComponentType } from '../components';
import { hasComponent } from '../components/ComponentOperations';
import type { System } from '../systems/Systems';
import type { Entity } from './ecsUtils';
import type { RenderSection } from '../components/individualComponents/RenderComponent';

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

interface MapConfig {
  rows?: number;
  cols?: number;
  tileSize?: number;
}

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

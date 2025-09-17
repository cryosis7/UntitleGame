import type { Container } from 'pixi.js';
import { atom } from 'jotai';
import { RenderSection } from '../components';

export interface SpriteConfig {
  tileSize: number;
  gap: number;
}

export interface RenderConfig {
  spriteConfig: SpriteConfig;
  rootContainer: Container | null;
}

export const renderConfigAtom = atom<{
  map: RenderConfig;
  sidebar: RenderConfig;
  hud: RenderConfig;
}>({
  map: {
    spriteConfig: { tileSize: 26, gap: 0 },
    rootContainer: null,
  },
  sidebar: {
    spriteConfig: { tileSize: 26, gap: 4 },
    rootContainer: null,
  },
  hud: {
    spriteConfig: { tileSize: 16, gap: 0 },
    rootContainer: null,
  },
});

export const getMapRenderConfigAtom = atom((get) => get(renderConfigAtom).map);
export const getSidebarRenderConfigAtom = atom(
  (get) => get(renderConfigAtom).sidebar,
);
export const getHudRenderConfigAtom = atom((get) => get(renderConfigAtom).hud);

export const getSpriteConfigBySectionAtom = atom(
  (get) => (section: RenderSection) => {
    switch (section) {
      case RenderSection.Map:
      case RenderSection.Game:
        return get(getMapRenderConfigAtom).spriteConfig;
      case RenderSection.Sidebar:
        return get(getSidebarRenderConfigAtom).spriteConfig;
      case RenderSection.Hud:
        return get(getHudRenderConfigAtom).spriteConfig;
      default:
        throw new Error(`Unknown render section: ${section}`);
    }
  },
);

export const getContainersAtom = atom((get) => {
  const mapContainer = get(getMapRenderConfigAtom).rootContainer;
  const sidebarContainer = get(getSidebarRenderConfigAtom).rootContainer;
  const hudContainer = get(getHudRenderConfigAtom).rootContainer;
  return {
    mapContainer,
    sidebarContainer,
    hudContainer,
  };
});

export const mapContainerAtom = atom(
  (get) => get(getMapRenderConfigAtom).rootContainer,
);
export const sidebarContainerAtom = atom(
  (get) => get(getSidebarRenderConfigAtom).rootContainer,
);
export const hudContainerAtom = atom(
  (get) => get(getHudRenderConfigAtom).rootContainer,
);

export const getContainerBySectionAtom = atom(
  (get) =>
    (section: RenderSection): Container | null => {
      switch (section) {
        case RenderSection.Map:
        case RenderSection.Game:
          return get(mapContainerAtom);
        case RenderSection.Sidebar:
          return get(sidebarContainerAtom);
        case RenderSection.Hud:
          return get(hudContainerAtom);
      }
    },
);

export const getMapConfigAtom = atom(
  (get) => get(getMapRenderConfigAtom).spriteConfig,
);
export const getSidebarConfigAtom = atom(
  (get) => get(getSidebarRenderConfigAtom).spriteConfig,
);

export const setContainersAtom = atom(
  null,
  (
    get,
    set,
    {
      mapContainer,
      sidebarContainer,
      hudContainer,
    }: {
      mapContainer: Container;
      sidebarContainer: Container;
      hudContainer: Container;
    },
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
      hud: {
        ...get(getHudRenderConfigAtom),
        rootContainer: hudContainer,
      },
    });
  },
);

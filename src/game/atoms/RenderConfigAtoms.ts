import { atom } from 'jotai/index';
import type { Container } from 'pixi.js';

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
    interfaceConfig: {
      tileSize: 32,
      gap: 0,
    },
    rootContainer: null,
  },
  sidebar: {
    interfaceConfig: {
      tileSize: 16,
      gap: 4,
    },
    rootContainer: null,
  },
});

export const getMapRenderConfigAtom = atom((get) => get(renderConfigAtom).map);
export const getSidebarRenderConfigAtom = atom(
  (get) => get(renderConfigAtom).sidebar,
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

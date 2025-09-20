import { atom } from 'jotai';

export interface MapConfig {
  rows: number;
  cols: number;
}
export const mapConfigAtom = atom<MapConfig>();
export const setMapConfigAtom = atom(null, (get, set, config: MapConfig) => {
  set(mapConfigAtom, config);
});

export const hasMapUpdatedAtom = atom<boolean>(true);
export const setHasMapUpdatedAtom = atom(
  null,
  (get, set, hasUpdated: boolean) => {
    set(hasMapUpdatedAtom, hasUpdated);
  },
);

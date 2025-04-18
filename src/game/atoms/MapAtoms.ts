import { atom } from 'jotai/index';
import { GameMap } from '../map/GameMap';

interface MapConfig {
  rows?: number;
  cols?: number;
}

export const mapAtom = atom<GameMap>(new GameMap());
export const mapConfigAtom = atom<MapConfig>();
export const updateMapConfigAtom = atom(null, (get, set, update: MapConfig) => {
  set(mapConfigAtom, { ...get(mapConfigAtom), ...update });
});

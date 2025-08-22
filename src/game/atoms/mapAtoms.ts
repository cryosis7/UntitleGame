import { atom } from 'jotai';
import { GameMap } from '../map/GameMap';

interface MapConfig {
  rows?: number;
  cols?: number;
}

export const mapAtom = atom<GameMap>(new GameMap());
export const mapConfigAtom = atom<MapConfig>();
export const updateMapConfigAtom = atom(null, (get, set, config: MapConfig) => {
  set(mapConfigAtom, {
    ...get(mapConfigAtom),
    ...config,
  });
});

export type GameMode = 'game' | 'editor';
export const currentGameModeAtom = atom<GameMode>('game');

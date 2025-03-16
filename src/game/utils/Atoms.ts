import { atom } from 'jotai';
import type { Spritesheet } from 'pixi.js';
import { store } from '../../App';

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
      update
    ]);
  }
);

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

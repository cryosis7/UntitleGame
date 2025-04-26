import { atom } from 'jotai/index';
import type { Spritesheet, Texture } from 'pixi.js';

export const spritesheetsAtom = atom<Spritesheet[]>([]);
export const getTextureAtom = atom((get) => (textureName: string) => {
  const spritesheets = get(spritesheetsAtom);
  for (const spritesheet of spritesheets) {
    if (spritesheet.textures[textureName]) {
      return spritesheet.textures[textureName];
    }
  }
  return null;
});

export const getAllTexturesAtom = atom(
  (get): Record<string | number, Texture> => {
    const spritesheets = get(spritesheetsAtom);
    return spritesheets.reduce((acc, spritesheet) => {
      return { ...acc, ...spritesheet.textures };
    }, {});
  },
);

export const addSpritesheetAtom = atom(
  null,
  (get, set, update: Spritesheet) => {
    set(spritesheetsAtom, (currentSpritesheets): Spritesheet[] => [
      ...currentSpritesheets,
      update,
    ]);
  },
);

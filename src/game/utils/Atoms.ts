import type { Sprite, Spritesheet } from 'pixi.js';
import { atom, createStore } from 'jotai';
import { GameMap } from '../map/GameMap';
import { hasComponent } from '../components/ComponentOperations';
import { ComponentType } from '../components/ComponentTypes';
import type { System } from '../systems/Systems';
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

export const spritesAtom = atom<Record<string, Sprite>>({});
export const setSprite = atom(
  null,
  (get, set, { name, sprite }: { name: string; sprite: Sprite }) => {
    set(
      spritesAtom,
      (currentSprites): Record<string, Sprite> => ({
        ...currentSprites,
        [name]: sprite,
      }),
    );
  },
);
export const getSprite = atom((get) => (name: string): Sprite | null => {
  const sprites = get(spritesAtom);
  return sprites[name] || null;
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

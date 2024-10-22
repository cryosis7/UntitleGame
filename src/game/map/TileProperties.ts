import type { Sprite } from "pixi.js";

export interface Tile {
  tileType: TileType;
  sprite: Sprite;
}

export enum TileType {
  Dirt = 'dirt',
  Wall = 'wall',
}

export interface TileProperties {
  walkable: boolean;
}

export const tileProperties: Record<TileType, TileProperties> = {
  [TileType.Dirt]: {
    walkable: true,
  },
  [TileType.Wall]: {
    walkable: false,
  },
};

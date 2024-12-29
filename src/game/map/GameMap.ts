import { Container, Sprite } from 'pixi.js';
import type { Tile } from './TileProperties';
import { tileProperties, TileType } from './TileProperties';
import { pixiApp } from '../Pixi';
import { getTexture } from '../utils/Atoms';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export class GameMap {
  private tiles: Tile[][];

  constructor(rows?: number, columns?: number) {
    this.tiles = [];

    if (rows && columns) {
      this.init(rows, columns);
    }
  }

  init(rows: number, columns: number) {
    const tileWidth = pixiApp.screen.width / 10;
    const dirtTexture = getTexture('dirt')
    const wallTexture = getTexture('wall')
    if (!dirtTexture || !wallTexture) {
      throw new Error('Could not find textures for dirt/wall');
    }

    for (let y = 0; y < rows; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < columns; x++) {
        if (Math.random() < 0.85) {
          const sprite: Sprite = new Sprite(dirtTexture);
          sprite.position = { x: x * tileWidth, y: y * tileWidth };
          sprite.setSize(tileWidth);
          row.push({ tileType: TileType.Dirt, sprite });
        } else {
          const sprite: Sprite = new Sprite(wallTexture);
          sprite.position = { x: x * tileWidth, y: y * tileWidth };
          sprite.setSize(tileWidth);
          row.push({ tileType: TileType.Wall, sprite });
        }
      }
      this.tiles.push(row);
    }
  }

  setMap(map: Tile[][]): void {
    this.tiles = map;
  }

  getSpriteContainer(): Container {
    const container = new Container();
    container.addChild(
      ...this.tiles.flatMap((arr) => arr.map((tile) => tile.sprite)),
    );
    return container;
  }

  isPositionInMap({ x, y }: Position): boolean {
    return (
      x >= 0 && y >= 0 && y < this.tiles.length && x < this.tiles[y].length
    );
  }

  getTile({ x, y }: Position): Tile | null {
    if (!this.isPositionInMap({ x, y })) {
      return null;
    }
    return this.tiles[y][x];
  }

  getAdjacentPosition({ x, y }: Position, direction: Direction): Position {
    switch (direction) {
      case 'up':
        return { x, y: y - 1 };
      case 'down':
        return { x, y: y + 1 };
      case 'left':
        return { x: x - 1, y };
      case 'right':
        return { x: x + 1, y };
      default:
        return { x, y };
    }
  }

  getAdjacentTile({ x, y }: Position, direction: Direction): Tile | null {
    const adjacentPosition = this.getAdjacentPosition({ x, y }, direction);
    if (!this.isPositionInMap(adjacentPosition)) {
      return null;
    }

    return this.getTile(adjacentPosition);
  }

  isTileWalkable({ x, y }: Position): boolean {
    const tile = this.getTile({ x, y });
    return tile ? tileProperties[tile.tileType].walkable : false;
  }

  isValidPosition({ x, y }: Position): boolean {
    return this.isPositionInMap({ x, y }) && this.isTileWalkable({ x, y });
  }
}

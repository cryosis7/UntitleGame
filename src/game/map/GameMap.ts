import { Container, Sprite } from 'pixi.js';
import type { PositionComponent } from '../components/Components';
import type { Entity } from '../utils/ecsUtils';
import { getComponent } from '../utils/ecsUtils';
import type { Tile } from './TileProperties';
import { tileProperties, TileType } from './TileProperties';
import { pixiApp } from '../PixiStage';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export class GameMap {
  private tiles: Tile[][];

  constructor() {
    this.tiles = [];
  }

  init(rows: number, columns: number) {
    const tileWidth = (pixiApp.screen.width / 10);
    for (let y = 0; y < rows; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < columns; x++) {
        if (Math.random() < 0.85) {
          const sprite: Sprite = Sprite.from('dirt');
          sprite.position = { x: x * tileWidth, y: y * tileWidth };
          sprite.setSize(tileWidth)
          row.push({ tileType: TileType.Dirt, sprite });
        } else {
          const sprite: Sprite = Sprite.from('wall');
          sprite.position = { x: x * tileWidth, y: y * tileWidth };
          sprite.setSize(tileWidth)
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

  // TODO: Consider moving this into the ecs utils
  canMoveInDirection(entity: Entity, direction: Direction): boolean {
    const positionComponent = getComponent<PositionComponent>(
      entity,
      'position',
    );
    if (!positionComponent) {
      return false;
    }
    const { x, y } = this.getAdjacentPosition(positionComponent, direction);
    return this.isTileWalkable({ x, y });
  }
}

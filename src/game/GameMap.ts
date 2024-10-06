import type { Entity } from './utils/ecsUtils';
import { getComponent } from './utils/ecsUtils';
import type { PositionComponent} from './components/Components';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

type Tile = {
  walkable: boolean;
}

export class GameMap {
  private tiles: Tile[][];

  constructor(rows: number, columns: number) {
    this.tiles = [];
    for (let y = 0; y < rows; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < columns; x++) {
        row.push({ walkable: true });
      }
      this.tiles.push(row);
    }
  }

  isPositionInMap({ x, y }: Position): boolean {
    return x >= 0 && y >= 0 && y < this.tiles.length && x < this.tiles[y].length;
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
    return tile ? tile.walkable : false;
  }

  // TODO: Consider moving this into the ecs utils
  canMoveInDirection(entity: Entity, direction: Direction): boolean {
    const positionComponent = getComponent<PositionComponent>(entity, 'position');
    if (!positionComponent) {
      return false
    }
    const { x, y } = this.getAdjacentPosition(positionComponent, direction);
    return this.isTileWalkable({ x, y });
  }
}

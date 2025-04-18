import type { Entity } from '../utils/ecsUtils';
import type { EntityTemplate } from '../utils/EntityFactory';
import { createEntityFromTemplate } from '../utils/EntityFactory';
import { ComponentType } from '../components/ComponentTypes';
import { hasComponent } from '../components/ComponentOperations';
import { mapConfigAtom } from '../atoms/Atoms';
import { store } from '../../App';

// export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export class GameMap {
  private tiles: Entity[][]; //TODO: Convert to single array.
  public id: string;
  public hasChanged: boolean;

  constructor() {
    this.id = crypto.randomUUID();
    this.tiles = [];
    this.hasChanged = true;
  }

  init() {
    const mapConfig = store.get(mapConfigAtom);
    if (mapConfig?.rows === undefined || mapConfig.cols === undefined) {
      throw new Error('Map config not configured');
    }

    this.tiles = [];

    for (let y = 0; y < mapConfig.rows; y++) {
      const row: Entity[] = [];
      for (let x = 0; x < mapConfig.cols; x++) {
        const isDirtTile = Math.random() < 1;
        const entityTemplate: EntityTemplate = {
          components: {
            [ComponentType.Sprite]: { sprite: isDirtTile ? 'dirt' : 'wall' },
            [ComponentType.Position]: { x, y },
            ...(isDirtTile ? { [ComponentType.Walkable]: {} } : {}),
          },
        };
        const entity = createEntityFromTemplate(entityTemplate);
        row.push(entity);
      }
      this.tiles.push(row);
    }

    this.hasChanged = true;
  }

  getAllEntities(): Entity[] {
    return this.tiles.flat();
  }

  isPositionInMap({ x, y }: Position): boolean {
    return (
      x >= 0 && y >= 0 && y < this.tiles.length && x < this.tiles[y].length
    );
  }

  getTile({ x, y }: Position): Entity | null {
    if (!this.isPositionInMap({ x, y })) {
      return null;
    }
    return this.tiles[y][x];
  }

  // getAdjacentPosition({ x, y }: Position, direction: Direction): Position {
  //   switch (direction) {
  //     case 'up':
  //       return { x, y: y - 1 };
  //     case 'down':
  //       return { x, y: y + 1 };
  //     case 'left':
  //       return { x: x - 1, y };
  //     case 'right':
  //       return { x: x + 1, y };
  //     default:
  //       return { x, y };
  //   }
  // }

  // getAdjacentTile({ x, y }: Position, direction: Direction): Entity | null {
  //   const adjacentPosition = this.getAdjacentPosition({ x, y }, direction);
  //   if (!this.isPositionInMap(adjacentPosition)) {
  //     return null;
  //   }
  //
  //   return this.getTile(adjacentPosition);
  // }

  isTileWalkable({ x, y }: Position): boolean {
    const tile = this.getTile({ x, y });
    return tile ? hasComponent(tile, ComponentType.Walkable) : false;
  }

  isValidPosition({ x, y }: Position): boolean {
    return this.isPositionInMap({ x, y }) && this.isTileWalkable({ x, y });
  }
}

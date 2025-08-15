import type { Entity } from '../utils/ecsUtils';
import type { EntityTemplate } from '../utils/EntityFactory';
import { createEntityFromTemplate } from '../utils/EntityFactory';
import { ComponentType } from '../components';
import { hasComponent } from '../components/ComponentOperations';
import { mapConfigAtom, store } from '../utils/Atoms';

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

    if (!mapConfig) {
      throw new Error('Map config not found');
    }
    if (mapConfig.rows === undefined || mapConfig.cols === undefined) {
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
            [ComponentType.Render]: { section: 'map' },
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

  isTileWalkable({ x, y }: Position): boolean {
    const tile = this.getTile({ x, y });
    return tile ? hasComponent(tile, ComponentType.Walkable) : false;
  }

  isValidPosition({ x, y }: Position): boolean {
    return this.isPositionInMap({ x, y }) && this.isTileWalkable({ x, y });
  }
}

import { Container } from 'pixi.js';
import type { Entity } from '../utils/ecsUtils';
import type { EntityTemplate } from '../utils/EntityFactory';
import { createEntityFromTemplate } from '../utils/EntityFactory';
import { ComponentType } from '../components/ComponentTypes';
import {
  getComponentAbsolute,
  hasComponent,
} from '../components/ComponentOperations';
import { mapConfigAtom } from '../utils/Atoms';
import { store } from '../../App';

export interface Position {
  x: number;
  y: number;
}

export class GameMap {
  private tiles: Entity[][]; //TODO: Convert to single array.
  public id: string;
  public hasChanged: boolean;
  private pixiContainer: Container | null;

  constructor() {
    this.id = crypto.randomUUID();
    this.tiles = [];
    this.hasChanged = true;
    this.pixiContainer = null;
  }

  init() {
    const mapConfig = store.get(mapConfigAtom);
    if (mapConfig?.rows === undefined || mapConfig.cols === undefined) {
      throw new Error('Map config not configured');
    }

    this.tiles = [];

    const container = new Container({
      eventMode: 'static',
    });

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
        const sprite = getComponentAbsolute(
          entity,
          ComponentType.Sprite,
        ).sprite;
        container.addChild(sprite);
        row.push(entity);
      }
      this.tiles.push(row);
    }
    this.pixiContainer = container;
    this.hasChanged = true;
  }

  getAllEntities(): Entity[] {
    return this.tiles.flat();
  }

  /**
   * Creates a PIXI.Container and adds all sprite components from the tiles to it.
   * The container has not been added to the pixi stage.
   *
   * @returns {Container} The container with all sprite components added as children.
   */
  private createSpriteContainer(): Container {
    const container = new Container();
    container.addChild(
      ...this.tiles.flatMap((entityArray) =>
        entityArray.map(
          (entity) => getComponentAbsolute(entity, ComponentType.Sprite).sprite,
        ),
      ),
    );
    return container;
  }

  public getSpriteContainer = (): Container => {
    this.pixiContainer ??= this.createSpriteContainer();
    return this.pixiContainer;
  };

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

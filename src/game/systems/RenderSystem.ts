import type { System, UpdateArgs } from './Systems';
import { pixiApp } from '../Pixi';
import { store } from '../../App';
import { getTexture, getTileSizeAtom, mapAtom } from '../utils/Atoms';
import { MapRenderSystem } from './MapRenderSystem';
import { EntityRenderSystem } from './EntityRenderSystem';
import { gridToScreenAsTuple } from '../map/MappingUtils';
import type { Container} from 'pixi.js';
import { Sprite } from 'pixi.js';
import type { Position } from '../map/GameMap';

export class RenderSystem implements System {
  private mapRenderSystem: MapRenderSystem;
  private entityRenderSystem: EntityRenderSystem;

  constructor() {
    const map = store.get(mapAtom);
    this.mapRenderSystem = new MapRenderSystem();
    this.entityRenderSystem = new EntityRenderSystem();

    const mapContainer = map.getContainer();
    pixiApp.stage.addChild(mapContainer);
  }

  update({ entities, map }: UpdateArgs) {
    this.mapRenderSystem.update(map, map.getContainer());
    this.entityRenderSystem.update(entities, map.getContainer());
  }

  static addToScreen(
    container: Container,
    position: Position,
    parent: Container,
  ) {
    parent.addChild(container);
    this.setPosition(container, position);
  }

  static setPosition(container: Container, position: Position) {
    container.position.set(...gridToScreenAsTuple(position));
  }

  static createSprite(name: string) {
    const texture = getTexture(name);
    if (texture === null) {
      throw new Error(`Texture ${name} not found`);
    }
    const sprite = new Sprite(texture);
    sprite.setSize(store.get(getTileSizeAtom));
    return sprite;
  }
}

import type { Entity } from './utils/ecsUtils';
import {
  getComponent,
  getEmptyPosition,
  hasComponent,
  setComponent,
} from './utils/ecsUtils';
import { store } from '../App';
import type { SpriteComponent } from './components/Components';
import { PositionComponent } from './components/Components';
import { KeyboardInputSystem } from './systems/KeyboardInputSystem';
import { RenderSystem } from './systems/RenderSystem';
import type { Ticker } from 'pixi.js';
import { pixiApp } from './Pixi';
import { atom } from 'jotai/index';
import type { System } from './systems/Systems';
import { GameMap } from './map/GameMap';
import { MovementSystem } from './systems/MovementSystem';
import { createEntitiesFromObjects } from './utils/EntityFactory';
import { Beaker, Boulder, Player } from './templates/EntityTemplates';

export const entitiesAtom = atom<Entity[]>([]);
export const systemsAtom = atom<System[]>([]);
export const mapAtom = atom<GameMap>(new GameMap());
export const playerAtom = atom((get) => {
  const entities = get(entitiesAtom);
  return entities.find((entity) => hasComponent(entity, 'player'));
});

export const initiateMap = () => {
  const map = store.get(mapAtom);
  map.init(10, 10);
  pixiApp.stage.addChild(map.getSpriteContainer());
};

export const initiateEntities = () => {
  const [player, boulder, beaker] = createEntitiesFromObjects(
    Player,
    Boulder,
    Beaker,
  );
  store.set(entitiesAtom, (entities) => [...entities, player, boulder, beaker]);

  setComponent(player, new PositionComponent(getEmptyPosition()));
  setComponent(boulder, new PositionComponent(getEmptyPosition()));
  setComponent(beaker, new PositionComponent(getEmptyPosition()));

  const tileWidth = pixiApp.screen.width / 10;
  const tileHeight = pixiApp.screen.height / 10;

  const entities = store.get(entitiesAtom);
  entities.forEach((entity) => {
    const positionComponent = getComponent<PositionComponent>(
      entity,
      'position',
    );
    const spriteComponent = getComponent<SpriteComponent>(entity, 'sprite');

    if (positionComponent && spriteComponent) {
      spriteComponent.sprite.width = tileWidth;
      spriteComponent.sprite.height = tileHeight;
      spriteComponent.sprite.position.set(
        positionComponent.x * tileWidth,
        positionComponent.y * tileHeight,
      );
      pixiApp.stage.addChild(spriteComponent.sprite);
    }
  });
};

export const initiateSystems = () => {
  const systems = store.get(systemsAtom);
  systems.push(new KeyboardInputSystem());
  systems.push(new MovementSystem());
  systems.push(new RenderSystem());
};

export const gameLoop = (ticker: Ticker) => {
  const map = store.get(mapAtom);
  const systems = store.get(systemsAtom);
  const entities = store.get(entitiesAtom);

  systems.forEach((system) => {
    system.update({ entities, time: ticker, map });
  });
};

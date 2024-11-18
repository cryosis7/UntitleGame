import type { Entity } from './utils/ecsUtils';
import { getComponent, hasComponent } from './utils/ecsUtils';
import { store } from '../App';
import {
  MovableComponent,
  PlayerComponent,
  PositionComponent,
  SpriteComponent,
  VelocityComponent,
} from './components/Components';
import { KeyboardInputSystem } from './systems/KeyboardInputSystem';
import { RenderSystem } from './systems/RenderSystem';
import type { Ticker } from 'pixi.js';
import { pixiApp } from './Pixi';
import { atom } from 'jotai/index';
import type { System } from './systems/Systems';
import { GameMap } from './map/GameMap';
import { MovementSystem } from './systems/MovementSystem';
import { createEntity } from './utils/EntityFactory';

export const entitiesAtom = atom<Entity[]>([]);
export const systemsAtom = atom<System[]>([]);
export const mapAtom = atom<GameMap>(new GameMap());
export const playerAtom = atom((get) => {
  const entities = get(entitiesAtom);
  return entities.find((entity) => hasComponent(entity, 'player'));
});

const createPlayer = () => {
  let playerX: number;
  let playerY: number;
  let isOccupied: boolean;
  const map = store.get(mapAtom);

  do {
    playerX = Math.floor(Math.random() * 10);
    playerY = Math.floor(Math.random() * 10);
    isOccupied = !map.isTileWalkable({ x: playerX, y: playerY });
  } while (isOccupied);

  const player = createEntity([
    new PositionComponent(playerX, playerY),
    new SpriteComponent('player'),
    new PlayerComponent(),
    new VelocityComponent(0, 0),
  ]);

  // entities.push(player);
  store.set(entitiesAtom, (entities) => [...entities, player]);
};

const createBoulder = () => {
  let boulderX: number;
  let boulderY: number;
  let isOccupied: boolean;
  const map = store.get(mapAtom);

  do {
    boulderX = Math.floor(Math.random() * 10);
    boulderY = Math.floor(Math.random() * 10);
    isOccupied = !map.isTileWalkable({ x: boulderX, y: boulderY });
  } while (isOccupied);

  const boulder = createEntity([
    new PositionComponent(boulderX, boulderY),
    new SpriteComponent('boulder'),
    new MovableComponent(),
  ]);

  // entities.push(boulder);
  store.set(entitiesAtom, (entities) => [...entities, boulder]);
};

export const addMap = () => {
  const map = store.get(mapAtom);
  map.init(10, 10);
  pixiApp.stage.addChild(map.getSpriteContainer());
};

export const addEntities = () => {
  createPlayer();
  createBoulder();

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

export const addSystems = () => {
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

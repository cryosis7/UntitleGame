import { type Entity, getEmptyPosition } from './utils/ecsUtils';
import { store } from '../App';
import type { SpriteComponent } from './components/Components';
import { ComponentType, PositionComponent } from './components/Components';
import { RenderSystem } from './systems/RenderSystem';
import type { Ticker } from 'pixi.js';
import { pixiApp } from './Pixi';
import { atom } from 'jotai/index';
import type { System } from './systems/Systems';
import { GameMap } from './map/GameMap';
import { createEntitiesFromTemplates } from './utils/EntityFactory';
import { Beaker, Boulder, Player } from './templates/EntityTemplates';
import {
  getComponentIfExists,
  hasComponent,
  setComponent,
} from './utils/ComponentUtils';

export const entitiesAtom = atom<Entity[]>([]);
export const systemsAtom = atom<System[]>([]);
export const mapAtom = atom<GameMap>(new GameMap());
export const playerAtom = atom((get) => {
  const entities = get(entitiesAtom);
  return entities.find((entity) => hasComponent(entity, ComponentType.Player));
});

export const initiateMap = () => {
  const map = store.get(mapAtom);
  map.init(10, 10);
  // pixiApp.stage.addChild(map.createSpriteContainer());
};

export const initiateEntities = () => {
  const [player, boulder, beaker] = createEntitiesFromTemplates(
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
    const positionComponent = getComponentIfExists<PositionComponent>(
      entity,
      ComponentType.Position,
    );
    const spriteComponent = getComponentIfExists<SpriteComponent>(
      entity,
      ComponentType.Sprite,
    );

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
  systems.push(
    // new KeyboardInputSystem(),
    // new MovementSystem(),
    // new PickupSystem(),
    new RenderSystem(),
    // new CleanUpSystem(),
  );
};

export const gameLoop = (ticker: Ticker) => {
  const systems = store.get(systemsAtom);

  systems.forEach((system) => {
    const map = store.get(mapAtom);
    const entities = store.get(entitiesAtom) ?? [];
    system.update({ entities, time: ticker, map });
  });
};

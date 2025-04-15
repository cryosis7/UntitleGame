import { getEmptyPosition } from './utils/ecsUtils';
import { store } from '../App';
import type { Ticker } from 'pixi.js';
import {
  createEntitiesFromTemplates,
  createEntity,
} from './utils/EntityFactory';
import { Beaker, Boulder, Player } from './templates/EntityTemplates';
import { setComponent } from './components/ComponentOperations';
import { KeyboardInputSystem } from './systems/KeyboardInputSystem';
import { MovementSystem } from './systems/MovementSystem';
import { PickupSystem } from './systems/PickupSystem';
import { CleanUpSystem } from './systems/CleanUpSystem';
import { entitiesAtom, mapAtom, systemsAtom } from './utils/Atoms';
import { EntityPlacementSystem } from './systems/LevelEditorSystems/EntityPlacementSystem';
import { PositionComponent } from './components/individualComponents/PositionComponent';
import { RenderSystem } from './systems/RenderSystem';
import { SidebarRenderSystem } from './systems/LevelEditorSystems/SidebarRenderSystem';
import { addEntities } from './utils/EntityUtils';
import { RenderInSidebarComponent } from './components/individualComponents/RenderInSidebarComponent';
import { SpriteComponent } from './components/individualComponents/SpriteComponent';

export const initiateEntities = () => {
  const [player, boulder, beaker] = createEntitiesFromTemplates(
    Player,
    Boulder,
    Beaker,
  );
  addEntities(player, boulder, beaker);

  setComponent(player, new PositionComponent(getEmptyPosition()));
  setComponent(boulder, new PositionComponent(getEmptyPosition()));
  setComponent(beaker, new PositionComponent(getEmptyPosition()));

  const sideBarEntity = createEntity([
    new PositionComponent({ x: 0, y: 0 }),
    new RenderInSidebarComponent(),
    new SpriteComponent({ sprite: 'bottle_blue' }),
  ]);
  addEntities(sideBarEntity);
};

export const initiateSystems = () => {
  const systems = store.get(systemsAtom);
  systems.push(
    new KeyboardInputSystem(),
    new MovementSystem(),
    new PickupSystem(),
    new EntityPlacementSystem(),

    new RenderSystem(),
    new SidebarRenderSystem(),

    new CleanUpSystem(),
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

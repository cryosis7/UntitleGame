import type { Entity} from './utils/ecsUtils';
import { getEmptyPosition } from './utils/ecsUtils';
import { store } from '../App';
import type { Ticker } from 'pixi.js';
import { Container } from 'pixi.js';
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
import {
  entitiesAtom,
  getAllTexturesAtom,
  mapAtom,
  setContainersAtom,
  systemsAtom,
} from './atoms/Atoms';
import { PositionComponent } from './components/individualComponents/PositionComponent';
import { RenderSystem } from './systems/RenderSystems/RenderSystem';
import { addEntities } from './utils/EntityUtils';
import { RenderInSidebarComponent } from './components/individualComponents/RenderInSidebarComponent';
import { SpriteComponent } from './components/individualComponents/SpriteComponent';
import { ClickHandlerSystem } from './systems/ClickHandlerSystem';
import { LevelEditorSystem } from './systems/LevelEditorSystems/LevelEditorSystem';

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

  addEntities(...createSidebarEntities());
};

const createSidebarEntities = () => {
  const textures = store.get(getAllTexturesAtom);

  const entities: Entity[] = [];
  const textureNames = Object.keys(textures);
  const columns = 10;

  textureNames.forEach((textureName, index) => {
    const x = index % columns;
    const y = Math.floor(index / columns);

    const entity = createEntity([
      new PositionComponent({ x, y }),
      new RenderInSidebarComponent(),
      new SpriteComponent({ sprite: textureName }),
    ]);

    entities.push(entity);
  });

  return entities;
};

export const initialiseContainers = () => {
  const mapContainer = new Container({
    eventMode: 'static',
  });
  const sidebarContainer = new Container({
    eventMode: 'static',
  });

  store.set(setContainersAtom, { mapContainer, sidebarContainer });
};

export const initialiseSystems = () => {
  const systems = store.get(systemsAtom);
  systems.push(
    new KeyboardInputSystem(),
    new MovementSystem(),
    new PickupSystem(),
    new LevelEditorSystem(),

    new ClickHandlerSystem(),
    new RenderSystem(),

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

import type { Entity } from './utils/ecsUtils';
import { getEmptyPosition } from './utils/ecsUtils';
import {
  entitiesAtom,
  getAllTexturesAtom,
  mapAtom,
  setContainersAtom,
  store,
  systemsAtom,
} from './utils/Atoms';
import { Container, type Ticker } from 'pixi.js';
import {
  createEntitiesFromTemplates,
  createEntity,
} from './utils/EntityFactory';
import {
  Beaker,
  Boulder,
  Chest,
  Key,
  Player,
} from './templates/EntityTemplates';
import { setComponent } from './components/ComponentOperations';
import { KeyboardInputSystem } from './systems/KeyboardInputSystem';
import { MovementSystem } from './systems/MovementSystem';
import { PickupSystem } from './systems/PickupSystem';
import { ItemInteractionSystem } from './systems/ItemInteractionSystem';
import { CleanUpSystem } from './systems/CleanUpSystem';
import {
  PositionComponent,
  RenderInSidebarComponent,
  SpriteComponent,
} from './components';
import { GameRenderSystem } from './systems/RenderSystems/GameRenderSystem';
import { addEntities } from './utils/EntityUtils';
import { DirectionSystem } from './systems/DirectionSystem';
import { SidebarRenderSystem } from './systems/RenderSystems/SidebarRenderSystem';
import { MapRenderSystem } from './systems/RenderSystems/MapRenderSystem';
import { LevelEditorSelectionSystem } from './systems/LevelEditorSystems/LevelEditorSelectionSystem';
import { LevelEditorPlacementSystem } from './systems/LevelEditorSystems/LevelEditorPlacementSystem';

export const initiateEntities = () => {
  const newEntities = createEntitiesFromTemplates(
    Player,
    Boulder,
    Beaker,
    Key,
    Chest,
  );
  addEntities(newEntities);

  newEntities.forEach((e) => {
    setComponent(e, new PositionComponent(getEmptyPosition()));
  });

  addEntities(createSidebarEntities());
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

export const initiateSystems = () => {
  const systems = store.get(systemsAtom);
  systems.push(
    new KeyboardInputSystem(),
    new DirectionSystem(),
    new MovementSystem(),
    new PickupSystem(),
    new ItemInteractionSystem(),

    new LevelEditorSelectionSystem(),
    new LevelEditorPlacementSystem(),

    new MapRenderSystem(),
    new GameRenderSystem(),
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

import { getEmptyPosition } from './utils/ecsUtils';
import { entitiesAtom, mapAtom, store, systemsAtom } from './utils/Atoms';
import type { Ticker } from 'pixi.js';
import { createEntitiesFromTemplates } from './utils/EntityFactory';
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
import { LevelEditorPlacementSystem } from './systems/LevelEditorSystems/LevelEditorPlacementSystem';
import { PositionComponent } from './components';
import { GameRenderSystem } from './systems/RenderSystems/GameRenderSystem';
import { addEntities } from './utils/EntityUtils';
import { DirectionSystem } from './systems/DirectionSystem';
import { RenderSidebarSystem } from './systems/RenderSystems/RenderSidebarSystem';
import { MapRenderSystem } from './systems/RenderSystems/MapRenderSystem';

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
};

export const initiateSystems = () => {
  const systems = store.get(systemsAtom);
  systems.push(
    new KeyboardInputSystem(),
    new DirectionSystem(),
    new MovementSystem(),
    new PickupSystem(),
    new ItemInteractionSystem(),
    new LevelEditorPlacementSystem(),

    new MapRenderSystem(),
    new GameRenderSystem(),
    new RenderSidebarSystem(),

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

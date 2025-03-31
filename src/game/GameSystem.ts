import { getEmptyPosition } from './utils/ecsUtils';
import { store } from '../App';
import { ComponentType, PositionComponent } from './components/Components';
import { RenderSystem } from './systems/RenderSystem';
import type { Ticker } from 'pixi.js';
import { pixiApp } from './Pixi';
import { createEntitiesFromTemplates } from './utils/EntityFactory';
import { Beaker, Boulder, Player } from './templates/EntityTemplates';
import { getComponentIfExists, setComponent } from './utils/ComponentUtils';
import { KeyboardInputSystem } from './systems/KeyboardInputSystem';
import { MovementSystem } from './systems/MovementSystem';
import { PickupSystem } from './systems/PickupSystem';
import { CleanUpSystem } from './systems/CleanUpSystem';
import {
  entitiesAtom,
  getTileSizeAtom,
  mapAtom,
  systemsAtom,
  updateMapConfigAtom,
} from './utils/Atoms';
import { gridToScreenAsTuple } from './map/MappingUtils';
import { EntityPlacementSystem } from './systems/LevelEditorSystems/EntityPlacementSystem';
import { addEntities } from './utils/EntityUtils';

export interface GridSize {
  rows: number;
  cols: number;
}

export const initiateMap = (gridSize: GridSize) => {
  const map = store.get(mapAtom);
  store.set(updateMapConfigAtom, gridSize);
  map.init(gridSize);
};

export const initiateEntities = () => {
  const [player, boulder, beaker] = createEntitiesFromTemplates(
    Player,
    Boulder,
    Beaker,
  );
  addEntities([player, boulder, beaker]);

  setComponent(player, new PositionComponent(getEmptyPosition()));
  setComponent(boulder, new PositionComponent(getEmptyPosition()));
  setComponent(beaker, new PositionComponent(getEmptyPosition()));

  const tileSize = store.get(getTileSizeAtom);
  const entities = store.get(entitiesAtom);
  entities.forEach((entity) => {
    const positionComponent = getComponentIfExists(
      entity,
      ComponentType.Position,
    );
    const spriteComponent = getComponentIfExists(entity, ComponentType.Sprite);

    if (positionComponent && spriteComponent) {
      spriteComponent.sprite.setSize(tileSize);
      spriteComponent.sprite.position.set(
        ...gridToScreenAsTuple(positionComponent),
      );
      pixiApp.stage.addChild(spriteComponent.sprite);
    }
  });
};

export const initiateSystems = () => {
  const systems = store.get(systemsAtom);
  systems.push(
    new KeyboardInputSystem(),
    new MovementSystem(),
    new PickupSystem(),
    new EntityPlacementSystem(),

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

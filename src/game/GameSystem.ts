import { getEmptyPosition } from './utils/ecsUtils';
import { store } from '../App';
import type { Ticker } from 'pixi.js';
import { pixiApp } from './Pixi';
import { createEntitiesFromTemplates } from './utils/EntityFactory';
import {
  Beaker,
  Boulder,
  Chest,
  Key,
  Player,
} from './templates/EntityTemplates';
import {
  getComponentIfExists,
  setComponent,
} from './components/ComponentOperations';
import { KeyboardInputSystem } from './systems/KeyboardInputSystem';
import { MovementSystem } from './systems/MovementSystem';
import { PickupSystem } from './systems/PickupSystem';
import { ItemInteractionSystem } from './systems/ItemInteractionSystem';
import { CleanUpSystem } from './systems/CleanUpSystem';
import {
  entitiesAtom,
  getTileSizeAtom,
  mapAtom,
  systemsAtom,
} from './utils/Atoms';
import { gridToScreenAsTuple } from './map/MappingUtils';
import { EntityPlacementSystem } from './systems/LevelEditorSystems/EntityPlacementSystem';
import { PositionComponent } from './components/individualComponents/PositionComponent';
import { ComponentType } from './components/ComponentTypes';
import { RenderSystem } from './systems/RenderSystem';
import { RenderSidebarSystem } from './systems/LevelEditorSystems/RenderSidebarSystem';
import { addEntities } from './utils/EntityUtils';
import { DirectionSystem } from './systems/DirectionSystem';

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
    new DirectionSystem(),
    new MovementSystem(),
    new PickupSystem(),
    new ItemInteractionSystem(),
    new EntityPlacementSystem(),

    new RenderSystem(),
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

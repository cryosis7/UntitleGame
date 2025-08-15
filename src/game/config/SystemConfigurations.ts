import type { BaseSystem } from '../systems/Framework/Systems';
import type { Entity } from '../utils/ecsUtils';
import { getEmptyPosition } from '../utils/ecsUtils';
import { KeyboardInputSystem } from '../systems/KeyboardInputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { CleanUpSystem } from '../systems/CleanUpSystem';
import { DirectionSystem } from '../systems/DirectionSystem';
import { GameRenderSystem } from '../systems/RenderSystems/GameRenderSystem';
import { SidebarRenderSystem } from '../systems/RenderSystems/SidebarRenderSystem';
import { MapRenderSystem } from '../systems/RenderSystems/MapRenderSystem';
import { LevelEditorSelectionSystem } from '../systems/LevelEditorSystems/LevelEditorSelectionSystem';
import { LevelEditorPlacementSystem } from '../systems/LevelEditorSystems/LevelEditorPlacementSystem';
import { PickupSystem } from '../systems/PickupSystem';
import { ItemInteractionSystem } from '../systems/ItemInteractionSystem';
import { createEntitiesFromTemplates, createEntity } from '../utils/EntityFactory';
import { Beaker, Boulder, Chest, Key, Player } from '../templates/EntityTemplates';
import { setComponent } from '../components/ComponentOperations';
import { PositionComponent, RenderInSidebarComponent, SpriteComponent } from '../components';
import { getAllTexturesAtom, store } from '../utils/Atoms';

const createGameEntities = (): Entity[] => {
  const newEntities = createEntitiesFromTemplates(
    Player,
    Boulder,
    Beaker,
    Key,
    Chest,
  );

  newEntities.forEach((e) => {
    setComponent(e, new PositionComponent(getEmptyPosition()));
  });

  // Add sidebar entities
  const textures = store.get(getAllTexturesAtom);
  const sidebarEntities: Entity[] = [];
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

    sidebarEntities.push(entity);
  });

  return [...newEntities, ...sidebarEntities];
};

export interface SystemConfig {
  systems: (() => BaseSystem)[];
  entities?: () => Entity[];
  mapConfig?: {
    rows?: number;
    cols?: number;
  };
}

export const gameSystemConfig: SystemConfig = {
  systems: [
    () => new KeyboardInputSystem(),
    () => new DirectionSystem(),
    () => new MovementSystem(),
    () => new PickupSystem(),
    () => new ItemInteractionSystem(),
    () => new MapRenderSystem(),
    () => new GameRenderSystem(),
    () => new SidebarRenderSystem(),
    () => new CleanUpSystem(),
  ],
  entities: createGameEntities,
  mapConfig: {
    rows: 10,
    cols: 10,
  },
};

export const editorSystemConfig: SystemConfig = {
  systems: [
    () => new LevelEditorSelectionSystem(),
    () => new LevelEditorPlacementSystem(),
    () => new MapRenderSystem(),
    () => new SidebarRenderSystem(),
    () => new CleanUpSystem(),
  ],
  mapConfig: {
    rows: 15,
    cols: 15,
  },
};
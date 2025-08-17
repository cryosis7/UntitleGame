import type { BaseSystem } from '../systems/Framework/Systems';
import type { Entity } from '../utils/ecsUtils';
import { getEmptyPosition } from '../utils/ecsUtils';
import { KeyboardInputSystem } from '../systems/KeyboardInputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { CleanUpSystem } from '../systems/CleanUpSystem';
import { DirectionSystem } from '../systems/DirectionSystem';
import { GameRenderSystem } from '../systems/RenderSystems/GameRenderSystem';
import { SidebarRenderSystem } from '../systems/RenderSystems/SidebarRenderSystem';
import { SidebarHighlightRenderSystem } from '../systems/RenderSystems/SidebarHighlightRenderSystem';
import { MapRenderSystem } from '../systems/RenderSystems/MapRenderSystem';
import { HUDRenderSystem } from '../systems/RenderSystems/HUDRenderSystem';
import { LevelEditorSelectionSystem } from '../systems/LevelEditorSystems/LevelEditorSelectionSystem';
import { LevelEditorPlacementSystem } from '../systems/LevelEditorSystems/LevelEditorPlacementSystem';
import { PickupSystem } from '../systems/PickupSystem';
import { ItemInteractionSystem } from '../systems/ItemInteractionSystem';
import { createEntity, createEntityFromTemplate } from '../utils/EntityFactory';
import {
  Beaker,
  Boulder,
  Chest,
  Key,
  Player,
} from '../templates/EntityTemplates';
import {
  PositionComponent,
  RenderComponent,
  SpriteComponent,
} from '../components';
import { getAllTexturesAtom, store } from '../utils/Atoms';

const createGameEntities = (): Entity[] => {
  const entitiesToCreate = [Player, Boulder, Beaker, Key, Chest];
  const gameEntities: Entity[] = [];

  entitiesToCreate.forEach((e) => {
    const position = getEmptyPosition(gameEntities);
    gameEntities.push(
      createEntityFromTemplate({
        components: {
          ...e.components,
          position,
        },
      }),
    );
  });

  return gameEntities;
};

const createSidebarEntities = () => {
  const textures = store.get(getAllTexturesAtom);
  const sidebarEntities: Entity[] = [];
  const textureNames = Object.keys(textures);
  const columns = 10;

  textureNames.forEach((textureName, index) => {
    const x = index % columns;
    const y = Math.floor(index / columns);

    const entity = createEntity([
      new PositionComponent({ x, y }),
      new RenderComponent({ section: 'sidebar' }),
      new SpriteComponent({ sprite: textureName }),
    ]);

    sidebarEntities.push(entity);
  });
  return sidebarEntities;
};

const createHudEntities = (): Entity[] => {
  const hudEntities: Entity[] = [];

  const hudEntity = createEntity([
    new PositionComponent({ x: 1, y: 2 }),
    new RenderComponent({ section: 'hud' }),
    new SpriteComponent({ sprite: 'grass' }),
  ]);

  hudEntities.push(hudEntity);
  return hudEntities;
};

export interface SystemConfig {
  systemsFactory: (() => BaseSystem)[];
  entitiesFactory?: () => Entity[];
  mapConfig?: {
    rows?: number;
    cols?: number;
  };
}

export const gameSystemConfig: SystemConfig = {
  systemsFactory: [
    () => new KeyboardInputSystem(),
    () => new DirectionSystem(),
    () => new MovementSystem(),
    () => new PickupSystem(),
    () => new ItemInteractionSystem(),
    () => new MapRenderSystem(),
    () => new GameRenderSystem(),
    () => new SidebarRenderSystem(),
    () => new HUDRenderSystem(),
    () => new CleanUpSystem(),
  ],
  entitiesFactory: () => [...createGameEntities(), ...createHudEntities()],
  mapConfig: {
    rows: 10,
    cols: 10,
  },
};

export const editorSystemConfig: SystemConfig = {
  systemsFactory: [
    () => new LevelEditorSelectionSystem(),
    () => new LevelEditorPlacementSystem(),
    () => new MapRenderSystem(),
    () => new GameRenderSystem(),
    () => new SidebarRenderSystem(),
    () => new SidebarHighlightRenderSystem(),
    () => new HUDRenderSystem(),
    () => new CleanUpSystem(),
  ],
  entitiesFactory: createSidebarEntities,
  mapConfig: {
    rows: 15,
    cols: 15,
  },
};

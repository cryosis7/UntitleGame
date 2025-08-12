import type { Entity } from './utils/ecsUtils';
import { getEmptyPosition } from './utils/ecsUtils';
import {
  entitiesAtom,
  getAllTexturesAtom,
  mapAtom,
  setContainersAtom,
  store,
  systemsAtom,
  updateMapConfigAtom,
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
import {
  PositionComponent,
  RenderInSidebarComponent,
  SpriteComponent,
} from './components';
import { addEntities } from './utils/EntityUtils';
import type { SystemConfig } from './config/SystemConfigurations';

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

export const initiateSystems = (config: SystemConfig) => {
  const systems = store.get(systemsAtom);
  // Clear existing systems
  systems.length = 0;
  // Add new systems from config
  systems.push(...config.systems.map(systemFactory => systemFactory()));
};

export const initializeGame = async (config: SystemConfig) => {
  // Update map configuration if provided
  if (config.mapConfig) {
    store.set(updateMapConfigAtom, config.mapConfig);
  }
  
  // Initialize map
  const map = store.get(mapAtom);
  map.init();

  // Initialize entities (for game mode only, editor starts empty)
  if (config.entities) {
    const entities = config.entities();
    addEntities(entities);
  }

  // Initialize containers
  initialiseContainers();
  
  // Initialize systems
  initiateSystems(config);
};

export const gameLoop = (ticker: Ticker) => {
  const systems = store.get(systemsAtom);

  systems.forEach((system) => {
    const map = store.get(mapAtom);
    const entities = store.get(entitiesAtom) ?? [];

    system.update({ entities, time: ticker, map });
  });
};

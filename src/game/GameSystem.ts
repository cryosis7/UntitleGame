import {
  entitiesAtom,
  mapAtom,
  setContainersAtom,
  store,
  systemsAtom,
  updateMapConfigAtom,
} from './utils/Atoms';
import { Container, type Ticker } from 'pixi.js';
import { addEntities } from './utils/EntityUtils';
import type { SystemConfig } from './config/SystemConfigurations';

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
  systems.length = 0;
  systems.push(
    ...config.systemsFactory.map((systemFactory) => systemFactory()),
  );
};

export const initializeGame = async (config: SystemConfig) => {
  if (config.mapConfig) {
    store.set(updateMapConfigAtom, config.mapConfig);
  }

  const map = store.get(mapAtom);
  map.init();

  if (config.entitiesFactory) {
    const entities = config.entitiesFactory();
    addEntities(entities);
  }

  initialiseContainers();
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

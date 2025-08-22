import {
  entitiesAtom,
  mapAtom,
  setContainersAtom,
  store,
  systemsAtom,
  updateMapConfigAtom,
} from './atoms';
import { Container, type Ticker } from 'pixi.js';
import { addEntities } from './utils/EntityUtils';
import type { SystemConfig } from './config/SystemConfigurations';
import { RenderSection } from './components';
import type { BaseSystem } from './systems/Framework/Systems';

export const initialiseContainers = () => {
  const mapContainer = new Container({
    eventMode: 'static',
    label: RenderSection.Map,
  });
  const sidebarContainer = new Container({
    eventMode: 'static',
    label: RenderSection.Sidebar,
  });
  const hudContainer = new Container({
    eventMode: 'none',
    label: RenderSection.Hud,
  });

  store.set(setContainersAtom, {
    mapContainer,
    sidebarContainer,
    hudContainer,
  });
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

  systems.forEach((system: BaseSystem) => {
    const map = store.get(mapAtom);
    const entities = store.get(entitiesAtom) ?? [];

    system.update({ entities, time: ticker, map });
  });
};

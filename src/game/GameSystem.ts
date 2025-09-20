import {
  entitiesAtom,
  setContainersAtom,
  setMapConfigAtom,
  store,
  systemsAtom,
} from './atoms';
import { Container, type Ticker } from 'pixi.js';
import { addEntities } from './utils/EntityUtils';
import type { SystemConfig } from './config/SystemConfigurations';
import { RenderSection } from './components';
import type { BaseSystem } from './systems/Framework/Systems';

export const initialiseGame = async (config: SystemConfig) => {
  store.set(setMapConfigAtom, config.mapConfig);

  if (config.entitiesFactory) {
    const entities = config.entitiesFactory();
    addEntities(entities);
  }

  initialiseContainers();
  initiateSystems(config);
};

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
  systems.push(
    ...config.systemsFactory.map((systemFactory) => systemFactory()),
  );
};

export const gameLoop = (ticker: Ticker) => {
  const systems = store.get(systemsAtom);

  systems.forEach((system: BaseSystem) => {
    const entities = store.get(entitiesAtom) ?? [];

    system.update({ entities, time: ticker });
  });
};

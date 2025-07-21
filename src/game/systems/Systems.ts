import type { Ticker } from 'pixi.js';
import type { Entity } from '../utils/ecsUtils';
import type { GameMap } from '../map/GameMap';

export interface UpdateArgs {
  entities: Entity[];
  time?: Ticker;
  map: GameMap;
}

// TODO: Maybe instead of a cleanup system, I could add a cleanup function to the system interface
export type System = {
  update: (updateArgs: UpdateArgs) => void;
};

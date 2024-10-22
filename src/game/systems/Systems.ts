import type { Ticker } from 'pixi.js';
import type { Entity } from '../utils/ecsUtils';
import type { GameMap } from '../map/GameMap';

export interface UpdateArgs {
  entities?: Entity[],
  time?: Ticker,
  map?: GameMap
}

export type System = {
  update: (updateArgs: UpdateArgs) => void;
};

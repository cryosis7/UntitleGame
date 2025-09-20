import type { Ticker } from 'pixi.js';
import type { Entity } from '../../utils/ecsUtils';

export interface UpdateArgs {
  entities: Entity[];
  time?: Ticker;
}

// TODO: Maybe instead of a cleanup system, I could add a cleanup function to the system interface
export type BaseSystem = {
  update: (updateArgs: UpdateArgs) => void;
};

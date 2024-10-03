import type { Ticker } from 'pixi.js';
import type { Entity } from '../utils/ecsUtils';

export type System = {
  update: (entities: Entity[], time: Ticker) => void;
};

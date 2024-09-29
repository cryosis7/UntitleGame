import type { Ticker } from 'pixi.js';
import type { Entity } from '../../../utils/ecsUtils';

export type System = {
  init: () => void;
  update: (time: Ticker, entities: Entity[]) => void;
};

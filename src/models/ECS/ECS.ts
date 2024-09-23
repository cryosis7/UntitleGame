import type { Ticker } from 'pixi.js';
import type { Component } from './Components';

export type Entity = {
  id: string;
  components: Component[];
};

export type System = {
  update: (time: Ticker, entities: Entity[]) => void;
};

export function createEntity(components: Component[]): Entity {
  return { id: crypto.randomUUID(), components };
}

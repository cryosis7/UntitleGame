import { Sprite } from 'pixi.js';
import { pixiApp } from '../Pixi';
import type { Position } from '../map/GameMap';

export enum ComponentType {
  Position = 'position',
  Sprite = 'sprite',
  Player = 'player',
  Movable = 'movable',
  Velocity = 'velocity',
  Pickable = 'pickable',
  CarriedItem = "carriedItem",
  Interacting = "interacting",
  Handling = "handling",
}

type ComponentBase = {
  type: ComponentType;
}; // TODO: Revist this and see if I can remove type in favor of instanceof checks

export type Component =
  | PositionComponent
  | SpriteComponent
  | PlayerComponent
  | MovableComponent
  | VelocityComponent
  | PickableComponent
  | CarriedItemComponent
  | InteractingComponent
  | HandlingComponent;

export type PositionComponentTemplate = Position;
export class PositionComponent implements ComponentBase {
  type = ComponentType.Position;
  x: number;
  y: number;

  constructor({ x, y }: PositionComponentTemplate) {
    this.x = x;
    this.y = y;
  }
}

export type SpriteComponentTemplate = { sprite: string };
export class SpriteComponent implements ComponentBase {
  type = ComponentType.Sprite;
  sprite: Sprite;

  constructor({ sprite }: SpriteComponentTemplate) {
    this.sprite = Sprite.from(sprite);
    this.sprite.setSize(pixiApp.stage.width / 10);
  }
}

export class PlayerComponent implements ComponentBase {
  type = ComponentType.Player;
}

export class MovableComponent implements ComponentBase {
  type = ComponentType.Movable;
}

export type VelocityComponentTemplate = { vx: number; vy: number };

export class VelocityComponent implements ComponentBase {
  type = ComponentType.Velocity;
  vx: number;
  vy: number;

  constructor({ vx, vy }: VelocityComponentTemplate) {
    this.vx = vx;
    this.vy = vy;
  }
}

export class PickableComponent implements ComponentBase {
  type = ComponentType.Pickable;
}

export type CarriedItemTemplate = { item: string };
export class CarriedItemComponent implements ComponentBase {
  type = ComponentType.CarriedItem;
  item: string;

  constructor({item}: CarriedItemTemplate) {
    this.item = item;
  }
}

export class InteractingComponent implements ComponentBase {
  type = ComponentType.Interacting;
}

export class HandlingComponent implements ComponentBase {
  type = ComponentType.Handling;
}
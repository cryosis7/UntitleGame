import { Sprite } from 'pixi.js';
import { pixiApp } from '../Pixi';

export enum ComponentType {
  Position = 'position',
  Sprite = 'sprite',
  Player = 'player',
  Movable = 'movable',
  Velocity = 'velocity',
}

type ComponentBase = {
  type: ComponentType;
}; // TODO: Revist this and see if I can remove type in favor of instanceof checks

export type Component =
  | PositionComponent
  | SpriteComponent
  | PlayerComponent
  | MovableComponent
  | VelocityComponent;

export class PositionComponent implements ComponentBase {
  type = ComponentType.Position;
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class SpriteComponent implements ComponentBase {
  type = ComponentType.Sprite;
  sprite: Sprite;

  constructor(sprite: string) {
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

export class VelocityComponent implements ComponentBase {
  type = ComponentType.Velocity;
  vx: number;
  vy: number;

  constructor(vx: number, vy: number) {
    this.vx = vx;
    this.vy = vy;
  }
}

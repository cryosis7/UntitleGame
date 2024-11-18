import { Sprite } from 'pixi.js';
import { pixiApp } from '../Pixi';

export enum ComponentType {
  Position = 'position',
  Sprite = 'sprite',
  Player = 'player',
  Movable = 'movable',
  Velocity = 'velocity',
}

export type Component = {
  type: ComponentType;
}; // TODO: Revist this and see if I can remove type in favor of instanceof checks

export class PositionComponent implements Component {
  type = ComponentType.Position;
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class SpriteComponent implements Component {
  type = ComponentType.Sprite;
  sprite: Sprite;

  constructor(sprite: string) {
    this.sprite = Sprite.from(sprite);
    this.sprite.setSize(pixiApp.stage.width / 10);
  }
}

export class PlayerComponent implements Component {
  type = ComponentType.Player;
}

export class MovableComponent implements Component {
  type = ComponentType.Movable;
}

export class VelocityComponent implements Component {
  type = ComponentType.Velocity;
  vx: number;
  vy: number;

  constructor(vx: number, vy: number) {
    this.vx = vx;
    this.vy = vy;
  }
}

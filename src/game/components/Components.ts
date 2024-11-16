import { Sprite } from 'pixi.js';
import { pixiApp } from '../Pixi';

export type Component = {
  type: string;
}; // TODO: Revist this and see if I can remove type in favor of instanceof checks

export class PositionComponent implements Component {
  type = 'position';
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class SpriteComponent implements Component {
  type = 'sprite';
  sprite: Sprite;

  constructor(sprite: string) {
    this.sprite = Sprite.from(sprite);
    this.sprite.setSize(pixiApp.stage.width / 10);
  }
}

export class PlayerComponent implements Component {
  type = 'player';
}

export class MovableComponent implements Component {
  type = 'movable';
}

export class VelocityComponent implements Component {
  type = 'velocity';
  vx: number;
  vy: number;

  constructor(vx: number, vy: number) {
    this.vx = vx;
    this.vy = vy;
  }
}
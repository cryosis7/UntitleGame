import { Sprite } from "pixi.js";

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
  sprite: Sprite

  constructor(sprite: string) {
    this.sprite = Sprite.from(sprite);
  }
}

export class PlayerComponent implements Component {
  type = 'player';
}

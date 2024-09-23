export type Component = {
  type: string;
};

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
  sprite: string;

  constructor(sprite: string) {
    this.sprite = sprite;
  }
}

export class PlayerComponent implements Component {
  type = 'player';
}

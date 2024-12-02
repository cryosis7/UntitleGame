export type ComponentTemplate =
  | PositionTemplate
  | SpriteTemplate
  | VelocityTemplate
  | PlayerTemplate
  | MovableTemplate;

interface PositionTemplate {
  x: number;
  y: number;
}

interface SpriteTemplate {
  sprite: string;
}

interface VelocityTemplate {
  vx: number;
  vy: number;
}

interface PlayerTemplate {}

interface MovableTemplate {}

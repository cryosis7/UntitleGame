import { Sprite } from 'pixi.js';
import { pixiApp } from '../Pixi';
import type { Position } from '../map/GameMap';
import { getTexture, getTileSizeAtom } from '../utils/Atoms';
import { store } from '../../App';

export enum ComponentType {
  Position = 'position',
  Sprite = 'sprite',
  Player = 'player',
  Movable = 'movable',
  Velocity = 'velocity',
  Pickable = 'pickable',
  CarriedItem = 'carriedItem',
  Interacting = 'interacting',
  Handling = 'handling',
  Walkable = 'walkable',
}

type ComponentBase = {
  type: ComponentType;
};

export type Component =
  | PositionComponent
  | SpriteComponent
  | PlayerComponent
  | MovableComponent
  | VelocityComponent
  | PickableComponent
  | CarriedItemComponent
  | InteractingComponent
  | HandlingComponent
  | WalkableComponent;

export type ComponentProps =
  | PositionComponentProps
  | SpriteComponentProps
  | VelocityComponentProps
  | CarriedItemComponentProps
  | {};

export type PositionComponentProps = Position;
export class PositionComponent implements ComponentBase {
  type = ComponentType.Position;
  x: number;
  y: number;

  constructor({ x, y }: PositionComponentProps) {
    this.x = x;
    this.y = y;
  }
}

export type SpriteComponentProps = { sprite: string };
export class SpriteComponent implements ComponentBase {
  type = ComponentType.Sprite;
  sprite: Sprite;

  constructor({ sprite }: SpriteComponentProps) {
    const texture = getTexture(sprite);
    if (texture === null) {
      throw Error('No matching texture found for sprite: ' + sprite);
    }

    this.sprite = new Sprite(texture);
    this.sprite.setSize(store.get(getTileSizeAtom));
  }
}

export class PlayerComponent implements ComponentBase {
  type = ComponentType.Player;
}

export class MovableComponent implements ComponentBase {
  type = ComponentType.Movable;
}

export type VelocityComponentProps = { vx: number; vy: number };
export class VelocityComponent implements ComponentBase {
  type = ComponentType.Velocity;
  vx: number;
  vy: number;

  constructor({ vx, vy }: VelocityComponentProps) {
    this.vx = vx;
    this.vy = vy;
  }
}

export class PickableComponent implements ComponentBase {
  type = ComponentType.Pickable;
}

export type CarriedItemComponentProps = { item: string };
export class CarriedItemComponent implements ComponentBase {
  type = ComponentType.CarriedItem;
  item: string;

  constructor({ item }: CarriedItemComponentProps) {
    this.item = item;
  }
}

export class InteractingComponent implements ComponentBase {
  type = ComponentType.Interacting;
}

export class HandlingComponent implements ComponentBase {
  type = ComponentType.Handling;
}

export class WalkableComponent implements ComponentBase {
  type = ComponentType.Walkable;
}
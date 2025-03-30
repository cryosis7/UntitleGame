import { Sprite } from 'pixi.js';
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

type BaseComponent = {
  type: ComponentType;
};

type FullComponentDictionary = {
  [ComponentType.Position]: PositionComponent;
  [ComponentType.Sprite]: SpriteComponent;
  [ComponentType.Player]: PlayerComponent;
  [ComponentType.Movable]: MovableComponent;
  [ComponentType.Velocity]: VelocityComponent;
  [ComponentType.Pickable]: PickableComponent;
  [ComponentType.CarriedItem]: CarriedItemComponent;
  [ComponentType.Interacting]: InteractingComponent;
  [ComponentType.Handling]: HandlingComponent;
  [ComponentType.Walkable]: WalkableComponent;
};

export type Component = FullComponentDictionary[keyof FullComponentDictionary];
export type ComponentDictionary = Partial<{
  [type in ComponentType]: Component;
}>;

export type ComponentProps =
  | PositionComponentProps
  | SpriteComponentProps
  | VelocityComponentProps
  | CarriedItemComponentProps
  | {};

export type PositionComponentProps = Position;

export class PositionComponent implements BaseComponent {
  type = ComponentType.Position;
  x: number;
  y: number;

  constructor({ x, y }: PositionComponentProps) {
    this.x = x;
    this.y = y;
  }
}

export type SpriteComponentProps = { sprite: string };

export class SpriteComponent implements BaseComponent {
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

export class PlayerComponent implements BaseComponent {
  type = ComponentType.Player;
}

export class MovableComponent implements BaseComponent {
  type = ComponentType.Movable;
}

export type VelocityComponentProps = { vx: number; vy: number };

export class VelocityComponent implements BaseComponent {
  type = ComponentType.Velocity;
  vx: number;
  vy: number;

  constructor({ vx, vy }: VelocityComponentProps) {
    this.vx = vx;
    this.vy = vy;
  }
}

export class PickableComponent implements BaseComponent {
  type = ComponentType.Pickable;
}

export type CarriedItemComponentProps = { item: string };

export class CarriedItemComponent implements BaseComponent {
  type = ComponentType.CarriedItem;
  item: string;

  constructor({ item }: CarriedItemComponentProps) {
    this.item = item;
  }
}

export class InteractingComponent implements BaseComponent {
  type = ComponentType.Interacting;
}

export class HandlingComponent implements BaseComponent {
  type = ComponentType.Handling;
}

export class WalkableComponent implements BaseComponent {
  type = ComponentType.Walkable;
}

import type {
  PositionComponent,
  PositionComponentProps,
} from './IndividualComponents/PositionComponent';
import type {
  SpriteComponent,
  SpriteComponentProps,
} from './IndividualComponents/SpriteComponent';
import type { PlayerComponent } from './IndividualComponents/PlayerComponent';
import type { MovableComponent } from './IndividualComponents/MovableComponent';
import type {
  VelocityComponent,
  VelocityComponentProps,
} from './IndividualComponents/VelocityComponent';
import type { PickableComponent } from './IndividualComponents/PickableComponent';
import type {
  CarriedItemComponent,
  CarriedItemComponentProps,
} from './IndividualComponents/CarriedItemComponent';
import type { InteractingComponent } from './IndividualComponents/InteractingComponent';
import type { HandlingComponent } from './IndividualComponents/HandlingComponent';
import type { WalkableComponent } from './IndividualComponents/WalkableComponent';

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

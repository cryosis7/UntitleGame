import type {
  PositionComponent,
  PositionComponentProps,
} from './individualComponents/PositionComponent';
import type {
  SpriteComponent,
  SpriteComponentProps,
} from './individualComponents/SpriteComponent';
import type { PlayerComponent } from './individualComponents/PlayerComponent';
import type { MovableComponent } from './individualComponents/MovableComponent';
import type {
  VelocityComponent,
  VelocityComponentProps,
} from './individualComponents/VelocityComponent';
import type { PickableComponent } from './individualComponents/PickableComponent';
import type {
  CarriedItemComponent,
  CarriedItemComponentProps,
} from './individualComponents/CarriedItemComponent';
import type { InteractingComponent } from './individualComponents/InteractingComponent';
import type { HandlingComponent } from './individualComponents/HandlingComponent';
import type { WalkableComponent } from './individualComponents/WalkableComponent';
import type {
  RequiresItemComponent,
  RequiresItemComponentProps,
} from './individualComponents/RequiresItemComponent';
import type {
  UsableItemComponent,
  UsableItemComponentProps,
} from './individualComponents/UsableItemComponent';
import type {
  InteractionBehaviorComponent,
  InteractionBehaviorComponentProps,
} from './individualComponents/InteractionBehaviorComponent';
import type {
  SpawnContentsComponent,
  SpawnContentsComponentProps,
} from './individualComponents/SpawnContentsComponent';
import type {
  DirectionComponent,
  DirectionComponentProps,
} from './individualComponents/DirectionComponent';
import type {
  RenderComponent,
  RenderComponentProps,
} from './individualComponents/RenderComponent';
import type { SelectedComponent } from './individualComponents/SelectedComponent';

export enum ComponentType {
  Position = 'position',
  Sprite = 'sprite',
  Player = 'player',
  Movable = 'movable',
  Velocity = 'velocity',
  Direction = 'direction',
  Pickable = 'pickable',
  CarriedItem = 'carriedItem',
  Interacting = 'interacting',
  Handling = 'handling',
  Walkable = 'walkable',
  Render = 'render',
  RequiresItem = 'requiresItem',
  UsableItem = 'usableItem',
  InteractionBehavior = 'interactionBehavior',
  SpawnContents = 'spawnContents',
  Selected = 'selected',
}

export type FullComponentDictionary = {
  [ComponentType.Position]: PositionComponent;
  [ComponentType.Sprite]: SpriteComponent;
  [ComponentType.Player]: PlayerComponent;
  [ComponentType.Movable]: MovableComponent;
  [ComponentType.Velocity]: VelocityComponent;
  [ComponentType.Direction]: DirectionComponent;
  [ComponentType.Pickable]: PickableComponent;
  [ComponentType.CarriedItem]: CarriedItemComponent;
  [ComponentType.Interacting]: InteractingComponent;
  [ComponentType.Handling]: HandlingComponent;
  [ComponentType.Walkable]: WalkableComponent;
  [ComponentType.Render]: RenderComponent;
  [ComponentType.RequiresItem]: RequiresItemComponent;
  [ComponentType.UsableItem]: UsableItemComponent;
  [ComponentType.InteractionBehavior]: InteractionBehaviorComponent;
  [ComponentType.SpawnContents]: SpawnContentsComponent;
  [ComponentType.Selected]: SelectedComponent;
};

export type Component = FullComponentDictionary[keyof FullComponentDictionary];
export type ComponentDictionary = Partial<{
  [type in ComponentType]: Component;
}>;

export type ComponentProps =
  | PositionComponentProps
  | SpriteComponentProps
  | VelocityComponentProps
  | DirectionComponentProps
  | RenderComponentProps
  | CarriedItemComponentProps
  | RequiresItemComponentProps
  | UsableItemComponentProps
  | InteractionBehaviorComponentProps
  | SpawnContentsComponentProps
  | {};

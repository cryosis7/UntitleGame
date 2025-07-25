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
import type { RenderInSidebarComponent } from './individualComponents/RenderInSidebarComponent';
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
  RenderInSidebar = 'renderInSidebar',
  RequiresItem = 'requiresItem',
  UsableItem = 'usableItem',
  InteractionBehavior = 'interactionBehavior',
  SpawnContents = 'spawnContents',
}

export type FullComponentDictionary = {
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
  [ComponentType.RenderInSidebar]: RenderInSidebarComponent;
  [ComponentType.RequiresItem]: RequiresItemComponent;
  [ComponentType.UsableItem]: UsableItemComponent;
  [ComponentType.InteractionBehavior]: InteractionBehaviorComponent;
  [ComponentType.SpawnContents]: SpawnContentsComponent;
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
  | RequiresItemComponentProps
  | UsableItemComponentProps
  | InteractionBehaviorComponentProps
  | SpawnContentsComponentProps
  | {};

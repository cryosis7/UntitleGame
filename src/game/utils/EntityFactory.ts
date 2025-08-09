import type { Entity } from './ecsUtils';
import type {
  CarriedItemComponentProps,
  Component,
  ComponentDictionary,
  ComponentProps,
  DirectionComponentProps,
  InteractionBehaviorComponentProps,
  PositionComponentProps,
  RequiresItemComponentProps,
  SpawnContentsComponentProps,
  SpriteComponentProps,
  UsableItemComponentProps,
  VelocityComponentProps,
} from '../components';
import {
  CarriedItemComponent,
  ComponentType,
  InteractionBehaviorComponent,
  PositionComponent,
  RequiresItemComponent,
  SpawnContentsComponent,
  SpriteComponent,
  UsableItemComponent,
  VelocityComponent,
} from '../components';

export type ComponentsTemplate = Partial<{
  [type in ComponentType]: ComponentProps;
}>;
export type EntityTemplate = {
  components: ComponentsTemplate;
};

function isValidPositionProps(obj: any): obj is PositionComponentProps {
  return obj && typeof obj.x === 'number' && typeof obj.y === 'number';
}

function isValidSpriteProps(obj: any): obj is SpriteComponentProps {
  return obj && typeof obj.sprite === 'string';
}

function isValidVelocityProps(obj: any): obj is VelocityComponentProps {
  return obj && typeof obj.vx === 'number' && typeof obj.vy === 'number';
}

export function isValidDirectionProps(
  obj: any,
): obj is DirectionComponentProps {
  return (
    obj &&
    typeof obj.direction === 'string' &&
    ['up', 'down', 'left', 'right'].includes(obj.direction)
  );
}

function isValidCarriedItemProps(obj: any): obj is CarriedItemComponent {
  return obj && typeof obj.item === 'string';
}

function isValidRequiresItemProps(obj: any): obj is RequiresItemComponentProps {
  return (
    obj &&
    Array.isArray(obj.requiredCapabilities) &&
    obj.requiredCapabilities.every((cap: any) => typeof cap === 'string') &&
    typeof obj.isActive === 'boolean'
  );
}

function isValidUsableItemProps(obj: any): obj is UsableItemComponentProps {
  return (
    obj &&
    Array.isArray(obj.capabilities) &&
    obj.capabilities.every((cap: any) => typeof cap === 'string') &&
    typeof obj.isConsumable === 'boolean'
  );
}

function isValidInteractionBehaviorProps(
  obj: any,
): obj is InteractionBehaviorComponentProps {
  return (
    obj &&
    typeof obj.behaviorType === 'string' &&
    ['transform', 'remove', 'spawn_contents'].includes(obj.behaviorType) &&
    typeof obj.isRepeatable === 'boolean' &&
    (obj.newSpriteId === undefined || typeof obj.newSpriteId === 'string')
  );
}

function isValidSpawnContentsProps(
  obj: any,
): obj is SpawnContentsComponentProps {
  return (
    obj &&
    Array.isArray(obj.contents) &&
    obj.contents.every((template: any) => isValidEntityTemplate(template)) &&
    obj.spawnOffset &&
    typeof obj.spawnOffset.x === 'number' &&
    typeof obj.spawnOffset.y === 'number'
  );
}

export function isValidComponentProps(
  type: ComponentType,
  props: unknown,
): boolean {
  switch (type) {
    // Explicit validation for the cases where specific props are required
    case ComponentType.Position:
      return isValidPositionProps(props);
    case ComponentType.Sprite:
      return isValidSpriteProps(props);
    case ComponentType.Velocity:
      return isValidVelocityProps(props);
    case ComponentType.Direction:
      return isValidDirectionProps(props);
    case ComponentType.CarriedItem:
      return isValidCarriedItemProps(props);
    case ComponentType.RequiresItem:
      return isValidRequiresItemProps(props);
    case ComponentType.UsableItem:
      return isValidUsableItemProps(props);
    case ComponentType.InteractionBehavior:
      return isValidInteractionBehaviorProps(props);
    case ComponentType.SpawnContents:
      return isValidSpawnContentsProps(props);

    // Simple validation for the cases where no specific props are required
    default:
      return (
        typeof props === 'object' &&
        props !== null &&
        Object.keys(props).length === 0
      );
  }
}

function isValidComponentTemplate(type: string, props: unknown): boolean {
  return (
    Object.values(ComponentType).includes(type as ComponentType) &&
    isValidComponentProps(type as ComponentType, props)
  );
}

function isValidEntityTemplate(obj: any): obj is EntityTemplate {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.components &&
    typeof obj.components === 'object' &&
    Object.entries(obj.components).every(([type, properties]) =>
      isValidComponentTemplate(type, properties),
    )
  );
}

export function createEntity(components: Component[]): Entity {
  const componentDict: ComponentDictionary = {};
  components.forEach((component) => {
    componentDict[component.type] = component;
  });
  return { id: crypto.randomUUID(), components: componentDict };
}

function createComponentsFromTemplate(template: EntityTemplate): Component[] {
  return Object.entries(template.components).map(([type, props]) => {
    switch (type) {
      case ComponentType.Position:
        return new PositionComponent(props as PositionComponentProps);
      case ComponentType.Sprite:
        return new SpriteComponent(props as SpriteComponentProps);
      case ComponentType.Velocity:
        return new VelocityComponent(props as VelocityComponentProps);
      case ComponentType.CarriedItem:
        return new CarriedItemComponent(props as CarriedItemComponentProps);
      case ComponentType.RequiresItem:
        return new RequiresItemComponent(props as RequiresItemComponentProps);
      case ComponentType.UsableItem:
        return new UsableItemComponent(props as UsableItemComponentProps);
      case ComponentType.InteractionBehavior:
        return new InteractionBehaviorComponent(
          props as InteractionBehaviorComponentProps,
        );
      case ComponentType.SpawnContents:
        return new SpawnContentsComponent(props as SpawnContentsComponentProps);
      default:
        if (Object.values(ComponentType).includes(type as ComponentType)) {
          return { type } as Component;
        }
        throw new Error(`Unknown component type: ${type}`);
    }
  });
}

export function createEntityFromJson(json: string): Entity {
  const template = JSON.parse(json);

  if (!isValidEntityTemplate(template)) {
    console.log('Invalid entity template', template);
    throw new Error('Invalid entity template');
  }

  const components = createComponentsFromTemplate(template);
  return createEntity(components);
}

export const createEntityFromTemplate = (template: EntityTemplate): Entity => {
  if (!isValidEntityTemplate(template)) {
    throw new Error(`Invalid entity template:\n${JSON.stringify(template)}`);
  }

  const components = createComponentsFromTemplate(template);
  return createEntity(components);
};

export const createEntitiesFromTemplates = (
  ...templates: EntityTemplate[]
): Entity[] => templates.map(createEntityFromTemplate);

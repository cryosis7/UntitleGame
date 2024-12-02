import type { Entity } from './ecsUtils';
import type {
  Component,
  PositionComponentTemplate,
  SpriteComponentTemplate,
  VelocityComponentTemplate,
} from '../components/Components';
import {
  ComponentType,
  MovableComponent,
  PickableComponent,
  PlayerComponent,
  PositionComponent,
  SpriteComponent,
  VelocityComponent,
} from '../components/Components';

type ComponentTemplate =
  | PositionComponentTemplate
  | SpriteComponentTemplate
  | VelocityComponentTemplate
  | {};

export type EntityTemplate = {
  name: string;
  components: { [type: string]: ComponentTemplate };
};

function isValidPositionTemplate(obj: any): obj is PositionComponentTemplate {
  return obj && typeof obj.x === 'number' && typeof obj.y === 'number';
}

function isValidSpriteTemplate(obj: any): obj is SpriteComponentTemplate {
  return obj && typeof obj.sprite === 'string';
}

function isValidVelocityTemplate(obj: any): obj is VelocityComponentTemplate {
  return obj && typeof obj.vx === 'number' && typeof obj.vy === 'number';
}

function isValidComponentTemplate(type: string, obj: any): boolean {
  switch (type) {
    case ComponentType.Position:
      return isValidPositionTemplate(obj);
    case ComponentType.Sprite:
      return isValidSpriteTemplate(obj);
    case ComponentType.Velocity:
      return isValidVelocityTemplate(obj);
    case ComponentType.Player:
    case ComponentType.Movable:
    case ComponentType.Pickable:
      return true;
    default:
      return false;
  }
}

function isValidEntityTemplate(obj: any): obj is EntityTemplate {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    obj.components &&
    typeof obj.components === 'object' &&
    Object.entries(obj.components).every(([type, properties]) =>
      isValidComponentTemplate(type, properties),
    )
  );
}

export function createEntity(components: Component[]): Entity {
  const componentDict: { [key: string]: Component } = {};
  components.forEach((component) => {
    componentDict[component.type] = component;
  });
  return { id: crypto.randomUUID(), components: componentDict };
}

function createComponentsFromTemplate(template: EntityTemplate): Component[] {
  return Object.entries(template.components).map(([type, properties]) => {
    switch (type) {
      case ComponentType.Position:
        return new PositionComponent(properties as PositionComponentTemplate);
      case ComponentType.Sprite:
        return new SpriteComponent({
          sprite: (properties as SpriteComponentTemplate).sprite,
        });
      case ComponentType.Player:
        return new PlayerComponent();
      case ComponentType.Movable:
        return new MovableComponent();
      case ComponentType.Velocity:
        return new VelocityComponent(properties as VelocityComponentTemplate);
      case ComponentType.Pickable:
        return new PickableComponent();
      default:
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

export function createEntityFromObject(template: EntityTemplate): Entity {
  if (!isValidEntityTemplate(template)) {
    console.log('Invalid entity template', template);
    throw new Error('Invalid entity template');
  }

  const components = createComponentsFromTemplate(template);
  return createEntity(components);
}

export const createEntitiesFromObjects = (
  ...templates: EntityTemplate[]
): Entity[] => templates.map(createEntityFromObject);

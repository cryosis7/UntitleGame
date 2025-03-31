import type { Entity } from './ecsUtils';
import type {
  Component,
  ComponentDictionary,
  ComponentProps,
} from '../components/ComponentTypes';
import { ComponentType } from '../components/ComponentTypes';
import type { PositionComponentProps } from '../components/individualComponents/PositionComponent';
import { PositionComponent } from '../components/individualComponents/PositionComponent';
import type { SpriteComponentProps } from '../components/individualComponents/SpriteComponent';
import { SpriteComponent } from '../components/individualComponents/SpriteComponent';
import type { VelocityComponentProps } from '../components/individualComponents/VelocityComponent';
import { VelocityComponent } from '../components/individualComponents/VelocityComponent';
import type { CarriedItemComponentProps } from '../components/individualComponents/CarriedItemComponent';
import { CarriedItemComponent } from '../components/individualComponents/CarriedItemComponent';

type ComponentsTemplate = Partial<{ [type in ComponentType]: ComponentProps }>;
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

function isValidCarriedItemProps(obj: any): obj is CarriedItemComponent {
  return obj && typeof obj.item === 'string';
}

function isValidComponentProps(type: ComponentType, props: unknown): boolean {
  switch (type) {
    // Explicit validation for the cases where specific props are required
    case ComponentType.Position:
      return isValidPositionProps(props);
    case ComponentType.Sprite:
      return isValidSpriteProps(props);
    case ComponentType.Velocity:
      return isValidVelocityProps(props);
    case ComponentType.CarriedItem:
      return isValidCarriedItemProps(props);

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

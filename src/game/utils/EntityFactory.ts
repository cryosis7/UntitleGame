import type { Entity } from './ecsUtils';
import type { Component} from '../components/Components';
import { ComponentType } from '../components/Components';
import type { ComponentTemplate } from '../templates/ComponentTemplate';

export type EntityTemplate = {
  name: string;
  components: { [type: string]: ComponentTemplate };
};

export function createEntity(components: Component[]): Entity {
  const componentDict: { [key: string]: Component } = {};
  components.forEach((component) => {
    componentDict[component.type] = component;
  });
  return { id: crypto.randomUUID(), components: componentDict };
}

export function createEntityFromTemplate(template: EntityTemplate): Entity {
  const components: Component[] = [];
  for (const [type, componentTemplate] of Object.entries(template.components)) {
    components.push({
      type: ComponentType[type as keyof typeof ComponentType],
      ...componentTemplate,
    });
  }
  return createEntity(components);
}

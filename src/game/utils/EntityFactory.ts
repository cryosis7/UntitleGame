import type { Entity } from './ecsUtils';
import type { Component } from '../components/Components';

export type EntityTemplate = {
  name: string;
  components: { [type: string]: Component };
};

export function createEntity(components: Component[]): Entity {
  const componentDict: { [key: string]: Component } = {};
  components.forEach((component) => {
    componentDict[component.type] = component;
  });
  return { id: crypto.randomUUID(), components: componentDict };
}

export function createEntityFromTemplate(template: EntityTemplate): Entity {
  return { id: crypto.randomUUID(), components: template.components };
}

import type { Component } from '../models/ECS/Components';
import type { Entity } from '../models/ECS/ECS';

export const getComponent = <T extends Component>(
  entity: Entity,
  type: string,
): T | undefined => {
  return entity.components.find((component) => component.type === type) as T;
};

export const hasComponent = (entity: Entity, type: string): boolean => {
  return entity.components.some((component) => component.type === type);
};

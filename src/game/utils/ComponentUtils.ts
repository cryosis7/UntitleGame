import { store } from '../../App';
import { ComponentType } from '../components/Components';
import type { Component } from '../components/Components';
import { entitiesAtom } from '../GameSystem';
import type { Entity } from './ecsUtils';

/**
 * Sets a component for a given entity. If the component already exists, it will be replaced.
 *
 * @template T - The type of the component.
 * @param {Entity} entity - The entity to which the component will be added.
 * @param {T} component - The component to be added to the entity.
 */
export const setComponent = <T extends Component>(
  entity: Entity,
  component: T,
) => {
  store.set(entitiesAtom, (entities) => {
    return entities.map((e) => {
      if (e.id === entity.id) {
        return {
          ...e,
          components: {
            ...e.components,
            [component.type]: component,
          },
        };
      }
      return e;
    });
  });
};

/**
 * Sets multiple components for a given entity. If a component already exists, it will be replaced.
 *
 * @param entity
 * @param components
 */
export const setComponents = (entity: Entity, ...components: Component[]) => {
  store.set(entitiesAtom, (entities) => {
    return entities.map((e) => {
      if (e.id === entity.id) {
        return {
          ...e,
          components: {
            ...e.components,
            ...components.reduce(
              (accumulation, component) => ({
                ...accumulation,
                [component.type]: component,
              }),
              {},
            ),
          },
        };
      }
      return e;
    });
  });
};

export const getComponent = <T extends Component>(
  entity: Entity,
  type: ComponentType,
): T | undefined => {
  return entity.components[type] as T;
};

/**
 * Checks if an entity has a specified component.
 * @param entity
 * @param types - The type of the component.
 */
export const hasComponent = (
  entity: Entity,
  ...types: ComponentType[]
): boolean => {
  return types.reduce(
    (accumulation, type) =>
      accumulation && entity.components[type] !== undefined,
    true,
  );
};

/**
 * Checks if an entity has all the specified components.
 * @param entity
 * @param types
 */
export const hasAllComponents = (
  entity: Entity,
  ...types: ComponentType[]
): boolean => {
  return types.reduce(
    (accumulation, type) => accumulation && hasComponent(entity, type),
    true,
  );
};

/**
 * Checks if an entity has any of the specified components.
 * @param entity
 * @param types
 */
export const hasAnyComponent = (
  entity: Entity,
  ...types: ComponentType[]
): boolean => {
  return types.reduce(
    (accumulation, type) => accumulation || hasComponent(entity, type),
    false,
  );
};

/**
 * Removes a component(s) from an entity.
 * @param entity
 * @param components
 */
export const removeComponent = (
  entity: Entity,
  ...components: ComponentType[]
) => {
  store.set(entitiesAtom, (entities) => {
    return entities.map((e) => {
      if (e.id === entity.id) {
        const existingComponents = { ...e.components };
        components.forEach((c) => {
          delete existingComponents[c];
        });
        return {
          ...e,
          components: existingComponents,
        };
      }
      return e;
    });
  });
};

/**
 * Removes the components needed to place the item somewhere in the map.
 * @param entity
 */
export const removeMapComponents = (entity: Entity) => {
  removeComponent(entity, ComponentType.Position, ComponentType.Velocity);
};

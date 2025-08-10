import { entitiesAtom, store } from '../utils/Atoms';
import type { Entity } from '../utils/ecsUtils';
import type { Component, FullComponentDictionary } from './ComponentTypes';
import { ComponentType } from './ComponentTypes';

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

export const getComponentIfExists = <T extends ComponentType>(
  entity: Entity,
  type: T,
): FullComponentDictionary[T] | undefined => {
  return entity.components[type] as FullComponentDictionary[T];
};

export const getComponentAbsolute = <T extends ComponentType>(
  entity: Entity,
  type: T,
): FullComponentDictionary[T] => {
  if (!entity.components[type]) {
    console.dir(entity);
    throw new Error(`Component ${type} not found for entity: ${entity.id}`);
  }
  return entity.components[type] as FullComponentDictionary[T];
};

/**
 * Checks if an entity has a specified component.
 * @param entity
 * @param type - The type of the component.
 */
export const hasComponent = (entity: Entity, type: ComponentType): boolean => {
  return entity.components[type] !== undefined;
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
 * @param componentTypes
 */
export const removeComponent = (
  entity: Entity,
  ...componentTypes: ComponentType[]
) => {
  store.set(entitiesAtom, (entities) => {
    return entities.map((e) => {
      if (e.id === entity.id) {
        const existingComponents = { ...e.components };
        componentTypes.forEach((c) => {
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

export const removeComponentFromAllEntities = (type: ComponentType) => {
  const entities = store.get(entitiesAtom);
  entities.forEach((entity) => delete entity.components[type]);
};

/**
 * Removes the components needed to place the item somewhere in the map.
 * @param entity
 */
export const removeMapComponents = (entity: Entity) => {
  removeComponent(entity, ComponentType.Position, ComponentType.Velocity);
};

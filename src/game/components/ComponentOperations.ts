import { store } from '../../App';
import type { Entity } from '../utils/ecsUtils';
import { entitiesAtom } from '../atoms/Atoms';
import type { Component, ComponentType, FullComponentDictionary } from './ComponentTypes';

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
    throw new Error(`Component ${type} not found for entity`);
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
 * Removes a component from every entity.
 */
export const removeComponentFromAllEntities = (component: ComponentType) => {
  store.set(entitiesAtom, (entities) => {
    return entities.map((e) => {
      if (e.components[component]) {
        const { [component]: _, ...rest } = e.components;
        return {
          ...e,
          components: rest,
        };
      }
      return e;
    });
  });
};

/**
 * Toggles a component for a given entity. If the component exists, it will be removed.
 * If the component does not exist, it will be added.
 *
 * @template T - The type of the component.
 * @param {Entity} entity - The entity for which the component will be toggled.
 * @param {T} component - The component to toggle.
 */
export const toggleComponent = <T extends Component>(
  entity: Entity,
  component: T,
): void => {
  store.set(entitiesAtom, (entities) => {
    return entities.map((e) => {
      if (e.id === entity.id) {
        if (e.components[component.type]) {
          const { [component.type]: _, ...rest } = e.components;
          return {
            ...e,
            components: rest,
          };
        }
        // If the component doesn't exist, add it
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

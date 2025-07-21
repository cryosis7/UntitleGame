import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Entity } from '../../utils/ecsUtils';
import { ComponentType } from '../ComponentTypes';
import { RequiresItemComponent } from '../individualComponents/RequiresItemComponent';
import { UsableItemComponent } from '../individualComponents/UsableItemComponent';
import { InteractionBehaviorComponent } from '../individualComponents/InteractionBehaviorComponent';
import { SpawnContentsComponent } from '../individualComponents/SpawnContentsComponent';
import { InteractionBehaviorType } from '../individualComponents/InteractionBehaviorType';

// Mock the store and import ComponentOperations afterward
const mockStore = {
  set: vi.fn(),
  get: vi.fn(),
};

vi.mock('../../../App', () => ({
  store: mockStore,
}));

vi.mock('../../utils/Atoms', () => ({
  entitiesAtom: 'entitiesAtom',
}));

// Import ComponentOperations after mocking
const {
  setComponent,
  setComponents,
  getComponentIfExists,
  getComponentAbsolute,
  hasComponent,
  hasAllComponents,
  hasAnyComponent,
  removeComponent,
} = await import('../ComponentOperations');

describe('ComponentOperations - New Interaction Components', () => {
  let testEntity: Entity;
  let testEntities: Entity[];

  beforeEach(() => {
    vi.clearAllMocks();

    testEntity = {
      id: 'test-entity-1',
      components: {},
    };

    testEntities = [testEntity];

    // Setup store mock to return test entities
    mockStore.get.mockReturnValue(testEntities);

    // Setup store set mock to simulate entity updates
    mockStore.set.mockImplementation((atom: any, updateFn: any) => {
      const result = updateFn(testEntities);
      testEntities.splice(0, testEntities.length, ...result);
      return result;
    });
  });

  describe('setComponent with new components', () => {
    it('should set RequiresItemComponent correctly', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['unlock', 'key'],
        isActive: true,
      });

      setComponent(testEntity, component);

      expect(mockStore.set).toHaveBeenCalledWith(
        'entitiesAtom',
        expect.any(Function),
      );

      // Verify the update function behavior
      const updateFunction = mockStore.set.mock.calls[0][1];
      const updatedEntities = updateFunction([testEntity]);

      expect(updatedEntities[0].components[ComponentType.RequiresItem]).toEqual(
        component,
      );
    });

    it('should set UsableItemComponent correctly', () => {
      const component = new UsableItemComponent({
        capabilities: ['unlock'],
        isConsumable: true,
      });

      setComponent(testEntity, component);

      expect(mockStore.set).toHaveBeenCalledWith(
        'entitiesAtom',
        expect.any(Function),
      );

      const updateFunction = mockStore.set.mock.calls[0][1];
      const updatedEntities = updateFunction([testEntity]);

      expect(updatedEntities[0].components[ComponentType.UsableItem]).toEqual(
        component,
      );
    });

    it('should set InteractionBehaviorComponent correctly', () => {
      const component = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.TRANSFORM,
        newSpriteId: 'open_door',
        isRepeatable: false,
      });

      setComponent(testEntity, component);

      expect(mockStore.set).toHaveBeenCalledWith(
        'entitiesAtom',
        expect.any(Function),
      );

      const updateFunction = mockStore.set.mock.calls[0][1];
      const updatedEntities = updateFunction([testEntity]);

      expect(
        updatedEntities[0].components[ComponentType.InteractionBehavior],
      ).toEqual(component);
    });

    it('should set SpawnContentsComponent correctly', () => {
      const component = new SpawnContentsComponent({
        contents: [
          {
            components: {
              [ComponentType.Sprite]: { sprite: 'treasure' },
            },
          },
        ],
        spawnOffset: { x: 1, y: 0 },
      });

      setComponent(testEntity, component);

      expect(mockStore.set).toHaveBeenCalledWith(
        'entitiesAtom',
        expect.any(Function),
      );

      const updateFunction = mockStore.set.mock.calls[0][1];
      const updatedEntities = updateFunction([testEntity]);

      expect(
        updatedEntities[0].components[ComponentType.SpawnContents],
      ).toEqual(component);
    });
  });

  describe('setComponents with multiple new components', () => {
    it('should set multiple new components at once', () => {
      const requiresItem = new RequiresItemComponent({
        requiredCapabilities: ['unlock'],
        isActive: true,
      });

      const interactionBehavior = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.REMOVE,
        isRepeatable: false,
      });

      setComponents(testEntity, requiresItem, interactionBehavior);

      expect(mockStore.set).toHaveBeenCalledWith(
        'entitiesAtom',
        expect.any(Function),
      );

      const updateFunction = mockStore.set.mock.calls[0][1];
      const updatedEntities = updateFunction([testEntity]);

      expect(updatedEntities[0].components[ComponentType.RequiresItem]).toEqual(
        requiresItem,
      );
      expect(
        updatedEntities[0].components[ComponentType.InteractionBehavior],
      ).toEqual(interactionBehavior);
    });
  });

  describe('getComponentIfExists with new components', () => {
    beforeEach(() => {
      // Set up entity with all new components
      testEntity.components[ComponentType.RequiresItem] =
        new RequiresItemComponent({
          requiredCapabilities: ['unlock'],
          isActive: true,
        });

      testEntity.components[ComponentType.UsableItem] = new UsableItemComponent(
        {
          capabilities: ['unlock'],
          isConsumable: false,
        },
      );

      testEntity.components[ComponentType.InteractionBehavior] =
        new InteractionBehaviorComponent({
          behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
          isRepeatable: true,
        });

      testEntity.components[ComponentType.SpawnContents] =
        new SpawnContentsComponent({
          contents: [],
          spawnOffset: { x: 0, y: 0 },
        });
    });

    it('should get RequiresItemComponent if it exists', () => {
      const component = getComponentIfExists(
        testEntity,
        ComponentType.RequiresItem,
      );

      expect(component).toBeDefined();
      expect(component!.type).toBe(ComponentType.RequiresItem);
      expect(component!.requiredCapabilities).toEqual(['unlock']);
      expect(component!.isActive).toBe(true);
    });

    it('should get UsableItemComponent if it exists', () => {
      const component = getComponentIfExists(
        testEntity,
        ComponentType.UsableItem,
      );

      expect(component).toBeDefined();
      expect(component!.type).toBe(ComponentType.UsableItem);
      expect(component!.capabilities).toEqual(['unlock']);
      expect(component!.isConsumable).toBe(false);
    });

    it('should get InteractionBehaviorComponent if it exists', () => {
      const component = getComponentIfExists(
        testEntity,
        ComponentType.InteractionBehavior,
      );

      expect(component).toBeDefined();
      expect(component!.type).toBe(ComponentType.InteractionBehavior);
      expect(component!.behaviorType).toBe(
        InteractionBehaviorType.SPAWN_CONTENTS,
      );
      expect(component!.isRepeatable).toBe(true);
    });

    it('should get SpawnContentsComponent if it exists', () => {
      const component = getComponentIfExists(
        testEntity,
        ComponentType.SpawnContents,
      );

      expect(component).toBeDefined();
      expect(component!.type).toBe(ComponentType.SpawnContents);
      expect(component!.contents).toEqual([]);
      expect(component!.spawnOffset).toEqual({ x: 0, y: 0 });
    });

    it('should return undefined for non-existent new components', () => {
      const entityWithoutComponents: Entity = {
        id: 'empty-entity',
        components: {},
      };

      expect(
        getComponentIfExists(
          entityWithoutComponents,
          ComponentType.RequiresItem,
        ),
      ).toBeUndefined();
      expect(
        getComponentIfExists(entityWithoutComponents, ComponentType.UsableItem),
      ).toBeUndefined();
      expect(
        getComponentIfExists(
          entityWithoutComponents,
          ComponentType.InteractionBehavior,
        ),
      ).toBeUndefined();
      expect(
        getComponentIfExists(
          entityWithoutComponents,
          ComponentType.SpawnContents,
        ),
      ).toBeUndefined();
    });
  });

  describe('getComponentAbsolute with new components', () => {
    beforeEach(() => {
      testEntity.components[ComponentType.RequiresItem] =
        new RequiresItemComponent({
          requiredCapabilities: ['magic'],
          isActive: false,
        });
    });

    it('should get component that exists', () => {
      const component = getComponentAbsolute(
        testEntity,
        ComponentType.RequiresItem,
      );

      expect(component).toBeDefined();
      expect(component.requiredCapabilities).toEqual(['magic']);
      expect(component.isActive).toBe(false);
    });

    it('should throw error for non-existent component', () => {
      const entityWithoutComponents: Entity = {
        id: 'empty-entity',
        components: {},
      };

      expect(() => {
        getComponentAbsolute(entityWithoutComponents, ComponentType.UsableItem);
      }).toThrow('Component usableItem not found for entity');
    });
  });

  describe('hasComponent with new components', () => {
    beforeEach(() => {
      testEntity.components[ComponentType.InteractionBehavior] =
        new InteractionBehaviorComponent({
          behaviorType: InteractionBehaviorType.TRANSFORM,
          newSpriteId: 'opened',
          isRepeatable: false,
        });
    });

    it('should return true for existing new component', () => {
      expect(hasComponent(testEntity, ComponentType.InteractionBehavior)).toBe(
        true,
      );
    });

    it('should return false for non-existing new component', () => {
      expect(hasComponent(testEntity, ComponentType.RequiresItem)).toBe(false);
      expect(hasComponent(testEntity, ComponentType.UsableItem)).toBe(false);
      expect(hasComponent(testEntity, ComponentType.SpawnContents)).toBe(false);
    });
  });

  describe('hasAllComponents with new components', () => {
    beforeEach(() => {
      testEntity.components[ComponentType.RequiresItem] =
        new RequiresItemComponent({
          requiredCapabilities: ['key'],
          isActive: true,
        });

      testEntity.components[ComponentType.InteractionBehavior] =
        new InteractionBehaviorComponent({
          behaviorType: InteractionBehaviorType.REMOVE,
          isRepeatable: false,
        });
    });

    it('should return true when entity has all required new components', () => {
      expect(
        hasAllComponents(
          testEntity,
          ComponentType.RequiresItem,
          ComponentType.InteractionBehavior,
        ),
      ).toBe(true);
    });

    it('should return false when entity is missing some new components', () => {
      expect(
        hasAllComponents(
          testEntity,
          ComponentType.RequiresItem,
          ComponentType.InteractionBehavior,
          ComponentType.SpawnContents,
        ),
      ).toBe(false);
    });

    it('should return true for single new component check', () => {
      expect(hasAllComponents(testEntity, ComponentType.RequiresItem)).toBe(
        true,
      );
    });
  });

  describe('hasAnyComponent with new components', () => {
    beforeEach(() => {
      testEntity.components[ComponentType.UsableItem] = new UsableItemComponent(
        {
          capabilities: ['tool'],
          isConsumable: false,
        },
      );
    });

    it('should return true when entity has any of the new components', () => {
      expect(
        hasAnyComponent(
          testEntity,
          ComponentType.RequiresItem,
          ComponentType.UsableItem,
          ComponentType.InteractionBehavior,
        ),
      ).toBe(true);
    });

    it('should return false when entity has none of the new components', () => {
      expect(
        hasAnyComponent(
          testEntity,
          ComponentType.RequiresItem,
          ComponentType.InteractionBehavior,
          ComponentType.SpawnContents,
        ),
      ).toBe(false);
    });
  });

  describe('removeComponent with new components', () => {
    beforeEach(() => {
      testEntity.components[ComponentType.RequiresItem] =
        new RequiresItemComponent({
          requiredCapabilities: ['unlock'],
          isActive: true,
        });

      testEntity.components[ComponentType.UsableItem] = new UsableItemComponent(
        {
          capabilities: ['unlock'],
          isConsumable: true,
        },
      );

      testEntity.components[ComponentType.InteractionBehavior] =
        new InteractionBehaviorComponent({
          behaviorType: InteractionBehaviorType.TRANSFORM,
          newSpriteId: 'open',
          isRepeatable: false,
        });
    });

    it('should remove single new component', () => {
      removeComponent(testEntity, ComponentType.RequiresItem);

      expect(mockStore.set).toHaveBeenCalledWith(
        'entitiesAtom',
        expect.any(Function),
      );

      const updateFunction = mockStore.set.mock.calls[0][1];
      const updatedEntities = updateFunction([testEntity]);

      expect(
        updatedEntities[0].components[ComponentType.RequiresItem],
      ).toBeUndefined();
      expect(
        updatedEntities[0].components[ComponentType.UsableItem],
      ).toBeDefined();
      expect(
        updatedEntities[0].components[ComponentType.InteractionBehavior],
      ).toBeDefined();
    });

    it('should remove multiple new components', () => {
      removeComponent(
        testEntity,
        ComponentType.RequiresItem,
        ComponentType.InteractionBehavior,
      );

      expect(mockStore.set).toHaveBeenCalledWith(
        'entitiesAtom',
        expect.any(Function),
      );

      const updateFunction = mockStore.set.mock.calls[0][1];
      const updatedEntities = updateFunction([testEntity]);

      expect(
        updatedEntities[0].components[ComponentType.RequiresItem],
      ).toBeUndefined();
      expect(
        updatedEntities[0].components[ComponentType.InteractionBehavior],
      ).toBeUndefined();
      expect(
        updatedEntities[0].components[ComponentType.UsableItem],
      ).toBeDefined();
    });
  });

  describe('TypeScript type safety', () => {
    it('should maintain proper typing for new components', () => {
      testEntity.components[ComponentType.RequiresItem] =
        new RequiresItemComponent({
          requiredCapabilities: ['test'],
          isActive: true,
        });

      const component = getComponentIfExists(
        testEntity,
        ComponentType.RequiresItem,
      );

      // TypeScript should know this is RequiresItemComponent | undefined
      if (component) {
        // These properties should be available without type assertions
        expect(component.requiredCapabilities).toBeDefined();
        expect(component.isActive).toBeDefined();
        expect(typeof component.isActive).toBe('boolean');
      }
    });
  });
});

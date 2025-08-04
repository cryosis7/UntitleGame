import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemInteractionSystem } from './ItemInteractionSystem';
import type {
  ComponentsTemplate,
  EntityTemplate,
} from '../utils/EntityFactory';
import { createEntity } from '../utils/EntityFactory';
import type { Component } from '../components/ComponentTypes';
import { ComponentType } from '../components/ComponentTypes';
import { removeComponent } from '../components/ComponentOperations';
import type { Entity } from '../utils/ecsUtils';
import { entitiesAtom, store } from '../utils/Atoms';
import {
  InteractionBehaviorComponent,
  InteractionBehaviorType,
  type PositionComponentProps,
  PositionComponent,
  InteractingComponent,
  CarriedItemComponent,
  type Direction,
  type DirectionComponentProps,
  DirectionComponent,
  type UsableItemComponentProps,
  UsableItemComponent,
  RequiresItemComponent,
  SpawnContentsComponent,
} from '../components';
import { GameMap, type Position } from '../map/GameMap';
import type { UpdateArgs } from './Systems';
import { getEntity } from '../utils/EntityUtils';

describe('ItemInteractionSystem', () => {
  let system: ItemInteractionSystem;
  let entities: Entity[];
  const map = new GameMap(); // Not needed for this test, but required by the updateArgs

  beforeEach(() => {
    system = new ItemInteractionSystem();
    entities = [];

    store.set(entitiesAtom, entities);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test fixtures for reusable entity configurations
  const createInteractingEntityWithItem = ({
    position = { x: 0, y: 0 },
    carriedItemId = 'carried-item-id',
    direction,
  }: {
    position?: PositionComponentProps;
    carriedItemId?: string;
    direction?: DirectionComponentProps;
  } = {}) => {
    const components: Component[] = [
      new PositionComponent(position),
      new InteractingComponent(),
      new CarriedItemComponent({ item: carriedItemId }),
    ];

    if (direction) {
      components.push(new DirectionComponent(direction));
    }

    return createEntity(components);
  };

  const createUsableItem = ({
    capabilities,
    isConsumable = true,
  }: UsableItemComponentProps) => {
    return createEntity([
      new UsableItemComponent({ capabilities, isConsumable }),
    ]);
  };

  const createTargetEntity = (
    position: PositionComponentProps,
    requiredCapabilities: string[],
    behaviorType: InteractionBehaviorType,
    options: {
      interactionDirections?: Direction[];
      newSpriteId?: string;
      spawnContents?: ComponentsTemplate[];
      spawnOffset?: Position;
    } = {},
  ) => {
    const components: Component[] = [
      new PositionComponent(position),
      new RequiresItemComponent({
        requiredCapabilities,
        interactionDirections: options.interactionDirections || [
          'up',
          'down',
          'left',
          'right',
        ],
      }),
      new InteractionBehaviorComponent({
        behaviorType,
        newSpriteId: options.newSpriteId,
      }),
    ];

    if (
      behaviorType === InteractionBehaviorType.SPAWN_CONTENTS &&
      options.spawnContents
    ) {
      const entityTemplates: EntityTemplate[] = options.spawnContents.map(
        (content) => ({
          components: content,
        }),
      );

      components.push(
        new SpawnContentsComponent({
          contents: entityTemplates,
          spawnOffset: options.spawnOffset,
        }),
      );
    }

    return createEntity(components);
  };

  const getUpdateArgs = (): UpdateArgs => {
    const entities = store.get(entitiesAtom);
    return {
      entities,
      map,
    };
  };

  describe('Main Update Loop - Path 1', () => {
    describe('Path 1.1: No Interacting Entities', () => {
      it.each([
        { componentType: ComponentType.Interacting },
        { componentType: ComponentType.CarriedItem },
        { componentType: ComponentType.Position },
      ])(
        'should do nothing when entities lack %s component',
        ({ componentType }) => {
          const key = createUsableItem({ capabilities: ['key'] });
          const entityWithoutComponent = createEntity([
            new PositionComponent({ x: 5, y: 5 }),
            new InteractingComponent(),
            new CarriedItemComponent({ item: key.id }),
          ]);
          removeComponent(entityWithoutComponent, componentType);
          store.set(entitiesAtom, [entityWithoutComponent, key]);

          expect(() => system.update(getUpdateArgs())).not.toThrow();

          expect(store.get(entitiesAtom)).toEqual([
            entityWithoutComponent,
            key,
          ]);
        },
      );
    });

    describe('Path 1.2: Carried Item Entity Not Found', () => {
      it('should log error and continue when carried item entity does not exist', () => {
        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});

        const interactingEntity1 = createInteractingEntityWithItem({
          carriedItemId: 'non-existent-item-id',
        });
        const interactingEntity2 = createInteractingEntityWithItem({
          carriedItemId: 'another-non-existent-item-id',
        });

        store.set(entitiesAtom, [interactingEntity1, interactingEntity2]);

        system.update(getUpdateArgs());

        expect(consoleSpy).toHaveBeenNthCalledWith(
          1,
          'Carried item entity with ID non-existent-item-id not found',
        );
        expect(consoleSpy).toHaveBeenNthCalledWith(
          2,
          'Carried item entity with ID another-non-existent-item-id not found',
        );

        expect(store.get(entitiesAtom)).toEqual([
          interactingEntity1,
          interactingEntity2,
        ]);
      });
    });

    describe('Path 1.3: Carried Item Not Usable', () => {
      it('should skip processing when carried item lacks UsableItem component', () => {
        const nonUsableItem = createEntity([]);

        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 5 },
          carriedItemId: nonUsableItem.id,
        });

        const targetEntity = createTargetEntity(
          { x: 5, y: 4 },
          ['key'],
          InteractionBehaviorType.REMOVE,
        );

        store.set(entitiesAtom, [
          interactingEntity,
          nonUsableItem,
          targetEntity,
        ]);

        system.update(getUpdateArgs());

        expect(store.get(entitiesAtom)).toEqual([
          interactingEntity,
          nonUsableItem,
          targetEntity,
        ]);
      });

      it('should skip unusable item but still process other entities', () => {
        const nonUsableItem = createEntity([]);
        const interactingEntityWithUnusableItem =
          createInteractingEntityWithItem({
            position: { x: 5, y: 5 },
            carriedItemId: nonUsableItem.id,
          });

        const usableItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntityWithUsableItem = createInteractingEntityWithItem(
          {
            position: { x: 5, y: 5 },
            carriedItemId: usableItem.id,
          },
        );

        const targetEntity = createTargetEntity(
          { x: 5, y: 4 },
          ['key'],
          InteractionBehaviorType.REMOVE,
        );

        store.set(entitiesAtom, [
          nonUsableItem,
          interactingEntityWithUnusableItem,
          usableItem,
          interactingEntityWithUsableItem,
          targetEntity,
        ]);

        system.update(getUpdateArgs());

        const updatedEntities = store.get(entitiesAtom);
        expect(updatedEntities).toContain(nonUsableItem);
        expect(updatedEntities).toContain(interactingEntityWithUnusableItem);
        expect(updatedEntities).not.toContainEqual(usableItem);

        const expectedInteractingEntity: Entity = {
          ...interactingEntityWithUsableItem,
        };
        delete expectedInteractingEntity.components[ComponentType.CarriedItem];
        expect(updatedEntities).toContainEqual(expectedInteractingEntity);
        expect(updatedEntities).not.toContainEqual(targetEntity);

        expect(updatedEntities).toHaveLength(3);
      });
    });

    describe('Path 1.4: No Compatible Entities', () => {
      it('should not interact when item capabilities do not match entity requirements', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 5 },
          carriedItemId: keyItem.id,
        });

        const lockRequiringTool = createTargetEntity(
          { x: 5, y: 4 },
          ['tool'],
          InteractionBehaviorType.REMOVE,
        );

        store.set(entitiesAtom, [
          interactingEntity,
          keyItem,
          lockRequiringTool,
        ]);

        system.update(getUpdateArgs());

        expect(store.get(entitiesAtom)).toEqual([
          interactingEntity,
          keyItem,
          lockRequiringTool,
        ]);
      });
    });

    describe('Path 1.5: Position/Direction Validation Failure', () => {
      it('should do nothing when entity is in wrong position', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 10, y: 10 },
          carriedItemId: keyItem.id,
        });

        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.REMOVE,
        );

        store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

        system.update(getUpdateArgs());

        expect(store.get(entitiesAtom)).toEqual([
          interactingEntity,
          keyItem,
          targetEntity,
        ]);
      });

      it('should do nothing when entity is facing wrong direction', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 }, // South of target
          carriedItemId: keyItem.id,
          direction: { direction: 'down' }, // Facing away from target
        });

        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.REMOVE,
          { interactionDirections: ['down'] }, // Allows interaction from south
        );

        store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

        system.update(getUpdateArgs());

        expect(store.get(entitiesAtom)).toEqual([
          interactingEntity,
          keyItem,
          targetEntity,
        ]);
      });
    });

    describe('Path 1.6: Successful Interactions', () => {
      describe('Direction Matching Requirements', () => {
        it.each`
          condition                      | directions
          ${'accepts all directions'}    | ${['up', 'down', 'left', 'right']}
          ${'has direction requirement'} | ${['down']}
        `(
          'should process interaction and consume item when target entity $condition',
          ({ directions }) => {
            const keyItem = createUsableItem({
              capabilities: ['key'],
              isConsumable: true,
            });
            const interactingEntity = createInteractingEntityWithItem({
              position: { x: 5, y: 6 }, // South of target
              carriedItemId: keyItem.id,
              direction: { direction: 'up' }, // Facing target
            });

            const targetEntity = createTargetEntity(
              { x: 5, y: 5 },
              ['key'],
              InteractionBehaviorType.REMOVE,
              { interactionDirections: directions },
            );

            store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

            system.update(getUpdateArgs());

            // Target and Key entity should be removed
            expect(getEntity(targetEntity.id)).toBeUndefined();
            expect(getEntity(keyItem.id)).toBeUndefined();

            // Interacting entity should lose CarriedItem component
            const updatedInteractingEntity = getEntity(interactingEntity.id);
            expect(updatedInteractingEntity).toBeDefined();
            expect(updatedInteractingEntity!.components).not.toHaveProperty(
              ComponentType.CarriedItem,
            );
          },
        );

        it('should process interactions when there is no direction component', () => {
          const keyItem = createUsableItem({ capabilities: ['key'] });
          const interactingEntity = createInteractingEntityWithItem({
            position: { x: 5, y: 6 }, // South of target
            carriedItemId: keyItem.id,
          });

          const targetEntity = createTargetEntity(
            { x: 5, y: 5 },
            ['key'],
            InteractionBehaviorType.REMOVE,
            { interactionDirections: ['down'] },
          );

          store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

          system.update(getUpdateArgs());

          expect(getEntity(targetEntity.id)).toBeUndefined();
          expect(getEntity(keyItem.id)).toBeUndefined();

          const updatedInteractingEntity = getEntity(interactingEntity.id);
          expect(updatedInteractingEntity).toBeDefined();
          expect(updatedInteractingEntity!.components).not.toHaveProperty(
            ComponentType.CarriedItem,
          );
        });
      });

      describe('Consumability Testing', () => {
        it.each`
          isConsumable | description                 | consumable
          ${true}      | ${'and consume item'}       | ${'consumable'}
          ${false}     | ${'without consuming item'} | ${'not consumable'}
        `(
          'should process interaction $description when carried item is $consumable',
          ({ isConsumable }) => {
            const keyItem = createUsableItem({
              capabilities: ['key'],
              isConsumable,
            });
            const interactingEntity = createInteractingEntityWithItem({
              position: { x: 5, y: 6 }, // South of target
              carriedItemId: keyItem.id,
            });

            const targetEntity = createTargetEntity(
              { x: 5, y: 5 },
              ['key'],
              InteractionBehaviorType.REMOVE,
            );

            store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

            system.update(getUpdateArgs());

            expect(getEntity(targetEntity.id)).toBeUndefined();

            if (isConsumable) {
              expect(getEntity(keyItem.id)).toBeUndefined();
            } else {
              expect(getEntity(keyItem.id)).toBeDefined();
            }

            const updatedInteractingEntity = getEntity(interactingEntity.id);
            expect(updatedInteractingEntity).toBeDefined();
            if (isConsumable) {
              expect(updatedInteractingEntity!.components).not.toHaveProperty(
                ComponentType.CarriedItem,
              );
            } else {
              expect(updatedInteractingEntity!.components).toHaveProperty(
                ComponentType.CarriedItem,
              );
            }
          },
        );
      });

      it('should process interaction when item has multiple capabilities', () => {
        const multiCapabilityItem = createUsableItem({
          capabilities: ['key', 'tool'],
        });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: multiCapabilityItem.id,
        });

        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key', 'tool'],
          InteractionBehaviorType.REMOVE,
        );

        store.set(entitiesAtom, [
          interactingEntity,
          multiCapabilityItem,
          targetEntity,
        ]);

        system.update(getUpdateArgs());

        expect(getEntity(targetEntity.id)).toBeUndefined();
        expect(getEntity(multiCapabilityItem.id)).toBeUndefined();

        const updatedInteractingEntity = getEntity(interactingEntity.id);
        expect(updatedInteractingEntity).toBeDefined();
        expect(updatedInteractingEntity!.components).not.toHaveProperty(
          ComponentType.CarriedItem,
        );
      });

      it('should process interaction when item has more capabilities than required', () => {
        const masterKey = createUsableItem({
          capabilities: ['key', 'tool', 'lockpick'],
        });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: masterKey.id,
        });

        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key', 'tool'],
          InteractionBehaviorType.REMOVE,
        );

        store.set(entitiesAtom, [interactingEntity, masterKey, targetEntity]);

        system.update(getUpdateArgs());

        expect(getEntity(targetEntity.id)).toBeUndefined();
        expect(getEntity(masterKey.id)).toBeUndefined();

        const updatedInteractingEntity = getEntity(interactingEntity.id);
        expect(updatedInteractingEntity).toBeDefined();
        expect(updatedInteractingEntity!.components).not.toHaveProperty(
          ComponentType.CarriedItem,
        );
      });
    });
  });

  describe('Capability Matching - Path 2', () => {
    describe('Path 2.2: Partial Capability Match', () => {
      it('should filter out entities when item has only some required capabilities', () => {
        const partialItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: partialItem.id,
        });

        const complexLock = createTargetEntity(
          { x: 5, y: 5 },
          ['key', 'tool'],
          InteractionBehaviorType.REMOVE,
        );

        store.set(entitiesAtom, [interactingEntity, partialItem, complexLock]);

        system.update(getUpdateArgs());

        // No interaction should occur due to missing tool capability
        expect(store.get(entitiesAtom)).toEqual([
          interactingEntity,
          partialItem,
          complexLock,
        ]);
      });
    });
  });

  it('should handle multiple entities in same position', () => {
    const keyItem = createUsableItem({ capabilities: ['key'] });
    const toolItem = createUsableItem({ capabilities: ['tool'] });

    const interactingEntity1 = createInteractingEntityWithItem({
      position: { x: 5, y: 6 },
      carriedItemId: keyItem.id,
      direction: { direction: 'up' },
    });

    const interactingEntity2 = createInteractingEntityWithItem({
      position: { x: 5, y: 6 }, // Same position
      carriedItemId: toolItem.id,
      direction: { direction: 'up' },
    });

    const keyTarget = createTargetEntity(
      { x: 5, y: 5 },
      ['key'],
      InteractionBehaviorType.REMOVE,
      { interactionDirections: ['down'] },
    );

    const toolTarget = createTargetEntity(
      { x: 5, y: 5 }, // Same position as key target
      ['tool'],
      InteractionBehaviorType.REMOVE,
      { interactionDirections: ['down'] },
    );

    store.set(entitiesAtom, [
      interactingEntity1,
      interactingEntity2,
      keyItem,
      toolItem,
      keyTarget,
      toolTarget,
    ]);

    system.update(getUpdateArgs());

    const updatedEntities = store.get(entitiesAtom);
    expect(updatedEntities).not.toContainEqual(keyTarget);
    expect(updatedEntities).not.toContainEqual(toolTarget);
    expect(updatedEntities).not.toContainEqual(keyItem);
    expect(updatedEntities).not.toContainEqual(toolItem);

    const expectedInteractingEntity1 = { ...interactingEntity1 };
    delete expectedInteractingEntity1.components[ComponentType.CarriedItem];
    const expectedInteractingEntity2 = { ...interactingEntity2 };
    delete expectedInteractingEntity2.components[ComponentType.CarriedItem];

    expect(updatedEntities).toContainEqual(expectedInteractingEntity1);
    expect(updatedEntities).toContainEqual(expectedInteractingEntity2);
    expect(updatedEntities).toHaveLength(2); // Only interacting entities remain
  });

  it('should handle diagonal vs cardinal direction positioning', () => {
    const keyItem = createUsableItem({ capabilities: ['key'] });
    const interactingEntity = createInteractingEntityWithItem({
      position: { x: 6, y: 6 }, // Diagonal position
      carriedItemId: keyItem.id,
      direction: { direction: 'up' },
    });

    const targetEntity = createTargetEntity(
      { x: 5, y: 5 },
      ['key'],
      InteractionBehaviorType.REMOVE,
    );

    store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

    system.update(getUpdateArgs());

    expect(store.get(entitiesAtom)).toEqual([
      interactingEntity,
      keyItem,
      targetEntity,
    ]);
  });

  describe('Handles Transformations', () => {
    it('should handle transformations correctly', () => {
      const keyItem = createUsableItem({ capabilities: ['key'] });
      const interactingEntity = createInteractingEntityWithItem({
        position: { x: 5, y: 6 },
        carriedItemId: keyItem.id,
      });

      const targetEntity = createTargetEntity(
        { x: 5, y: 5 },
        ['key'],
        InteractionBehaviorType.TRANSFORM,
        {
          newSpriteId: 'new-sprite-id',
        },
      );

      store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

      system.update(getUpdateArgs());

      expect(getEntity(targetEntity.id)).toBeDefined();
      expect(getEntity(targetEntity.id)?.components).toContainEqual(
        new InteractionBehaviorComponent({
          behaviorType: InteractionBehaviorType.TRANSFORM,
          newSpriteId: 'new-sprite-id',
        }),
      );

      expect(getEntity(keyItem.id)).toBeUndefined();

      const updatedInteractingEntity = getEntity(interactingEntity.id);
      expect(updatedInteractingEntity).toBeDefined();
      expect(updatedInteractingEntity!.components).not.toHaveProperty(
        ComponentType.CarriedItem,
      );
    });
  });
});

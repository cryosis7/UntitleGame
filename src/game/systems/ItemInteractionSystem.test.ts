import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemInteractionSystem } from './ItemInteractionSystem';
import type { EntityTemplate } from '../utils/EntityFactory';
import { createEntity } from '../utils/EntityFactory';
import type {
  Component,
  Direction,
  DirectionComponentProps,
  PositionComponentProps,
  UsableItemComponentProps,
} from '../components';
import {
  CarriedItemComponent,
  ComponentType,
  DirectionComponent,
  InteractingComponent,
  InteractionBehaviorComponent,
  InteractionBehaviorType,
  PositionComponent,
  RequiresItemComponent,
  SpawnContentsComponent,
  UsableItemComponent,
} from '../components';
import type { Entity } from '../utils/ecsUtils';
import { entitiesAtom, store } from '../atoms';
import { GameMap, type Position } from '../map/GameMap';
import type { UpdateArgs } from './Framework/Systems';
import { getEntitiesAtPosition, getEntity } from '../utils/EntityUtils';

describe('ItemInteractionSystem', () => {
  let system: ItemInteractionSystem;
  let entities: Entity[];
  const map = new GameMap();

  beforeEach(() => {
    system = new ItemInteractionSystem();
    entities = [];
    store.set(entitiesAtom, entities);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
      spawnContents?: EntityTemplate[];
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

    if (behaviorType === InteractionBehaviorType.SPAWN_CONTENTS) {
      components.push(
        new SpawnContentsComponent({
          contents: options.spawnContents || [],
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

  describe('on update', () => {
    describe('when interaction succeeds', () => {
      describe('with valid requirements matching', () => {
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
              position: { x: 5, y: 6 },
              carriedItemId: keyItem.id,
              direction: { direction: 'up' },
            });

            const targetEntity = createTargetEntity(
              { x: 5, y: 5 },
              ['key'],
              InteractionBehaviorType.REMOVE,
              { interactionDirections: directions },
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
            expect(updatedInteractingEntity!.components).not.toHaveProperty(
              ComponentType.Interacting,
            );
          },
        );

        it('should process interaction when entity has no direction component', () => {
          const keyItem = createUsableItem({ capabilities: ['key'] });
          const interactingEntity = createInteractingEntityWithItem({
            position: { x: 5, y: 6 },
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

      describe('with multiple entities', () => {
        it('should process all valid interactions when multiple entities are at same position', () => {
          const keyItem = createUsableItem({ capabilities: ['key'] });
          const toolItem = createUsableItem({ capabilities: ['tool'] });

          const interactingEntity1 = createInteractingEntityWithItem({
            position: { x: 5, y: 6 },
            carriedItemId: keyItem.id,
            direction: { direction: 'up' },
          });

          const interactingEntity2 = createInteractingEntityWithItem({
            position: { x: 5, y: 6 },
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
            { x: 5, y: 5 },
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
          delete expectedInteractingEntity1.components[
            ComponentType.CarriedItem
          ];
          delete expectedInteractingEntity1.components[
            ComponentType.Interacting
          ];
          const expectedInteractingEntity2 = { ...interactingEntity2 };
          delete expectedInteractingEntity2.components[
            ComponentType.CarriedItem
          ];
          delete expectedInteractingEntity2.components[
            ComponentType.Interacting
          ];

          expect(updatedEntities).toContainEqual(expectedInteractingEntity1);
          expect(updatedEntities).toContainEqual(expectedInteractingEntity2);
          expect(updatedEntities).toHaveLength(2);
        });
      });
    });

    describe('when validating capabilities', () => {
      describe('with capability matching', () => {
        it('should allow interaction when item has multiple matching capabilities', () => {
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

        it('should allow interaction when item has superset of required capabilities', () => {
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

        it('should reject interaction when item has only partial required capabilities', () => {
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

          store.set(entitiesAtom, [
            interactingEntity,
            partialItem,
            complexLock,
          ]);

          system.update(getUpdateArgs());

          expect(store.get(entitiesAtom)).toEqual([
            interactingEntity,
            partialItem,
            complexLock,
          ]);
        });

        it('should reject interaction when item capabilities do not match requirements', () => {
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
    });
  });

  describe('when components are missing', () => {
    describe('with required components absent', () => {
      it.each([
        { componentType: ComponentType.Interacting },
        { componentType: ComponentType.CarriedItem },
        { componentType: ComponentType.Position },
      ])(
        'should skip processing when entity lacks %s component',
        ({ componentType }) => {
          const key = createUsableItem({ capabilities: ['key'] });
          const entityWithoutComponent = createEntity([
            new PositionComponent({ x: 5, y: 5 }),
            new InteractingComponent(),
            new CarriedItemComponent({ item: key.id }),
          ]);

          delete entityWithoutComponent.components[componentType];
          store.set(entitiesAtom, [entityWithoutComponent, key]);

          expect(() => system.update(getUpdateArgs())).not.toThrow();

          expect(store.get(entitiesAtom)).toEqual([
            entityWithoutComponent,
            key,
          ]);
        },
      );
    });

    describe('with UsableItem component', () => {
      it('should skip entity when carried item lacks UsableItem component', () => {
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

      it('should process valid entities while skipping entities with unusable items', () => {
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
        delete expectedInteractingEntity.components[ComponentType.Interacting];
        expect(updatedEntities).toContainEqual(expectedInteractingEntity);
        expect(updatedEntities).not.toContainEqual(targetEntity);

        expect(updatedEntities).toHaveLength(3);
      });
    });
  });

  describe('when validating spatial requirements', () => {
    describe('with position validation', () => {
      it('should reject interaction when entity is not adjacent to target', () => {
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

      it('should reject interaction when entity is diagonally positioned', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 6, y: 6 },
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
    });

    describe('with direction validation', () => {
      it('should reject interaction when entity faces wrong direction', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: keyItem.id,
          direction: { direction: 'down' },
        });

        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.REMOVE,
          { interactionDirections: ['down'] },
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
  });

  describe('when applying interaction behaviors', () => {
    describe('with transform behavior', () => {
      it('should transform target entity and remove interaction components', () => {
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

        expect(getEntity(keyItem.id)).toBeUndefined();
        expect(getEntity(targetEntity.id)).toBeUndefined();

        const expectedTransformedEntity = getEntitiesAtPosition({ x: 5, y: 5 });
        expect(expectedTransformedEntity).toHaveLength(1);

        expect(expectedTransformedEntity[0].components).not.toHaveProperty(
          ComponentType.InteractionBehavior,
        );
        expect(expectedTransformedEntity[0].components).not.toHaveProperty(
          ComponentType.RequiresItem,
        );
        expect(getEntity(interactingEntity.id)).not.toHaveProperty(
          ComponentType.Interacting,
        );
      });
    });

    describe('with remove behavior', () => {
      it('should remove target entity and consume item on successful interaction', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
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
        expect(getEntity(keyItem.id)).toBeUndefined();
        expect(getEntitiesAtPosition({ x: 5, y: 5 })).toHaveLength(0);
      });

      it('should handle multiple simultaneous removal interactions', () => {
        const keyItem1 = createUsableItem({ capabilities: ['key'] });
        const keyItem2 = createUsableItem({ capabilities: ['key'] });

        const interactingEntity1 = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: keyItem1.id,
        });

        const interactingEntity2 = createInteractingEntityWithItem({
          position: { x: 7, y: 8 },
          carriedItemId: keyItem2.id,
        });

        const targetEntity1 = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.REMOVE,
        );

        const targetEntity2 = createTargetEntity(
          { x: 7, y: 7 },
          ['key'],
          InteractionBehaviorType.REMOVE,
        );

        store.set(entitiesAtom, [
          interactingEntity1,
          interactingEntity2,
          keyItem1,
          keyItem2,
          targetEntity1,
          targetEntity2,
        ]);

        system.update(getUpdateArgs());

        expect(getEntity(keyItem1.id)).toBeUndefined();
        expect(getEntity(keyItem2.id)).toBeUndefined();
        expect(getEntity(targetEntity1.id)).toBeUndefined();
        expect(getEntity(targetEntity2.id)).toBeUndefined();
        expect(getEntitiesAtPosition({ x: 5, y: 5 })).toHaveLength(0);
        expect(getEntitiesAtPosition({ x: 7, y: 7 })).toHaveLength(0);
      });

      it('should only remove target entity while preserving unrelated entities', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: keyItem.id,
        });

        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.REMOVE,
        );

        const bystander = createEntity([
          new PositionComponent({ x: 10, y: 10 }),
        ]);

        store.set(entitiesAtom, [
          interactingEntity,
          keyItem,
          targetEntity,
          bystander,
        ]);

        system.update(getUpdateArgs());

        expect(getEntity(targetEntity.id)).toBeUndefined();
        expect(getEntity(keyItem.id)).toBeUndefined();
        expect(getEntity(bystander.id)).toBeDefined();

        const updatedInteractingEntity = getEntity(interactingEntity.id);
        expect(updatedInteractingEntity).toBeDefined();
        expect(updatedInteractingEntity!.components).not.toHaveProperty(
          ComponentType.CarriedItem,
        );
        expect(updatedInteractingEntity!.components).not.toHaveProperty(
          ComponentType.Interacting,
        );
      });

      it('should preserve non-consumable items during remove interaction', () => {
        const permanentKey = createUsableItem({
          capabilities: ['key'],
          isConsumable: false,
        });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: permanentKey.id,
        });

        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.REMOVE,
        );

        store.set(entitiesAtom, [
          interactingEntity,
          permanentKey,
          targetEntity,
        ]);

        system.update(getUpdateArgs());

        expect(getEntity(permanentKey.id)).toBeDefined();
        expect(getEntity(targetEntity.id)).toBeUndefined();
        expect(getEntitiesAtPosition({ x: 5, y: 5 })).toHaveLength(0);
      });

      it('should preserve target when item capabilities do not match requirements', () => {
        const toolItem = createUsableItem({ capabilities: ['tool'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: toolItem.id,
        });

        const keyRequiredTarget = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.REMOVE,
        );

        store.set(entitiesAtom, [
          interactingEntity,
          toolItem,
          keyRequiredTarget,
        ]);

        system.update(getUpdateArgs());

        expect(getEntity(keyRequiredTarget.id)).toBeDefined();
        expect(getEntity(toolItem.id)).toBeDefined();
        expect(getEntity(interactingEntity.id)).toBeDefined();

        const unchangedInteractingEntity = getEntity(interactingEntity.id);
        expect(unchangedInteractingEntity!.components).toHaveProperty(
          ComponentType.CarriedItem,
        );
        expect(unchangedInteractingEntity!.components).toHaveProperty(
          ComponentType.Interacting,
        );
      });
    });

    describe('with spawn contents behavior', () => {
      it('should spawn entity at target position when using default offset', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: keyItem.id,
        });

        const spawnContent = {
          components: {
            position: { x: 0, y: 0 },
          },
        };
        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.SPAWN_CONTENTS,
          {
            spawnContents: [spawnContent],
          },
        );

        store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

        system.update(getUpdateArgs());

        expect(getEntity(targetEntity.id)).toBeUndefined();
        expect(getEntity(keyItem.id)).toBeUndefined();

        const spawnedEntities = getEntitiesAtPosition({ x: 5, y: 5 });
        expect(spawnedEntities).toHaveLength(1);

        const updatedInteractingEntity = getEntity(interactingEntity.id);
        expect(updatedInteractingEntity!.components).not.toHaveProperty(
          ComponentType.CarriedItem,
        );
        expect(updatedInteractingEntity!.components).not.toHaveProperty(
          ComponentType.Interacting,
        );
      });

      it('should spawn multiple entities using calculated positioning offsets', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 10, y: 9 },
          carriedItemId: keyItem.id,
        });

        const spawnContent1 = {
          components: { position: { x: 0, y: 0 } },
        };
        const spawnContent2 = {
          components: { position: { x: 0, y: 0 } },
        };
        const spawnContent3 = {
          components: { position: { x: 0, y: 0 } },
        };
        const spawnContent4 = {
          components: { position: { x: 0, y: 0 } },
        };

        const targetEntity = createTargetEntity(
          { x: 10, y: 10 },
          ['key'],
          InteractionBehaviorType.SPAWN_CONTENTS,
          {
            spawnContents: [
              spawnContent1,
              spawnContent2,
              spawnContent3,
              spawnContent4,
            ],
          },
        );

        store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

        system.update(getUpdateArgs());

        expect(getEntity(targetEntity.id)).toBeUndefined();

        // Check positioning logic: Math.floor(index / 2) for x offset, index % 2 for y offset
        expect(getEntitiesAtPosition({ x: 10, y: 10 })).toHaveLength(1); // index 0: x+0, y+0
        expect(getEntitiesAtPosition({ x: 10, y: 11 })).toHaveLength(1); // index 1: x+0, y+1
        expect(getEntitiesAtPosition({ x: 11, y: 10 })).toHaveLength(1); // index 2: x+1, y+0
        expect(getEntitiesAtPosition({ x: 11, y: 11 })).toHaveLength(1); // index 3: x+1, y+1
      });

      it('should apply custom spawn offset to spawned entities', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: keyItem.id,
        });

        const spawnContent1 = {
          components: { position: { x: 0, y: 0 } },
        };
        const spawnContent2 = {
          components: { position: { x: 0, y: 0 } },
        };

        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.SPAWN_CONTENTS,
          {
            spawnContents: [spawnContent1, spawnContent2],
            spawnOffset: { x: 2, y: 3 },
          },
        );

        store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

        system.update(getUpdateArgs());

        expect(getEntity(targetEntity.id)).toBeUndefined();

        // Target position (5,5) + spawn offset (2,3) = base spawn position (7,8)
        // Then apply index positioning logic
        expect(getEntitiesAtPosition({ x: 7, y: 8 })).toHaveLength(1); // index 0: base+0, base+0
        expect(getEntitiesAtPosition({ x: 7, y: 9 })).toHaveLength(1); // index 1: base+0, base+1
      });

      it('should create spawned entities with all specified components', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: keyItem.id,
        });

        const complexSpawnContent = {
          components: {
            position: { x: 0, y: 0 },
            usableItem: { capabilities: ['tool'], isConsumable: false },
          },
        };

        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.SPAWN_CONTENTS,
          {
            spawnContents: [complexSpawnContent],
          },
        );

        store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

        system.update(getUpdateArgs());

        expect(getEntity(targetEntity.id)).toBeUndefined();

        const spawnedEntities = getEntitiesAtPosition({ x: 5, y: 5 });
        expect(spawnedEntities).toHaveLength(1);

        const spawnedEntity = spawnedEntities[0];
        expect(
          spawnedEntity.components[ComponentType.UsableItem],
        ).toBeDefined();
        expect(spawnedEntity.components[ComponentType.Position]).toBeDefined();
      });

      it('should complete interaction without spawning when contents array is empty', () => {
        const keyItem = createUsableItem({ capabilities: ['key'] });
        const interactingEntity = createInteractingEntityWithItem({
          position: { x: 5, y: 6 },
          carriedItemId: keyItem.id,
        });

        const targetEntity = createTargetEntity(
          { x: 5, y: 5 },
          ['key'],
          InteractionBehaviorType.SPAWN_CONTENTS,
          {
            spawnContents: [],
          },
        );

        store.set(entitiesAtom, [interactingEntity, keyItem, targetEntity]);

        system.update(getUpdateArgs());

        expect(getEntity(targetEntity.id)).toBeUndefined();
        expect(getEntity(keyItem.id)).toBeUndefined();

        // No entities should be spawned
        expect(getEntitiesAtPosition({ x: 5, y: 5 })).toHaveLength(0);

        const updatedInteractingEntity = getEntity(interactingEntity.id);
        expect(updatedInteractingEntity!.components).not.toHaveProperty(
          ComponentType.CarriedItem,
        );
        expect(updatedInteractingEntity!.components).not.toHaveProperty(
          ComponentType.Interacting,
        );
      });
    });
  });

  describe('when managing items', () => {
    describe('with item consumption', () => {
      it.each`
        isConsumable | description                 | consumable
        ${true}      | ${'and consume item'}       | ${'consumable'}
        ${false}     | ${'without consuming item'} | ${'not consumable'}
      `(
        'should $description based on item consumability',
        ({ isConsumable }) => {
          const keyItem = createUsableItem({
            capabilities: ['key'],
            isConsumable,
          });
          const interactingEntity = createInteractingEntityWithItem({
            position: { x: 5, y: 6 },
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
  });

  describe('when handling errors and edge cases', () => {
    describe('with data integrity issues', () => {
      describe('with invalid entity references', () => {
        it('should log error and continue processing when carried item reference is invalid', () => {
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
    });
  });
});

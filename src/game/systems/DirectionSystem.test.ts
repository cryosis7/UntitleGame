import { beforeEach, describe, expect, it } from 'vitest';
import { DirectionSystem } from './DirectionSystem';
import { createEntity } from '../utils/EntityFactory';
import type { Entity } from '../utils/ecsUtils';
import type { UpdateArgs } from './Framework/Systems';
import { entitiesAtom, store } from '../atoms';
import type { GameMap } from '../map/GameMap';
import type {
  DirectionComponentProps,
  VelocityComponentProps,
} from '../components';
import {
  ComponentType,
  DirectionComponent,
  VelocityComponent,
} from '../components';
import { getComponentAbsolute } from '../components/ComponentOperations';
import { getEntity } from '../utils/EntityUtils';

describe('DirectionSystem', () => {
  let system: DirectionSystem;
  let entities: Entity[];

  const mockMap = {
    isValidPosition: () => true,
    isPositionInMap: () => true,
    isTileWalkable: () => true,
    getTile: () => null,
  } as unknown as GameMap;

  beforeEach(() => {
    system = new DirectionSystem();
    entities = [];
    store.set(entitiesAtom, entities);
  });

  const createEntityWithDirectionAndVelocity = ({
    direction = 'up',
    velocity = { vx: 0, vy: 0 },
  }: {
    direction?: DirectionComponentProps['direction'];
    velocity?: VelocityComponentProps;
  } = {}) => {
    return createEntity([
      new DirectionComponent({ direction }),
      new VelocityComponent(velocity),
    ]);
  };

  const createEntityWithDirectionOnly = (
    direction: DirectionComponentProps['direction'] = 'up',
  ) => {
    return createEntity([new DirectionComponent({ direction })]);
  };

  const createEntityWithVelocityOnly = (velocity: VelocityComponentProps) => {
    return createEntity([new VelocityComponent(velocity)]);
  };

  const getUpdateArgs = (): UpdateArgs => {
    const entities = store.get(entitiesAtom);
    return {
      entities,
      map: mockMap,
      time: undefined,
    };
  };

  describe('given an entity with direction and velocity components', () => {
    describe('when horizontal velocity is greater than vertical', () => {
      it.each`
        description   | initialDirection | velocity             | expectedDirection
        ${'positive'} | ${'up'}          | ${{ vx: 3, vy: 1 }}  | ${'right'}
        ${'negative'} | ${'down'}        | ${{ vx: -4, vy: 2 }} | ${'left'}
      `(
        'should set direction to $expectedDirection for $description horizontal velocity',
        ({ initialDirection, velocity, expectedDirection }) => {
          const entity = createEntityWithDirectionAndVelocity({
            direction: initialDirection,
            velocity,
          });

          store.set(entitiesAtom, [entity]);
          system.update(getUpdateArgs());

          const updatedEntity = getEntity(entity.id);
          const directionComponent = getComponentAbsolute(
            updatedEntity!,
            ComponentType.Direction,
          );
          expect(directionComponent.direction).toBe(expectedDirection);
        },
      );
    });

    describe('when horizontal and vertical velocity magnitudes are equal', () => {
      it.each`
        description   | initialDirection | velocity              | expectedDirection
        ${'positive'} | ${'up'}          | ${{ vx: 2, vy: 2 }}   | ${'down'}
        ${'negative'} | ${'right'}       | ${{ vx: -3, vy: -3 }} | ${'up'}
      `(
        'should prioritize vertical direction and set direction to $expectedDirection for $description velocity',
        ({ initialDirection, velocity, expectedDirection }) => {
          const entity = createEntityWithDirectionAndVelocity({
            direction: initialDirection,
            velocity,
          });

          store.set(entitiesAtom, [entity]);
          system.update(getUpdateArgs());

          const updatedEntity = getEntity(entity.id);
          const directionComponent = getComponentAbsolute(
            updatedEntity!,
            ComponentType.Direction,
          );
          expect(directionComponent.direction).toBe(expectedDirection);
        },
      );
    });

    describe('when vertical velocity magnitude is greater than horizontal', () => {
      it.each`
        description                     | initialDirection | velocity             | expectedDirection
        ${'positive vertical velocity'} | ${'left'}        | ${{ vx: 1, vy: 3 }}  | ${'down'}
        ${'negative vertical velocity'} | ${'right'}       | ${{ vx: 2, vy: -5 }} | ${'up'}
      `(
        'should set direction to $expectedDirection for $description',
        ({ initialDirection, velocity, expectedDirection }) => {
          const entity = createEntityWithDirectionAndVelocity({
            direction: initialDirection,
            velocity,
          });

          store.set(entitiesAtom, [entity]);
          system.update(getUpdateArgs());

          const updatedEntity = getEntity(entity.id);
          const directionComponent = getComponentAbsolute(
            updatedEntity!,
            ComponentType.Direction,
          );
          expect(directionComponent.direction).toBe(expectedDirection);
        },
      );
    });

    describe('when only vertical velocity is non-zero', () => {
      it.each`
        description                     | initialDirection | velocity             | expectedDirection
        ${'positive vertical velocity'} | ${'left'}        | ${{ vx: 0, vy: 4 }}  | ${'down'}
        ${'negative vertical velocity'} | ${'right'}       | ${{ vx: 0, vy: -2 }} | ${'up'}
      `(
        'should set direction to $expectedDirection for $description',
        ({ initialDirection, velocity, expectedDirection }) => {
          const entity = createEntityWithDirectionAndVelocity({
            direction: initialDirection,
            velocity,
          });

          store.set(entitiesAtom, [entity]);
          system.update(getUpdateArgs());

          const updatedEntity = getEntity(entity.id);
          const directionComponent = getComponentAbsolute(
            updatedEntity!,
            ComponentType.Direction,
          );
          expect(directionComponent.direction).toBe(expectedDirection);
        },
      );
    });

    describe('when only horizontal velocity is non-zero', () => {
      it.each`
        description                       | initialDirection | velocity             | expectedDirection
        ${'positive horizontal velocity'} | ${'up'}          | ${{ vx: 5, vy: 0 }}  | ${'right'}
        ${'negative horizontal velocity'} | ${'down'}        | ${{ vx: -3, vy: 0 }} | ${'left'}
      `(
        'should set direction to $expectedDirection for $description',
        ({ initialDirection, velocity, expectedDirection }) => {
          const entity = createEntityWithDirectionAndVelocity({
            direction: initialDirection,
            velocity,
          });

          store.set(entitiesAtom, [entity]);
          system.update(getUpdateArgs());

          const updatedEntity = getEntity(entity.id);
          const directionComponent = getComponentAbsolute(
            updatedEntity!,
            ComponentType.Direction,
          );
          expect(directionComponent.direction).toBe(expectedDirection);
        },
      );
    });
  });

  describe('when both velocities are zero', () => {
    it('should preserve the current direction', () => {
      const entity = createEntityWithDirectionAndVelocity({
        direction: 'left',
        velocity: { vx: 0, vy: 0 },
      });

      store.set(entitiesAtom, [entity]);
      system.update(getUpdateArgs());

      const updatedEntity = getEntity(entity.id);
      const directionComponent = getComponentAbsolute(
        updatedEntity!,
        ComponentType.Direction,
      );
      expect(directionComponent.direction).toBe('left');
    });
  });

  describe('given entities with missing components', () => {
    describe('when entity has only direction component', () => {
      it('should leave direction unchanged without velocity component', () => {
        const entity = createEntityWithDirectionOnly('left');

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = getComponentAbsolute(
          updatedEntity!,
          ComponentType.Direction,
        );
        expect(directionComponent.direction).toBe('left');
      });
    });

    describe('when entity has only velocity component', () => {
      it('should not create direction component', () => {
        const entity = createEntityWithVelocityOnly({ vx: 5, vy: 3 });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        expect(updatedEntity!.components[ComponentType.Velocity]).toMatchObject(
          {
            vx: 5,
            vy: 3,
          },
        );
      });
    });

    describe('when entity has no relevant components', () => {
      it('should not throw errors and leave entity unchanged', () => {
        const entity = createEntity([]);

        store.set(entitiesAtom, [entity]);

        expect(() => system.update(getUpdateArgs())).not.toThrow();

        const updatedEntity = getEntity(entity.id);
        expect(updatedEntity!).toEqual(entity);
      });
    });
  });

  describe('given multiple entities in the system', () => {
    describe('when processing entities with different velocity patterns', () => {
      it('should update each entity direction independently', () => {
        const entity1 = createEntityWithDirectionAndVelocity({
          direction: 'up',
          velocity: { vx: 2, vy: 1 },
        });

        const entity2 = createEntityWithDirectionAndVelocity({
          direction: 'right',
          velocity: { vx: -1, vy: -3 },
        });

        const entity3 = createEntityWithDirectionAndVelocity({
          direction: 'down',
          velocity: { vx: 0, vy: 0 },
        });

        store.set(entitiesAtom, [entity1, entity2, entity3]);
        system.update(getUpdateArgs());

        const updatedEntity1 = getEntity(entity1.id);
        const updatedEntity2 = getEntity(entity2.id);
        const updatedEntity3 = getEntity(entity3.id);

        expect(
          getComponentAbsolute(updatedEntity1!, ComponentType.Direction)
            .direction,
        ).toBe('right');
        expect(
          getComponentAbsolute(updatedEntity2!, ComponentType.Direction)
            .direction,
        ).toBe('up');
        expect(
          getComponentAbsolute(updatedEntity3!, ComponentType.Direction)
            .direction,
        ).toBe('down');
      });

      describe('when processing entities with mixed component configurations', () => {
        it('should process only entities with both required components', () => {
          const validEntity = createEntityWithDirectionAndVelocity({
            direction: 'left',
            velocity: { vx: 0, vy: 5 },
          });

          const directionOnlyEntity = createEntityWithDirectionOnly('right');
          const velocityOnlyEntity = createEntityWithVelocityOnly({
            vx: 3,
            vy: 0,
          });

          store.set(entitiesAtom, [
            validEntity,
            directionOnlyEntity,
            velocityOnlyEntity,
          ]);
          system.update(getUpdateArgs());

          const updatedValidEntity = getEntity(validEntity.id);
          const updatedDirectionOnlyEntity = getEntity(directionOnlyEntity.id);
          const updatedVelocityOnlyEntity = getEntity(velocityOnlyEntity.id);

          const validDirection = getComponentAbsolute(
            updatedValidEntity!,
            ComponentType.Direction,
          );
          expect(validDirection.direction).toBe('down');

          const directionOnlyDirection = getComponentAbsolute(
            updatedDirectionOnlyEntity!,
            ComponentType.Direction,
          );
          expect(directionOnlyDirection.direction).toBe('right');

          expect(updatedVelocityOnlyEntity!.components).not.toHaveProperty(
            ComponentType.Direction,
          );
        });
      });
    });

    describe('when entities array is empty', () => {
      it('should complete processing without errors', () => {
        store.set(entitiesAtom, []);

        expect(() => system.update(getUpdateArgs())).not.toThrow();
      });
    });
  });
});

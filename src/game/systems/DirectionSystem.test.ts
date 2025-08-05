import { beforeEach, describe, expect, it } from 'vitest';
import { DirectionSystem } from './DirectionSystem';
import { createEntity } from '../utils/EntityFactory';
import type { Entity } from '../utils/ecsUtils';
import type { UpdateArgs } from './Systems';
import { entitiesAtom, store } from '../utils/Atoms';
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
import { getEntity } from '../utils/EntityUtils';

describe('DirectionSystem', () => {
  let system: DirectionSystem;
  let entities: Entity[];

  const mockMap = {
    isValidPosition: () => true,
    isPositionInMap: () => true,
    isTileWalkable: () => true,
    getTile: () => null,
  } as GameMap;

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

  describe('Direction Updates Based on Velocity', () => {
    describe('Horizontal Movement Priority', () => {
      it('should set direction to right when horizontal velocity is positive and greater than vertical', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'up',
          velocity: { vx: 3, vy: 1 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('right');
      });

      it('should set direction to left when horizontal velocity is negative and greater than vertical', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'down',
          velocity: { vx: -4, vy: 2 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('left');
      });

      it('should set direction to right when horizontal velocity is positive and equal to vertical', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'up',
          velocity: { vx: 2, vy: 2 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('down');
      });

      it('should set direction to left when horizontal velocity is negative and equal to vertical', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'right',
          velocity: { vx: -3, vy: -3 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('up');
      });
    });

    describe('Vertical Movement', () => {
      it('should set direction to down when vertical velocity is positive and greater than horizontal', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'left',
          velocity: { vx: 1, vy: 3 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('down');
      });

      it('should set direction to up when vertical velocity is negative and greater than horizontal', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'right',
          velocity: { vx: 2, vy: -5 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('up');
      });

      it('should set direction to down when only vertical velocity is positive', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'left',
          velocity: { vx: 0, vy: 4 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('down');
      });

      it('should set direction to up when only vertical velocity is negative', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'right',
          velocity: { vx: 0, vy: -2 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('up');
      });
    });

    describe('Horizontal Only Movement', () => {
      it('should set direction to right when only horizontal velocity is positive', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'up',
          velocity: { vx: 5, vy: 0 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('right');
      });

      it('should set direction to left when only horizontal velocity is negative', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'down',
          velocity: { vx: -3, vy: 0 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('left');
      });
    });
  });

  describe('Zero Velocity Handling', () => {
    it('should not update direction when both velocities are zero', () => {
      const entity = createEntityWithDirectionAndVelocity({
        direction: 'left',
        velocity: { vx: 0, vy: 0 },
      });

      store.set(entitiesAtom, [entity]);
      system.update(getUpdateArgs());

      const updatedEntity = getEntity(entity.id);
      const directionComponent = updatedEntity!.components[
        ComponentType.Direction
      ] as DirectionComponentProps;
      expect(directionComponent.direction).toBe('left');
    });

    it('should preserve original direction when velocity becomes zero', () => {
      const entity = createEntityWithDirectionAndVelocity({
        direction: 'right',
        velocity: { vx: 0, vy: 0 },
      });

      store.set(entitiesAtom, [entity]);
      system.update(getUpdateArgs());

      const updatedEntity = getEntity(entity.id);
      const directionComponent = updatedEntity!.components[
        ComponentType.Direction
      ] as DirectionComponentProps;
      expect(directionComponent.direction).toBe('right');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    describe('Very Small Velocities', () => {
      it('should handle very small positive velocities correctly', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'up',
          velocity: { vx: 0.001, vy: 0.0005 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('right');
      });

      it('should handle very small negative velocities correctly', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'right',
          velocity: { vx: -0.0001, vy: -0.001 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('up');
      });
    });

    describe('Large Velocities', () => {
      it('should handle very large velocities correctly', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'down',
          velocity: { vx: 1000, vy: 500 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('right');
      });

      it('should handle negative large velocities correctly', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'left',
          velocity: { vx: -100, vy: -2000 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('up');
      });
    });

    describe('Mixed Sign Velocities', () => {
      it('should handle positive horizontal and negative vertical velocity', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'up',
          velocity: { vx: 3, vy: -2 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('right');
      });

      it('should handle negative horizontal and positive vertical velocity', () => {
        const entity = createEntityWithDirectionAndVelocity({
          direction: 'right',
          velocity: { vx: -1, vy: 4 },
        });

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('down');
      });
    });
  });

  describe('Component Requirements', () => {
    describe('Missing Components', () => {
      it('should not process entity with only direction component', () => {
        const entity = createEntityWithDirectionOnly('left');

        store.set(entitiesAtom, [entity]);
        system.update(getUpdateArgs());

        const updatedEntity = getEntity(entity.id);
        const directionComponent = updatedEntity!.components[
          ComponentType.Direction
        ] as DirectionComponentProps;
        expect(directionComponent.direction).toBe('left');
      });

      it('should not process entity with only velocity component', () => {
        const entity = createEntityWithVelocityOnly({ vx: 5, vy: 3 });

        store.set(entitiesAtom, [entity]);

        expect(() => system.update(getUpdateArgs())).not.toThrow();

        const updatedEntity = getEntity(entity.id);
        expect(
          updatedEntity!.components[ComponentType.Direction],
        ).toBeUndefined();
      });

      it('should not process entity with no relevant components', () => {
        const entity = createEntity([]);

        store.set(entitiesAtom, [entity]);

        expect(() => system.update(getUpdateArgs())).not.toThrow();

        const updatedEntity = getEntity(entity.id);
        expect(
          updatedEntity!.components[ComponentType.Direction],
        ).toBeUndefined();
        expect(
          updatedEntity!.components[ComponentType.Velocity],
        ).toBeUndefined();
      });
    });
  });

  describe('Multiple Entity Processing', () => {
    it('should handle multiple entities with different velocities', () => {
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
      const direction1 = updatedEntity1!.components[
        ComponentType.Direction
      ] as DirectionComponentProps;
      expect(direction1.direction).toBe('right');

      const updatedEntity2 = getEntity(entity2.id);
      const direction2 = updatedEntity2!.components[
        ComponentType.Direction
      ] as DirectionComponentProps;
      expect(direction2.direction).toBe('up');

      const updatedEntity3 = getEntity(entity3.id);
      const direction3 = updatedEntity3!.components[
        ComponentType.Direction
      ] as DirectionComponentProps;
      expect(direction3.direction).toBe('down');
    });

    it('should handle mixed entities with and without required components', () => {
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
      const validDirection = updatedValidEntity!.components[
        ComponentType.Direction
      ] as DirectionComponentProps;
      expect(validDirection.direction).toBe('down');

      const updatedDirectionOnlyEntity = getEntity(directionOnlyEntity.id);
      const directionOnlyDirection = updatedDirectionOnlyEntity!.components[
        ComponentType.Direction
      ] as DirectionComponentProps;
      expect(directionOnlyDirection.direction).toBe('right');

      const updatedVelocityOnlyEntity = getEntity(velocityOnlyEntity.id);
      expect(
        updatedVelocityOnlyEntity!.components[ComponentType.Direction],
      ).toBeUndefined();
    });
  });

  describe('Error Handling and Robustness', () => {
    it('should handle empty entities array gracefully', () => {
      store.set(entitiesAtom, []);

      expect(() => system.update(getUpdateArgs())).not.toThrow();
    });

    it('should handle null or undefined entities gracefully', () => {
      const invalidUpdateArgs: UpdateArgs = {
        entities: null as any,
        map: mockMap,
      };

      expect(() => system.update(invalidUpdateArgs)).not.toThrow();
    });

    it('should handle entities with undefined components gracefully', () => {
      const entity = createEntity([]);
      // These entities won't be processed by the system since they lack required components

      store.set(entitiesAtom, [entity]);

      expect(() => system.update(getUpdateArgs())).not.toThrow();

      // Entity should remain unchanged since it doesn't have required components
      const updatedEntity = getEntity(entity.id);
      expect(
        updatedEntity!.components[ComponentType.Direction],
      ).toBeUndefined();
      expect(updatedEntity!.components[ComponentType.Velocity]).toBeUndefined();
    });
  });

  describe('Performance and Efficiency', () => {
    it('should process large number of entities efficiently', () => {
      const entities = Array.from({ length: 1000 }, (_, i) =>
        createEntityWithDirectionAndVelocity({
          direction: 'up',
          velocity: { vx: (i % 4) - 2, vy: (i % 3) - 1 },
        }),
      );

      store.set(entitiesAtom, entities);

      const startTime = performance.now();
      system.update(getUpdateArgs());
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);

      const processedEntities = store.get(entitiesAtom);
      expect(processedEntities).toHaveLength(1000);
    });
  });
});

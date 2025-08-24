import { describe, expect, it } from 'vitest';
import {
  ConvenienceComponentSets,
  createStandardUpdateArgs,
} from '../helpers/testUtils';
import {
  ComponentType,
  MovableComponent,
  PickableComponent,
  RenderComponent,
  RenderSection,
  VelocityComponent,
  SceneryComponent,
} from '../../src/game/components';
import {
  getComponentAbsolute,
  setComponent,
} from '../../src/game/components/ComponentOperations';
import { createEntity } from '../../src/game/utils/EntityFactory';
import { MovementSystem } from '../../src/game/systems/MovementSystem';
import {
  getEntitiesAtPosition,
  getEntitiesWithComponent,
} from '../../src/game/utils/EntityUtils';
import { entitiesAtom, mapAtom, store } from '../../src/game/atoms';
import { GameMap } from '../../src/game/map/GameMap';

describe('Movement Integration Test', () => {
  describe('when player moves in open space', () => {
    const originalPlayer = createEntity(
      ConvenienceComponentSets.player({ x: 5, y: 5 }),
    );

    const movementSystem = new MovementSystem();

    it('should initialize system with player in center', () => {
      store.set(entitiesAtom, [originalPlayer]);
      store.set(mapAtom, new GameMap());

      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      const player = players[0];
      const position = getComponentAbsolute(player, ComponentType.Position);
      expect(position.x).toBe(5);
      expect(position.y).toBe(5);
    });

    it('should move player right', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      let player = players[0];
      setComponent(player, new VelocityComponent({ vx: 1, vy: 0 }));
      movementSystem.update(createStandardUpdateArgs());

      const updatedPlayers = getEntitiesWithComponent(ComponentType.Player);
      expect(updatedPlayers).toHaveLength(1);
      player = updatedPlayers[0];
      const position = getComponentAbsolute(player, ComponentType.Position);
      expect(position.x).toBe(6);
      expect(position.y).toBe(5);
    });

    it('should move player down', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      let player = players[0];
      setComponent(player!, new VelocityComponent({ vx: 0, vy: 1 }));
      movementSystem.update(createStandardUpdateArgs());

      const updatedPlayers = getEntitiesWithComponent(ComponentType.Player);
      expect(updatedPlayers).toHaveLength(1);
      player = updatedPlayers[0];
      const position = getComponentAbsolute(player!, ComponentType.Position);
      expect(position.x).toBe(6);
      expect(position.y).toBe(6);
    });

    it('should move player left', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      let player = players[0];
      setComponent(player!, new VelocityComponent({ vx: -1, vy: 0 }));
      movementSystem.update(createStandardUpdateArgs());

      const updatedPlayers = getEntitiesWithComponent(ComponentType.Player);
      expect(updatedPlayers).toHaveLength(1);
      player = updatedPlayers[0];
      const position = getComponentAbsolute(player!, ComponentType.Position);
      expect(position.x).toBe(5);
      expect(position.y).toBe(6);
    });

    it('should move player up', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      let player = players[0];
      setComponent(player!, new VelocityComponent({ vx: 0, vy: -1 }));
      movementSystem.update(createStandardUpdateArgs());

      const updatedPlayers = getEntitiesWithComponent(ComponentType.Player);
      expect(updatedPlayers).toHaveLength(1);
      player = updatedPlayers[0];
      const position = getComponentAbsolute(player!, ComponentType.Position);
      expect(position.x).toBe(5);
      expect(position.y).toBe(5);
    });

    it('should reset velocity after movement', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      let player = players[0];
      setComponent(player!, new VelocityComponent({ vx: 1, vy: 1 }));
      movementSystem.update(createStandardUpdateArgs());

      const updatedPlayers = getEntitiesWithComponent(ComponentType.Player);
      expect(updatedPlayers).toHaveLength(1);
      player = updatedPlayers[0];
      const velocity = getComponentAbsolute(player!, ComponentType.Velocity);
      expect(velocity.vx).toBe(0);
      expect(velocity.vy).toBe(0);
    });
  });

  describe('when movement is blocked', () => {
    describe('by non-walkable entities', () => {
      const player = createEntity(
        ConvenienceComponentSets.player({ x: 2, y: 2 }),
      );
      const wall = createEntity([
        { type: ComponentType.Position, x: 3, y: 2 },
        { type: ComponentType.Sprite, spriteName: 'wall' },
        new RenderComponent({ section: RenderSection.Game }),
      ]);

      const movementSystem = new MovementSystem();

      it('should prevent movement and reset velocity', () => {
        store.set(entitiesAtom, [player, wall]);
        store.set(mapAtom, new GameMap());

        const currentPlayers = getEntitiesWithComponent(ComponentType.Player);
        expect(currentPlayers).toHaveLength(1);
        let currentPlayer = currentPlayers[0];
        setComponent(currentPlayer!, new VelocityComponent({ vx: 1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());

        const updatedCurrentPlayers = getEntitiesWithComponent(
          ComponentType.Player,
        );
        expect(updatedCurrentPlayers).toHaveLength(1);
        currentPlayer = updatedCurrentPlayers[0];
        const position = getComponentAbsolute(
          currentPlayer!,
          ComponentType.Position,
        );
        expect(position.x).toBe(2);
        expect(position.y).toBe(2);

        const velocity = getComponentAbsolute(
          currentPlayer!,
          ComponentType.Velocity,
        );
        expect(velocity.vx).toBe(0);
        expect(velocity.vy).toBe(0);
      });
    });

    describe('by map boundaries', () => {
      const player = createEntity(
        ConvenienceComponentSets.player({ x: 0, y: 0 }),
      );

      const movementSystem = new MovementSystem();

      it('should prevent movement beyond boundaries and reset velocity', () => {
        store.set(entitiesAtom, [player]);
        store.set(mapAtom, new GameMap());

        const currentPlayers = getEntitiesWithComponent(ComponentType.Player);
        expect(currentPlayers).toHaveLength(1);
        let currentPlayer = currentPlayers[0];

        setComponent(currentPlayer!, new VelocityComponent({ vx: -1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());

        const firstUpdatedPlayers = getEntitiesWithComponent(
          ComponentType.Player,
        );
        expect(firstUpdatedPlayers).toHaveLength(1);
        currentPlayer = firstUpdatedPlayers[0];
        let position = getComponentAbsolute(
          currentPlayer!,
          ComponentType.Position,
        );
        expect(position.x).toBe(0);
        expect(position.y).toBe(0);

        setComponent(currentPlayer!, new VelocityComponent({ vx: 0, vy: -1 }));
        movementSystem.update(createStandardUpdateArgs());

        const secondUpdatedPlayers = getEntitiesWithComponent(
          ComponentType.Player,
        );
        expect(secondUpdatedPlayers).toHaveLength(1);
        currentPlayer = secondUpdatedPlayers[0];
        position = getComponentAbsolute(currentPlayer!, ComponentType.Position);
        expect(position.x).toBe(0);
        expect(position.y).toBe(0);

        const velocity = getComponentAbsolute(
          currentPlayer!,
          ComponentType.Velocity,
        );
        expect(velocity.vx).toBe(0);
        expect(velocity.vy).toBe(0);
      });
    });
  });

  describe('when moving onto walkable entities', () => {
    const player = createEntity(
      ConvenienceComponentSets.player({ x: 2, y: 2 }),
    );
    const pickableItem = createEntity([
      { type: ComponentType.Position, x: 3, y: 2 },
      new PickableComponent(),
      new RenderComponent({ section: RenderSection.Game }),
    ]);
    const walkableFloor = createEntity([
      { type: ComponentType.Position, x: 4, y: 2 },
      new SceneryComponent(),
      new RenderComponent({ section: RenderSection.Game }),
    ]);

    const movementSystem = new MovementSystem();

    it('should allow movement onto pickable entities', () => {
      store.set(entitiesAtom, [player, pickableItem, walkableFloor]);
      store.set(mapAtom, new GameMap());

      const currentPlayers = getEntitiesWithComponent(ComponentType.Player);
      expect(currentPlayers).toHaveLength(1);
      let currentPlayer = currentPlayers[0];
      setComponent(currentPlayer!, new VelocityComponent({ vx: 1, vy: 0 }));
      movementSystem.update(createStandardUpdateArgs());

      const updatedCurrentPlayers = getEntitiesWithComponent(
        ComponentType.Player,
      );
      expect(updatedCurrentPlayers).toHaveLength(1);
      currentPlayer = updatedCurrentPlayers[0];
      const position = getComponentAbsolute(
        currentPlayer!,
        ComponentType.Position,
      );
      expect(position.x).toBe(3);
      expect(position.y).toBe(2);

      const entitiesAtPosition = getEntitiesAtPosition({ x: 3, y: 2 });
      expect(entitiesAtPosition.length).toBe(2);
    });

    it('should allow movement onto walkable entities', () => {
      const currentPlayers = getEntitiesWithComponent(ComponentType.Player);
      expect(currentPlayers).toHaveLength(1);
      let currentPlayer = currentPlayers[0];

      setComponent(currentPlayer!, new VelocityComponent({ vx: 1, vy: 0 }));
      movementSystem.update(createStandardUpdateArgs());

      const updatedCurrentPlayers = getEntitiesWithComponent(
        ComponentType.Player,
      );
      expect(updatedCurrentPlayers).toHaveLength(1);
      currentPlayer = updatedCurrentPlayers[0];
      const position = getComponentAbsolute(
        currentPlayer!,
        ComponentType.Position,
      );
      expect(position.x).toBe(4);
      expect(position.y).toBe(2);

      const entitiesAtPosition = getEntitiesAtPosition({ x: 4, y: 2 });
      expect(entitiesAtPosition.length).toBe(2);
    });
  });

  describe('when pushing entities', () => {
    describe('with space available', () => {
      const player = createEntity(
        ConvenienceComponentSets.player({ x: 2, y: 2 }),
      );
      const movableBox = createEntity([
        { type: ComponentType.Position, x: 3, y: 2 },
        new MovableComponent(),
        { type: ComponentType.Sprite, spriteName: 'box' },
        new RenderComponent({ section: RenderSection.Game }),
      ]);

      const movementSystem = new MovementSystem();

      it('should push movable entity and move player', () => {
        store.set(entitiesAtom, [player, movableBox]);
        store.set(mapAtom, new GameMap());

        const currentPlayers = getEntitiesWithComponent(ComponentType.Player);
        expect(currentPlayers).toHaveLength(1);
        let currentPlayer = currentPlayers[0];
        setComponent(currentPlayer!, new VelocityComponent({ vx: 1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());

        const updatedCurrentPlayers = getEntitiesWithComponent(
          ComponentType.Player,
        );
        expect(updatedCurrentPlayers).toHaveLength(1);
        currentPlayer = updatedCurrentPlayers[0];
        const playerPosition = getComponentAbsolute(
          currentPlayer!,
          ComponentType.Position,
        );
        expect(playerPosition.x).toBe(3);
        expect(playerPosition.y).toBe(2);

        const entitiesAtNewBoxPosition = getEntitiesAtPosition({ x: 4, y: 2 });
        expect(entitiesAtNewBoxPosition.length).toBe(1);
        expect(entitiesAtNewBoxPosition[0].id).toBe(movableBox.id);
      });
    });

    describe('with target position blocked', () => {
      const player = createEntity(
        ConvenienceComponentSets.player({ x: 2, y: 2 }),
      );
      const movableBox = createEntity([
        { type: ComponentType.Position, x: 3, y: 2 },
        new MovableComponent(),
        { type: ComponentType.Sprite, spriteName: 'box' },
        new RenderComponent({ section: RenderSection.Game }),
      ]);
      const blockingWall = createEntity([
        { type: ComponentType.Position, x: 4, y: 2 },
        { type: ComponentType.Sprite, spriteName: 'wall' },
        new RenderComponent({ section: RenderSection.Game }),
      ]);

      const movementSystem = new MovementSystem();

      it('should prevent pushing and block player movement', () => {
        store.set(entitiesAtom, [player, movableBox, blockingWall]);
        store.set(mapAtom, new GameMap());

        const currentPlayers = getEntitiesWithComponent(ComponentType.Player);
        expect(currentPlayers).toHaveLength(1);
        let currentPlayer = currentPlayers[0];
        const originalPosition = getComponentAbsolute(
          currentPlayer!,
          ComponentType.Position,
        );

        setComponent(currentPlayer!, new VelocityComponent({ vx: 1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());

        const updatedCurrentPlayers = getEntitiesWithComponent(
          ComponentType.Player,
        );
        expect(updatedCurrentPlayers).toHaveLength(1);
        currentPlayer = updatedCurrentPlayers[0];
        const finalPosition = getComponentAbsolute(
          currentPlayer!,
          ComponentType.Position,
        );
        expect(finalPosition.x).toBe(originalPosition.x);
        expect(finalPosition.y).toBe(originalPosition.y);

        const entitiesAtBoxPosition = getEntitiesAtPosition({ x: 3, y: 2 });
        expect(entitiesAtBoxPosition.some((e) => e.id === movableBox.id)).toBe(
          true,
        );

        const velocity = getComponentAbsolute(
          currentPlayer!,
          ComponentType.Velocity,
        );
        expect(velocity.vx).toBe(0);
        expect(velocity.vy).toBe(0);
      });
    });

    describe('with multiple entities in chain', () => {
      const player = createEntity(
        ConvenienceComponentSets.player({ x: 5, y: 5 }),
      );
      const movableBox1 = createEntity([
        { type: ComponentType.Position, x: 6, y: 5 },
        new MovableComponent(),
        { type: ComponentType.Sprite, spriteName: 'box' },
        new RenderComponent({ section: RenderSection.Game }),
      ]);
      const movableBox2 = createEntity([
        { type: ComponentType.Position, x: 7, y: 5 },
        new MovableComponent(),
        { type: ComponentType.Sprite, spriteName: 'box' },
        new RenderComponent({ section: RenderSection.Game }),
      ]);

      const movementSystem = new MovementSystem();

      it('should not push all entities in chain', () => {
        store.set(entitiesAtom, [player, movableBox1, movableBox2]);
        store.set(mapAtom, new GameMap());

        const currentPlayers = getEntitiesWithComponent(ComponentType.Player);
        expect(currentPlayers).toHaveLength(1);
        let currentPlayer = currentPlayers[0];
        setComponent(currentPlayer!, new VelocityComponent({ vx: 1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());

        const updatedCurrentPlayers = getEntitiesWithComponent(
          ComponentType.Player,
        );
        expect(updatedCurrentPlayers).toHaveLength(1);
        currentPlayer = updatedCurrentPlayers[0];
        const playerPosition = getComponentAbsolute(
          currentPlayer!,
          ComponentType.Position,
        );
        expect(playerPosition.x).toBe(5);
        expect(playerPosition.y).toBe(5);

        const entitiesAtBox1Position = getEntitiesAtPosition({ x: 6, y: 5 });
        expect(
          entitiesAtBox1Position.some((e) => e.id === movableBox1.id),
        ).toBe(true);

        const entitiesAtBox2Position = getEntitiesAtPosition({ x: 7, y: 5 });
        expect(
          entitiesAtBox2Position.some((e) => e.id === movableBox2.id),
        ).toBe(true);
      });
    });
  });
});

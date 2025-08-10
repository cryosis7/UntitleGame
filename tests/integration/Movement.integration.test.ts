import { describe, expect, it } from 'vitest';
import {
  ConvenienceComponentSets,
  createStandardUpdateArgs,
} from '../helpers/testUtils';
import {
  ComponentType,
  MovableComponent,
  PickableComponent,
  VelocityComponent,
  WalkableComponent,
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
import { entitiesAtom, mapAtom, store } from '../../src/game/utils/Atoms';
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
      expect(players.length).toBe(1);
      const player = players[0];
      const position = getComponentAbsolute(player, ComponentType.Position);
      expect(position.x).toBe(5);
      expect(position.y).toBe(5);
    });

    it('should move player right', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players.length).toBe(1);
      let player = players[0];
      setComponent(player, new VelocityComponent({ vx: 1, vy: 0 }));
      movementSystem.update(createStandardUpdateArgs());

      const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
      expect(playersAfterMove.length).toBe(1);
      player = playersAfterMove[0];
      const position = getComponentAbsolute(player, ComponentType.Position);
      expect(position.x).toBe(6);
      expect(position.y).toBe(5);
    });

    it('should move player down', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players.length).toBe(1);
      let player = players[0];
      setComponent(player, new VelocityComponent({ vx: 0, vy: 1 }));
      movementSystem.update(createStandardUpdateArgs());

      const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
      expect(playersAfterMove.length).toBe(1);
      player = playersAfterMove[0];
      const position = getComponentAbsolute(player, ComponentType.Position);
      expect(position.x).toBe(6);
      expect(position.y).toBe(6);
    });

    it('should move player left', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players.length).toBe(1);
      let player = players[0];
      setComponent(player, new VelocityComponent({ vx: -1, vy: 0 }));
      movementSystem.update(createStandardUpdateArgs());

      const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
      expect(playersAfterMove.length).toBe(1);
      player = playersAfterMove[0];
      const position = getComponentAbsolute(player, ComponentType.Position);
      expect(position.x).toBe(5);
      expect(position.y).toBe(6);
    });

    it('should move player up', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players.length).toBe(1);
      let player = players[0];
      setComponent(player, new VelocityComponent({ vx: 0, vy: -1 }));
      movementSystem.update(createStandardUpdateArgs());

      const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
      expect(playersAfterMove.length).toBe(1);
      player = playersAfterMove[0];
      const position = getComponentAbsolute(player, ComponentType.Position);
      expect(position.x).toBe(5);
      expect(position.y).toBe(5);
    });

    it('should reset velocity after movement', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players.length).toBe(1);
      let player = players[0];
      setComponent(player, new VelocityComponent({ vx: 1, vy: 1 }));
      movementSystem.update(createStandardUpdateArgs());

      const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
      expect(playersAfterMove.length).toBe(1);
      player = playersAfterMove[0];
      const velocity = getComponentAbsolute(player, ComponentType.Velocity);
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
      ]);

      const movementSystem = new MovementSystem();

      it('should prevent movement and reset velocity', () => {
        store.set(entitiesAtom, [player, wall]);
        store.set(mapAtom, new GameMap());

        const players = getEntitiesWithComponent(ComponentType.Player);
        expect(players.length).toBe(1);
        let currentPlayer = players[0];
        setComponent(currentPlayer, new VelocityComponent({ vx: 1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());

        const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
        expect(playersAfterMove.length).toBe(1);
        currentPlayer = playersAfterMove[0];
        const position = getComponentAbsolute(
          currentPlayer,
          ComponentType.Position,
        );
        expect(position.x).toBe(2);
        expect(position.y).toBe(2);

        const velocity = getComponentAbsolute(
          currentPlayer,
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

        const players = getEntitiesWithComponent(ComponentType.Player);
        expect(players.length).toBe(1);
        let currentPlayer = players[0];

        setComponent(currentPlayer, new VelocityComponent({ vx: -1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());

        const playersAfterFirstMove = getEntitiesWithComponent(ComponentType.Player);
        expect(playersAfterFirstMove.length).toBe(1);
        currentPlayer = playersAfterFirstMove[0];
        let position = getComponentAbsolute(
          currentPlayer,
          ComponentType.Position,
        );
        expect(position.x).toBe(0);
        expect(position.y).toBe(0);

        setComponent(currentPlayer, new VelocityComponent({ vx: 0, vy: -1 }));
        movementSystem.update(createStandardUpdateArgs());

        const playersAfterSecondMove = getEntitiesWithComponent(ComponentType.Player);
        expect(playersAfterSecondMove.length).toBe(1);
        currentPlayer = playersAfterSecondMove[0];
        position = getComponentAbsolute(currentPlayer, ComponentType.Position);
        expect(position.x).toBe(0);
        expect(position.y).toBe(0);

        const velocity = getComponentAbsolute(
          currentPlayer,
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
    ]);
    const walkableFloor = createEntity([
      { type: ComponentType.Position, x: 4, y: 2 },
      new WalkableComponent(),
    ]);

    const movementSystem = new MovementSystem();

    it('should allow movement onto pickable entities', () => {
      store.set(entitiesAtom, [player, pickableItem, walkableFloor]);
      store.set(mapAtom, new GameMap());

      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players.length).toBe(1);
      let currentPlayer = players[0];
      setComponent(currentPlayer, new VelocityComponent({ vx: 1, vy: 0 }));
      movementSystem.update(createStandardUpdateArgs());

      const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
      expect(playersAfterMove.length).toBe(1);
      currentPlayer = playersAfterMove[0];
      const position = getComponentAbsolute(
        currentPlayer,
        ComponentType.Position,
      );
      expect(position.x).toBe(3);
      expect(position.y).toBe(2);

      const entitiesAtPosition = getEntitiesAtPosition({ x: 3, y: 2 });
      expect(entitiesAtPosition.length).toBe(2);
    });

    it('should allow movement onto walkable entities', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players.length).toBe(1);
      let currentPlayer = players[0];

      setComponent(currentPlayer, new VelocityComponent({ vx: 1, vy: 0 }));
      movementSystem.update(createStandardUpdateArgs());

      const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
      expect(playersAfterMove.length).toBe(1);
      currentPlayer = playersAfterMove[0];
      const position = getComponentAbsolute(
        currentPlayer,
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
      ]);

      const movementSystem = new MovementSystem();

      it('should push movable entity and move player', () => {
        store.set(entitiesAtom, [player, movableBox]);
        store.set(mapAtom, new GameMap());

        const players = getEntitiesWithComponent(ComponentType.Player);
        expect(players.length).toBe(1);
        let currentPlayer = players[0];
        setComponent(currentPlayer, new VelocityComponent({ vx: 1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());

        const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
        expect(playersAfterMove.length).toBe(1);
        currentPlayer = playersAfterMove[0];
        const playerPosition = getComponentAbsolute(
          currentPlayer,
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
      ]);
      const blockingWall = createEntity([
        { type: ComponentType.Position, x: 4, y: 2 },
        { type: ComponentType.Sprite, spriteName: 'wall' },
      ]);

      const movementSystem = new MovementSystem();

      it('should prevent pushing and block player movement', () => {
        store.set(entitiesAtom, [player, movableBox, blockingWall]);
        store.set(mapAtom, new GameMap());

        const players = getEntitiesWithComponent(ComponentType.Player);
        expect(players.length).toBe(1);
        let currentPlayer = players[0];
        const originalPosition = getComponentAbsolute(
          currentPlayer,
          ComponentType.Position,
        );

        setComponent(currentPlayer, new VelocityComponent({ vx: 1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());

        const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
        expect(playersAfterMove.length).toBe(1);
        currentPlayer = playersAfterMove[0];
        const finalPosition = getComponentAbsolute(
          currentPlayer,
          ComponentType.Position,
        );
        expect(finalPosition.x).toBe(originalPosition.x);
        expect(finalPosition.y).toBe(originalPosition.y);

        const entitiesAtBoxPosition = getEntitiesAtPosition({ x: 3, y: 2 });
        expect(entitiesAtBoxPosition.some((e) => e.id === movableBox.id)).toBe(
          true,
        );

        const velocity = getComponentAbsolute(
          currentPlayer,
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
      ]);
      const movableBox2 = createEntity([
        { type: ComponentType.Position, x: 7, y: 5 },
        new MovableComponent(),
        { type: ComponentType.Sprite, spriteName: 'box' },
      ]);

      const movementSystem = new MovementSystem();

      it('should not push all entities in chain', () => {
        store.set(entitiesAtom, [player, movableBox1, movableBox2]);
        store.set(mapAtom, new GameMap());

        const players = getEntitiesWithComponent(ComponentType.Player);
        expect(players.length).toBe(1);
        let currentPlayer = players[0];
        setComponent(currentPlayer, new VelocityComponent({ vx: 1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());

        const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
        expect(playersAfterMove.length).toBe(1);
        currentPlayer = playersAfterMove[0];
        const playerPosition = getComponentAbsolute(
          currentPlayer,
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

  describe('Multiple players scenario', () => {
    it('should handle multiple players moving independently', () => {
      const player1 = createEntity(
        ConvenienceComponentSets.player({ x: 0, y: 0 }),
      );
      const player2 = createEntity(
        ConvenienceComponentSets.player({ x: 3, y: 3 }),
      );

      const movementSystem = new MovementSystem();

      // Initialize with multiple players
      store.set(entitiesAtom, [player1, player2]);
      store.set(mapAtom, new GameMap());

      // Verify we have 2 players
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players.length).toBe(2);

      // Set different velocities for each player
      setComponent(players[0], new VelocityComponent({ vx: 1, vy: 1 }));
      setComponent(players[1], new VelocityComponent({ vx: -1, vy: -1 }));
      movementSystem.update(createStandardUpdateArgs());

      // Both players should have moved independently
      const playersAfterMove = getEntitiesWithComponent(ComponentType.Player);
      expect(playersAfterMove.length).toBe(2);

      const positions = playersAfterMove.map(player => {
        const pos = getComponentAbsolute(player, ComponentType.Position);
        return { x: pos.x, y: pos.y };
      });

      // Players should have moved to their new positions
      expect(positions).toContainEqual({ x: 1, y: 1 });
      expect(positions).toContainEqual({ x: 2, y: 2 });

      // Both players' velocities should be reset
      playersAfterMove.forEach(player => {
        const velocity = getComponentAbsolute(player, ComponentType.Velocity);
        expect(velocity.vx).toBe(0);
        expect(velocity.vy).toBe(0);
      });
    });
  });
});

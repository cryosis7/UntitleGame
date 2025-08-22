import { describe, expect, it } from 'vitest';
import {
  ConvenienceComponentSets,
  createStandardUpdateArgs,
} from '../helpers/testUtils';
import {
  ComponentType,
  HandlingComponent,
  InteractingComponent,
  VelocityComponent,
} from '../../src/game/components';
import {
  getComponentAbsolute,
  getComponentIfExists,
  hasComponent,
  setComponent,
} from '../../src/game/components/ComponentOperations';
import { createEntity } from '../../src/game/utils/EntityFactory';
import { PickupSystem } from '../../src/game/systems/PickupSystem';
import { MovementSystem } from '../../src/game/systems/MovementSystem';
import { ItemInteractionSystem } from '../../src/game/systems/ItemInteractionSystem';
import {
  getEntitiesAtPosition,
  getEntitiesWithComponent,
  getEntity,
} from '../../src/game/utils/EntityUtils';
import { entitiesAtom, mapAtom, store } from '../../src/game/atoms';
import { GameMap } from '../../src/game/map/GameMap';

describe('Item Usage Integration Test', () => {
  describe('Full workflow: move to key → pickup key → move to chest → use key → chest opens', () => {
    const originalKey = createEntity(
      ConvenienceComponentSets.key({ x: 1, y: 1 }, 'unlock'),
    );
    const originalPlayer = createEntity(
      ConvenienceComponentSets.player({ x: 0, y: 0 }),
    );
    const originalChest = createEntity(
      ConvenienceComponentSets.chest({ x: 5, y: 5 }, 'unlock'),
    );

    const pickupSystem = new PickupSystem();
    const movementSystem = new MovementSystem();
    const itemInteractionSystem = new ItemInteractionSystem();

    it('should initialize systems', () => {
      store.set(entitiesAtom, [originalPlayer, originalKey, originalChest]);
      store.set(mapAtom, new GameMap());
    });

    it('should move player to key position', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      let player = players[0];
      expect(player).toBeDefined();
      const positionComponent = getComponentAbsolute(
        player!,
        ComponentType.Position,
      );
      expect(positionComponent.x).toEqual(0);
      expect(positionComponent.y).toEqual(0);

      setComponent(player!, new VelocityComponent({ vx: 1, vy: 1 }));
      movementSystem.update(createStandardUpdateArgs());

      const updatedPlayers = getEntitiesWithComponent(ComponentType.Player);
      expect(updatedPlayers).toHaveLength(1);
      player = updatedPlayers[0];
      expect(player).toBeDefined();
      const playerPositionAfterMove = getComponentAbsolute(
        player!,
        ComponentType.Position,
      );
      expect(playerPositionAfterMove.x).toBe(1);
      expect(playerPositionAfterMove.y).toBe(1);
    });

    it('should pick up the key', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      let player = players[0];
      setComponent(player!, new HandlingComponent());
      pickupSystem.update(createStandardUpdateArgs());

      // Verify key was picked up
      const updatedPlayers = getEntitiesWithComponent(ComponentType.Player);
      expect(updatedPlayers).toHaveLength(1);
      player = updatedPlayers[0];
      expect(player).toBeDefined();
      const carriedItemComponent = getComponentAbsolute(
        player!,
        ComponentType.CarriedItem,
      );
      expect(carriedItemComponent).toBeDefined();
      expect(carriedItemComponent.item).toBe(originalKey.id);
    });

    it('should remove key from map after pickup', () => {
      const keyAfterPickup = getEntity(originalKey.id);
      expect(keyAfterPickup).toBeDefined();
      expect(hasComponent(keyAfterPickup!, ComponentType.Position)).toBeFalsy();
    });

    it('should remove handling component from player after pickup', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      const player = players[0];
      const handlingComponent = getComponentIfExists(
        player!,
        ComponentType.Handling,
      );
      expect(handlingComponent).toBeUndefined();
    });

    it('should move player to chest position', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      let player = players[0];

      // Move right 4 tiles
      for (let i = 0; i < 4; i++) {
        setComponent(player!, new VelocityComponent({ vx: 1, vy: 0 }));
        movementSystem.update(createStandardUpdateArgs());
        const updatedPlayers = getEntitiesWithComponent(ComponentType.Player);
        expect(updatedPlayers).toHaveLength(1);
        player = updatedPlayers[0];
        expect(player).toBeDefined();
      }

      // Move down 3 tiles
      for (let i = 0; i < 3; i++) {
        setComponent(player!, new VelocityComponent({ vx: 0, vy: 1 }));
        movementSystem.update(createStandardUpdateArgs());
        const updatedPlayers = getEntitiesWithComponent(ComponentType.Player);
        expect(updatedPlayers).toHaveLength(1);
        player = updatedPlayers[0];
        expect(player).toBeDefined();
      }

      const playerPosition = getComponentAbsolute(
        player!,
        ComponentType.Position,
      );
      expect(playerPosition.x).toBe(5);
      expect(playerPosition.y).toBe(4);

      // Velocity should be reset after movement
      const playerVelocity = getComponentAbsolute(
        player!,
        ComponentType.Velocity,
      );
      expect(playerVelocity.vx).toBe(0);
      expect(playerVelocity.vy).toBe(0);
    });

    it('should use key to open chest', () => {
      const players = getEntitiesWithComponent(ComponentType.Player);
      expect(players).toHaveLength(1);
      let player = players[0];

      setComponent(player!, new InteractingComponent());
      itemInteractionSystem.update(createStandardUpdateArgs());

      const updatedPlayers = getEntitiesWithComponent(ComponentType.Player);
      expect(updatedPlayers).toHaveLength(1);
      player = updatedPlayers[0];
      expect(player).toBeDefined();
      expect(hasComponent(player!, ComponentType.Interacting)).toBeFalsy();
      expect(hasComponent(player!, ComponentType.CarriedItem)).toBeFalsy();
    });

    it('should open the chest', () => {
      // After interaction, chest is replaced with a new entity, so find it by position
      const entitiesAtPosition = getEntitiesAtPosition({ x: 5, y: 5 });
      expect(entitiesAtPosition.length).toBe(1);

      const chest = entitiesAtPosition[0];
      expect(chest).toBeDefined();
      expect(hasComponent(chest, ComponentType.RequiresItem)).toBeFalsy();
      expect(
        getComponentAbsolute(chest, ComponentType.Sprite).spriteName,
      ).toEqual('chest_open');
    });
  });
});

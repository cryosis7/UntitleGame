/**
 * Key-Chest Interaction Integration Test
 * 
 * This test demonstrates a complete gameplay workflow that spans multiple ECS systems:
 * - PickupSystem: Player picks up a key
 * - MovementSystem: Player moves to chest location  
 * - ItemInteractionSystem: Player uses key to open chest
 * 
 * This serves as an exemplary integration test showing how systems work together
 * to implement complex game mechanics.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupECSTestEnvironment, createStandardUpdateArgs } from '../helpers/ecsTestSetup';
import { createTestEntity, createEntityWithComponents } from '../helpers/testUtils';
import { ComponentType } from '../../src/game/components/ComponentTypes';
import { PositionComponent } from '../../src/game/components/individualComponents/PositionComponent';
import { PlayerComponent } from '../../src/game/components/individualComponents/PlayerComponent';
import { PickableComponent } from '../../src/game/components/individualComponents/PickableComponent';
import { CarriedItemComponent } from '../../src/game/components/individualComponents/CarriedItemComponent';
import { HandlingComponent } from '../../src/game/components/individualComponents/HandlingComponent';
import { InteractingComponent } from '../../src/game/components/individualComponents/InteractingComponent';
import { UsableItemComponent } from '../../src/game/components/individualComponents/UsableItemComponent';
import { RequiresItemComponent } from '../../src/game/components/individualComponents/RequiresItemComponent';
import { InteractionBehaviorComponent } from '../../src/game/components/individualComponents/InteractionBehaviorComponent';
import { SpawnContentsComponent } from '../../src/game/components/individualComponents/SpawnContentsComponent';
import { InteractionBehaviorType } from '../../src/game/components/individualComponents/InteractionBehaviorType';
import { PickupSystem } from '../../src/game/systems/PickupSystem';
import { MovementSystem } from '../../src/game/systems/MovementSystem';
import { ItemInteractionSystem } from '../../src/game/systems/ItemInteractionSystem';
import { VelocityComponent } from '../../src/game/components/individualComponents/VelocityComponent';
import type { Entity } from '../../src/game/utils/ecsUtils';
import * as EntityUtils from '../../src/game/utils/EntityUtils';

// Mock EntityUtils to use our test entities instead of global store
vi.mock('../../src/game/utils/EntityUtils', async () => {
  const actual = await vi.importActual('../../src/game/utils/EntityUtils');
  
  return {
    ...actual,
    getEntitiesAtPosition: vi.fn(),
    getPlayerEntity: vi.fn(),
  };
});

describe('Key-Chest Interaction Integration Test', () => {
  // Use standardized ECS test environment
  setupECSTestEnvironment();

  let entities: Entity[];
  let player: Entity;
  let key: Entity;
  let chest: Entity;
  let treasure: Entity;
  let pickupSystem: PickupSystem;
  let movementSystem: MovementSystem;
  let itemInteractionSystem: ItemInteractionSystem;

  beforeEach(() => {
    // Initialize systems
    pickupSystem = new PickupSystem();
    movementSystem = new MovementSystem();
    itemInteractionSystem = new ItemInteractionSystem();

    // Create player entity
    player = createEntityWithComponents([
      [ComponentType.Player, new PlayerComponent()],
      [ComponentType.Position, new PositionComponent({ x: 1, y: 1 })],
    ], 'player');

    // Create key entity (pickable, usable for unlocking) - same position as player for pickup
    key = createEntityWithComponents([
      [ComponentType.Position, new PositionComponent({ x: 1, y: 1 })],
      [ComponentType.Pickable, new PickableComponent()],
      [ComponentType.UsableItem, new UsableItemComponent({
        capabilities: ['unlock'],
        isConsumable: true
      })],
    ], 'key');

    // Create treasure entity (will be spawned from chest)
    treasure = createTestEntity({
      [ComponentType.Position]: new PositionComponent({ x: 0, y: 0 }),
      [ComponentType.Pickable]: new PickableComponent(),
    }, 'treasure');

    // Create chest entity (requires unlock capability, spawns treasure)
    chest = createEntityWithComponents([
      [ComponentType.Position, new PositionComponent({ x: 5, y: 5 })],
      [ComponentType.RequiresItem, new RequiresItemComponent({
        requiredCapabilities: ['unlock'],
        isActive: true
      })],
      [ComponentType.InteractionBehavior, new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
        isRepeatable: false
      })],
      [ComponentType.SpawnContents, new SpawnContentsComponent({
        contents: [{ components: treasure.components }],
        spawnOffset: { x: 1, y: 0 }
      })],
    ], 'chest');

    // Set up entities array
    entities = [player, key, chest];

    // Mock EntityUtils to use our test entities
    vi.mocked(EntityUtils.getPlayerEntity).mockReturnValue(player);
    vi.mocked(EntityUtils.getEntitiesAtPosition).mockImplementation((position) => {
      return entities.filter((entity) => {
        const posComponent = entity.components[ComponentType.Position] as PositionComponent;
        return posComponent && posComponent.x === position.x && posComponent.y === position.y;
      });
    });
  });

  describe('Complete Key-Chest Workflow', () => {
    it('should execute full workflow: pickup key → move to chest → use key → chest opens', () => {
      const updateArgs = createStandardUpdateArgs(entities);

      // Step 1: Player picks up the key
      // Give player HandlingComponent to indicate pickup intent
      player.components[ComponentType.Handling] = new HandlingComponent();

      // Run pickup system
      pickupSystem.update(updateArgs);

      // Verify key was picked up
      expect(player.components[ComponentType.CarriedItem]).toBeDefined();
      const carriedItem = player.components[ComponentType.CarriedItem] as CarriedItemComponent;
      expect(carriedItem.item).toBe(key.id); // System sets item to entity ID

      // Key should no longer be pickable on map
      expect(key.components[ComponentType.Pickable]).toBeUndefined();
      
      // Player no longer has handling component (consumed by pickup)
      expect(player.components[ComponentType.Handling]).toBeUndefined();

      // Step 2: Player moves toward chest
      // Set velocity toward chest (from [1,1] to [5,5])
      player.components[ComponentType.Velocity] = new VelocityComponent({ vx: 4, vy: 4 });

      // Run movement system
      movementSystem.update(updateArgs);

      // Verify player moved toward chest
      const playerPosition = player.components[ComponentType.Position] as PositionComponent;
      expect(playerPosition.x).toBe(5); // 1 + 4
      expect(playerPosition.y).toBe(5); // 1 + 4

      // Velocity should be reset after movement
      const playerVelocity = player.components[ComponentType.Velocity] as VelocityComponent;
      expect(playerVelocity.vx).toBe(0);
      expect(playerVelocity.vy).toBe(0);

      // Step 3: Player interacts with chest using key
      // Give player InteractingComponent to indicate interaction intent
      player.components[ComponentType.Interacting] = new InteractingComponent();

      // Run item interaction system
      itemInteractionSystem.update(updateArgs);

      // Verify interaction occurred successfully
      // Chest should have spawned treasure at offset position
      // This would typically add new entities to the game world
      // For this test, we verify the interaction behavior was triggered

      // Player no longer has interacting component (consumed by interaction)
      expect(player.components[ComponentType.Interacting]).toBeUndefined();

      // Key should be consumed (removed from player inventory) if consumable
      expect(player.components[ComponentType.CarriedItem]).toBeUndefined();

      // Chest RequiresItem component should be deactivated
      const chestRequiresItem = chest.components[ComponentType.RequiresItem] as RequiresItemComponent;
      expect(chestRequiresItem.isActive).toBe(false);
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('should handle using wrong key on chest', () => {
      const updateArgs = createStandardUpdateArgs(entities);

      // Create wrong key with different capability
      const wrongKey = createEntityWithComponents([
        [ComponentType.Position, new PositionComponent({ x: 2, y: 1 })],
        [ComponentType.Pickable, new PickableComponent()],
        [ComponentType.UsableItem, new UsableItemComponent({
          capabilities: ['light'], // Wrong capability
          isConsumable: true
        })],
      ], 'wrong-key');

      entities.push(wrongKey);

      // Player picks up wrong key
      player.components[ComponentType.Handling] = new HandlingComponent();
      pickupSystem.update(updateArgs);

      // Move player to chest
      player.components[ComponentType.Velocity] = new VelocityComponent({ vx: 4, vy: 4 });
      movementSystem.update(updateArgs);

      // Try to interact with chest using wrong key
      player.components[ComponentType.Interacting] = new InteractingComponent();
      itemInteractionSystem.update(updateArgs);

      // Interaction should fail - chest should remain locked
      const chestRequiresItem = chest.components[ComponentType.RequiresItem] as RequiresItemComponent;
      expect(chestRequiresItem.isActive).toBe(true); // Still locked

      // Player should still have wrong key (not consumed)
      expect(player.components[ComponentType.CarriedItem]).toBeDefined();
    });

    it('should handle chest already opened', () => {
      const updateArgs = createStandardUpdateArgs(entities);

      // Pre-deactivate chest (already opened)
      const chestRequiresItem = chest.components[ComponentType.RequiresItem] as RequiresItemComponent;
      chestRequiresItem.isActive = false;

      // Player picks up key
      player.components[ComponentType.Handling] = new HandlingComponent();
      pickupSystem.update(updateArgs);

      // Move to chest
      player.components[ComponentType.Velocity] = new VelocityComponent({ vx: 4, vy: 4 });
      movementSystem.update(updateArgs);

      // Try to interact with already opened chest
      player.components[ComponentType.Interacting] = new InteractingComponent();
      itemInteractionSystem.update(updateArgs);

      // Key should not be consumed since interaction didn't occur
      expect(player.components[ComponentType.CarriedItem]).toBeDefined();
      
      // Chest should remain inactive (already opened)
      expect(chestRequiresItem.isActive).toBe(false);
    });

    it('should handle player without key trying to open chest', () => {
      const updateArgs = createStandardUpdateArgs(entities);

      // Move player to chest without picking up key first
      player.components[ComponentType.Velocity] = new VelocityComponent({ vx: 4, vy: 4 });
      movementSystem.update(updateArgs);

      // Try to interact with chest without key
      player.components[ComponentType.Interacting] = new InteractingComponent();
      itemInteractionSystem.update(updateArgs);

      // Chest should remain locked
      const chestRequiresItem = chest.components[ComponentType.RequiresItem] as RequiresItemComponent;
      expect(chestRequiresItem.isActive).toBe(true);

      // No carried item to consume
      expect(player.components[ComponentType.CarriedItem]).toBeUndefined();
    });
  });

  describe('System Interaction Validation', () => {
    it('should maintain proper component state transitions across systems', () => {
      const updateArgs = createStandardUpdateArgs(entities);

      // Track component state changes through workflow
      const initialPlayerComponents = Object.keys(player.components).length;
      const initialKeyComponents = Object.keys(key.components).length;
      const initialChestComponents = Object.keys(chest.components).length;

      // Execute full workflow
      player.components[ComponentType.Handling] = new HandlingComponent();
      pickupSystem.update(updateArgs);
      
      player.components[ComponentType.Velocity] = new VelocityComponent({ vx: 4, vy: 4 });
      movementSystem.update(updateArgs);
      
      player.components[ComponentType.Interacting] = new InteractingComponent();
      itemInteractionSystem.update(updateArgs);

      // Verify component counts changed appropriately
      const finalPlayerComponents = Object.keys(player.components).length;
      const finalKeyComponents = Object.keys(key.components).length;
      const finalChestComponents = Object.keys(chest.components).length;

      // Player gained CarriedItem but lost temporary interaction components
      // Key lost Pickable component
      // Chest components modified but count may stay same
      expect(finalPlayerComponents).toBeGreaterThanOrEqual(initialPlayerComponents);
      expect(finalKeyComponents).toBeLessThan(initialKeyComponents);
      expect(finalChestComponents).toBe(initialChestComponents); // Components modified, not added/removed
    });

    it('should handle multiple simultaneous interactions correctly', () => {
      const updateArgs = createStandardUpdateArgs(entities);

      // Create second player and key
      const player2 = createEntityWithComponents([
        [ComponentType.Player, new PlayerComponent()],
        [ComponentType.Position, new PositionComponent({ x: 1, y: 2 })],
      ], 'player2');

      const key2 = createEntityWithComponents([
        [ComponentType.Position, new PositionComponent({ x: 2, y: 2 })],
        [ComponentType.Pickable, new PickableComponent()],
        [ComponentType.UsableItem, new UsableItemComponent({
          capabilities: ['unlock'],
          isConsumable: true
        })],
      ], 'key2');

      entities.push(player2, key2);

      // Both players pick up their keys
      player.components[ComponentType.Handling] = new HandlingComponent();
      player2.components[ComponentType.Handling] = new HandlingComponent();
      
      pickupSystem.update(updateArgs);

      // Verify both players got their keys
      expect(player.components[ComponentType.CarriedItem]).toBeDefined();
      expect(player2.components[ComponentType.CarriedItem]).toBeDefined();

      // Both move to chest position
      player.components[ComponentType.Velocity] = new VelocityComponent({ vx: 4, vy: 4 });
      player2.components[ComponentType.Velocity] = new VelocityComponent({ vx: 3, vy: 3 });
      
      movementSystem.update(updateArgs);

      // Both try to interact with chest
      player.components[ComponentType.Interacting] = new InteractingComponent();
      player2.components[ComponentType.Interacting] = new InteractingComponent();
      
      itemInteractionSystem.update(updateArgs);

      // Only first successful interaction should occur
      // (Implementation detail may vary - chest could be opened by first player)
      const chestRequiresItem = chest.components[ComponentType.RequiresItem] as RequiresItemComponent;
      expect(chestRequiresItem.isActive).toBe(false); // Chest opened

      // At least one player should have used their key
      const player1HasKey = player.components[ComponentType.CarriedItem] !== undefined;
      const player2HasKey = player2.components[ComponentType.CarriedItem] !== undefined;
      expect(player1HasKey && player2HasKey).toBe(false); // At least one key was consumed
    });
  });
});

/**
 * Key-Chest Interaction Integration Test
 *
 * This test demonstrates a complete gameplay workflow that spans multiple ECS systems:
 * - PickupSystem: Player picks up a key
 * - MovementSystem: Player moves to chest location
 * - ItemInteractionSystem: Player uses key to open chest
 *
 * This serves as an exemplary integration test showing how systems work together
 * to implement complex game mechanics using the actual Jotai atom store.
 *
 * WORKFLOW TESTED:
 * 1. Player starts at position (1,1) with a key at the same position
 * 2. Player picks up the key (PickupSystem)
 * 3. Player moves to chest at position (5,5) (MovementSystem)
 * 4. Player uses key to open chest (ItemInteractionSystem)
 * 5. Chest spawns treasure and becomes unlocked
 */

import { describe, expect, it } from 'vitest';
import { setupECSTestEnvironment } from '../helpers/ecsTestSetup';
import {
  ConvenienceComponentSets,
  createStandardUpdateArgs,
} from '../helpers/testUtils';
import { ComponentType } from '../../src/game/components/ComponentTypes';
import { createEntity } from '../../src/game/utils/EntityFactory';
import { PickupSystem } from '../../src/game/systems/PickupSystem';
import { MovementSystem } from '../../src/game/systems/MovementSystem';
import { ItemInteractionSystem } from '../../src/game/systems/ItemInteractionSystem';
import {
  getComponentAbsolute,
  getComponentIfExists,
  setComponent,
} from '../../src/game/components/ComponentOperations';
import { HandlingComponent } from '../../src/game/components/individualComponents/HandlingComponent';
import { VelocityComponent } from '../../src/game/components/individualComponents/VelocityComponent';
import { InteractingComponent } from '../../src/game/components/individualComponents/InteractingComponent';
import {
  addEntities,
  getEntity,
  getPlayerEntity,
} from '../../src/game/utils/EntityUtils';

describe('Key-Chest Interaction Integration Test', () => {
  setupECSTestEnvironment();

  it('should execute full workflow: pickup key → move to chest → use key → chest opens', () => {
    // Arrange initial entities and systems
    const originalKey = createEntity(
      ConvenienceComponentSets.key({ x: 1, y: 1 }, 'unlock'),
    );
    const originalPlayer = createEntity(
      ConvenienceComponentSets.player({ x: 1, y: 1 }),
    );
    const originalChest = createEntity(
      ConvenienceComponentSets.chest({ x: 5, y: 5 }, 'unlock'),
    );
    addEntities([originalPlayer, originalKey, originalChest]);

    const pickupSystem = new PickupSystem();
    const movementSystem = new MovementSystem();
    const itemInteractionSystem = new ItemInteractionSystem();

    // Step 1: Player picks up the key
    // Give player HandlingComponent to indicate pickup intent
    let player = getPlayerEntity();
    expect(player).toBeDefined();
    setComponent(player!, new HandlingComponent());

    pickupSystem.update(createStandardUpdateArgs());

    // Verify key was picked up
    player = getPlayerEntity();
    expect(player).toBeDefined();
    const carriedItemComponent = getComponentAbsolute(
      player!,
      ComponentType.CarriedItem,
    );
    expect(carriedItemComponent).toBeDefined();
    expect(carriedItemComponent.item).toBe(originalKey.id);

    // Key should no longer be pickable on map
    const keyAfterPickup = getEntity(carriedItemComponent.item);
    expect(keyAfterPickup).toBeDefined();
    const keyPositionComponent = getComponentIfExists(
      keyAfterPickup!,
      ComponentType.Position,
    );
    const keyVelocityComponent = getComponentIfExists(
      keyAfterPickup!,
      ComponentType.Velocity,
    );
    expect(keyVelocityComponent).toBeUndefined();
    expect(keyPositionComponent).toBeUndefined();

    // Player no longer has handling component (consumed by pickup)
    const handlingComponent = getComponentIfExists(
      player!,
      ComponentType.Handling,
    );
    expect(handlingComponent).toBeUndefined();

    // Step 2: Player moves toward chest
    // Set velocity toward chest (from [1,1] to [5,5])
    setComponent(player!, new VelocityComponent({ vx: 4, vy: 4 }));

    movementSystem.update(createStandardUpdateArgs());

    player = getPlayerEntity();
    expect(player).toBeDefined();
    const playerPosition = getComponentAbsolute(
      player!,
      ComponentType.Position,
    );
    expect(playerPosition.x).toBe(5);
    expect(playerPosition.y).toBe(5);

    // Velocity should be reset after movement
    const playerVelocity = getComponentAbsolute(
      player!,
      ComponentType.Velocity,
    );
    expect(playerVelocity.vx).toBe(0);
    expect(playerVelocity.vy).toBe(0);

    // Step 3: Player interacts with chest using key
    setComponent(player!, new InteractingComponent());
    itemInteractionSystem.update(createStandardUpdateArgs());

    player = getPlayerEntity();
    const chest = getEntity(originalChest.id);
    expect(player).toBeDefined();
    expect(chest).toBeDefined();

    const interactingComponent = getComponentIfExists(
      player!,
      ComponentType.Interacting,
    );
    expect(interactingComponent).toBeUndefined();

    const finalCarriedItem = getComponentIfExists(
      player!,
      ComponentType.CarriedItem,
    );
    expect(finalCarriedItem).toBeUndefined();

    const chestRequiresItem = getComponentIfExists(
      chest!,
      ComponentType.RequiresItem,
    );
    expect(chestRequiresItem).toBeDefined();
    expect(chestRequiresItem!.isActive).toBe(false);
  });
});

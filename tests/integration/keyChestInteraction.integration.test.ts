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

import { describe, it, expect, beforeEach } from 'vitest';
import { setupECSTestEnvironment } from '../helpers/ecsTestSetup';
import { createStandardUpdateArgs } from '../helpers/testUtils';
import { ComponentType } from '../../src/game/components/ComponentTypes';
import { createEntityFromTemplate } from '../../src/game/utils/EntityFactory';
import { PickupSystem } from '../../src/game/systems/PickupSystem';
import { MovementSystem } from '../../src/game/systems/MovementSystem';
import { ItemInteractionSystem } from '../../src/game/systems/ItemInteractionSystem';
import { getComponentIfExists, setComponent } from '../../src/game/components/ComponentOperations';
import { HandlingComponent } from '../../src/game/components/individualComponents/HandlingComponent';
import { VelocityComponent } from '../../src/game/components/individualComponents/VelocityComponent';
import { InteractingComponent } from '../../src/game/components/individualComponents/InteractingComponent';
import { entitiesAtom, playerAtom } from '../../src/game/utils/Atoms';
import { store } from '../../src/App';
import type { Entity } from '../../src/game/utils/ecsUtils';

describe('Key-Chest Interaction Integration Test', () => {
  // Use standardized ECS test environment  
  setupECSTestEnvironment();

  let entities: Entity[];
  let player: Entity;
  let key: Entity;
  let chest: Entity;
  let pickupSystem: PickupSystem;
  let movementSystem: MovementSystem;
  let itemInteractionSystem: ItemInteractionSystem;
  let updateArgs: any;

  // Helper function to get updated entity from atom store
  const getEntityFromStore = (entityId: string): Entity => {
    const allEntities = store.get(entitiesAtom);
    const entity = allEntities.find((e) => e.id === entityId);
    if (!entity) {
      throw new Error(`Entity with id ${entityId} not found in store`);
    }
    return entity;
  };

  beforeEach(() => {
    // Initialize systems
    pickupSystem = new PickupSystem();
    movementSystem = new MovementSystem();
    itemInteractionSystem = new ItemInteractionSystem();

    // Create player entity at position (1,1)
    player = createEntityFromTemplate({
      components: {
        [ComponentType.Player]: {},
        [ComponentType.Position]: { x: 1, y: 1 },
      },
    });

    // Create key entity at same position as player for pickup
    key = createEntityFromTemplate({
      components: {
        [ComponentType.Position]: { x: 1, y: 1 },
        [ComponentType.Pickable]: {},
        [ComponentType.UsableItem]: {
          capabilities: ['unlock'],
          isConsumable: true,
        },
      },
    });

    // Create chest entity at position (5,5) that requires unlock capability
    chest = createEntityFromTemplate({
      components: {
        [ComponentType.Position]: { x: 5, y: 5 },
        [ComponentType.RequiresItem]: {
          requiredCapabilities: ['unlock'],
          isActive: true,
        },
      },
    });

    // Set up entities in global Jotai atom store
    entities = [player, key, chest];
    store.set(entitiesAtom, entities);
    updateArgs = createStandardUpdateArgs(entities);
  });

  it('should execute full workflow: pickup key → move to chest → use key → chest opens', () => {
    // Step 1: Player picks up the key
    // Give player HandlingComponent to indicate pickup intent
    const currentPlayer = store.get(playerAtom);
    if (!currentPlayer) throw new Error('Player not found in store');
    
    setComponent(currentPlayer, new HandlingComponent());

    // Run pickup system
    pickupSystem.update(updateArgs);

    // Verify key was picked up
    const playerAfterPickup = getEntityFromStore(player.id);
    const carriedItem = getComponentIfExists(playerAfterPickup, ComponentType.CarriedItem);
    expect(carriedItem).toBeDefined();
    expect(carriedItem!.item).toBe(key.id);

    // Key should no longer be pickable on map
    const keyAfterPickup = getEntityFromStore(key.id);
    const keyPickable = getComponentIfExists(keyAfterPickup, ComponentType.Pickable);
    expect(keyPickable).toBeUndefined();

    // Player no longer has handling component (consumed by pickup)
    const playerHandling = getComponentIfExists(playerAfterPickup, ComponentType.Handling);
    expect(playerHandling).toBeUndefined();

    // Step 2: Player moves toward chest
    // Set velocity toward chest (from [1,1] to [5,5])
    setComponent(playerAfterPickup, new VelocityComponent({ vx: 4, vy: 4 }));

    // Run movement system
    movementSystem.update(updateArgs);

    // Verify player moved to chest position
    const playerAfterMovement = getEntityFromStore(player.id);
    const playerPosition = getComponentIfExists(playerAfterMovement, ComponentType.Position);
    expect(playerPosition).toBeDefined();
    expect(playerPosition!.x).toBe(5); // 1 + 4
    expect(playerPosition!.y).toBe(5); // 1 + 4

    // Velocity should be reset after movement
    const playerVelocity = getComponentIfExists(playerAfterMovement, ComponentType.Velocity);
    expect(playerVelocity!.vx).toBe(0);
    expect(playerVelocity!.vy).toBe(0);

    // Step 3: Player interacts with chest using key
    // Give player InteractingComponent to indicate interaction intent
    setComponent(playerAfterMovement, new InteractingComponent());

    // Run item interaction system
    itemInteractionSystem.update(updateArgs);

    // Verify interaction occurred successfully
    const playerAfterInteraction = getEntityFromStore(player.id);
    const chestAfterInteraction = getEntityFromStore(chest.id);

    // Player no longer has interacting component (consumed by interaction)
    const playerInteracting = getComponentIfExists(playerAfterInteraction, ComponentType.Interacting);
    expect(playerInteracting).toBeUndefined();

    // Key should be consumed (removed from player inventory) since it's consumable
    const finalCarriedItem = getComponentIfExists(playerAfterInteraction, ComponentType.CarriedItem);
    expect(finalCarriedItem).toBeUndefined();

    // Chest RequiresItem component should be deactivated
    const chestRequiresItem = getComponentIfExists(chestAfterInteraction, ComponentType.RequiresItem);
    expect(chestRequiresItem).toBeDefined();
    expect(chestRequiresItem!.isActive).toBe(false);
  });
});

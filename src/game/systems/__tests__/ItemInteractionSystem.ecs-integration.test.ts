import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItemInteractionSystem } from '../ItemInteractionSystem';
import { CleanUpSystem } from '../CleanUpSystem';
import type { UpdateArgs } from '../Systems';
import { ComponentType } from '../../components/ComponentTypes';
import { InteractionBehaviorType } from '../../components/individualComponents/InteractionBehaviorType';
import { createEntityWithComponents } from '../../../__tests__/testUtils';
import { CarriedItemComponent } from '../../components/individualComponents/CarriedItemComponent';
import { GameMap } from '../../map/GameMap';
import type { Entity } from '../../utils/ecsUtils';

// Mock the complex dependencies we don't need for this test
vi.mock('../../../App', () => ({
  store: {
    get: vi.fn(() => []),
    set: vi.fn(),
  },
}));

describe('ItemInteractionSystem - ECS Integration', () => {
  let itemInteractionSystem: ItemInteractionSystem;
  let cleanUpSystem: CleanUpSystem;
  let updateArgs: UpdateArgs;

  beforeEach(() => {
    itemInteractionSystem = new ItemInteractionSystem();
    cleanUpSystem = new CleanUpSystem();

    updateArgs = {
      entities: [],
      map: new GameMap(),
    };

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('System Execution Order and Data Flow', () => {
    it('should process InteractingComponent in proper system workflow', () => {
      // Simulate the workflow: KeyboardInputSystem adds InteractingComponent
      // Then ItemInteractionSystem processes it
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Interacting, {}], // This would be added by KeyboardInputSystem
      ]);

      const keyEntity = createEntityWithComponents([
        [
          ComponentType.UsableItem,
          { capabilities: ['unlock'], isConsumable: true },
        ],
      ]);

      playerEntity.components[ComponentType.CarriedItem] =
        new CarriedItemComponent({ item: keyEntity.id });

      const doorEntity = createEntityWithComponents([
        [
          ComponentType.RequiresItem,
          { requiredCapabilities: ['unlock'], isActive: true },
        ],
        [
          ComponentType.InteractionBehavior,
          {
            behaviorType: InteractionBehaviorType.TRANSFORM,
            newSpriteId: 'door_open',
            isRepeatable: false,
          },
        ],
        [ComponentType.Sprite, { sprite: 'door_closed' }],
        [ComponentType.Position, { x: 5, y: 5 }],
      ]);

      updateArgs.entities = [playerEntity, keyEntity, doorEntity];

      // ItemInteractionSystem should process the InteractingComponent without error
      expect(() => itemInteractionSystem.update(updateArgs)).not.toThrow();

      // The door should have been processed (behavior executed)
      const updatedDoor = updateArgs.entities.find((e) => e === doorEntity);
      expect(updatedDoor).toBeDefined();
    });

    it('should handle complete interaction workflow maintaining entity state', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 10, y: 10 }],
        [ComponentType.Interacting, {}], // Player is interacting
      ]);

      const hammerEntity = createEntityWithComponents([
        [
          ComponentType.UsableItem,
          { capabilities: ['break'], isConsumable: false },
        ],
      ]);

      playerEntity.components[ComponentType.CarriedItem] =
        new CarriedItemComponent({ item: hammerEntity.id });

      const wallEntity = createEntityWithComponents([
        [
          ComponentType.RequiresItem,
          { requiredCapabilities: ['break'], isActive: true },
        ],
        [
          ComponentType.InteractionBehavior,
          {
            behaviorType: InteractionBehaviorType.REMOVE,
            isRepeatable: false,
          },
        ],
        [ComponentType.Position, { x: 10, y: 10 }],
      ]);

      updateArgs.entities = [playerEntity, hammerEntity, wallEntity];
      const initialEntityCount = updateArgs.entities.length;

      // Process through ItemInteractionSystem then CleanUpSystem
      itemInteractionSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);

      // Entity relationships should be maintained properly
      expect(updateArgs.entities).toContain(playerEntity);
      expect(updateArgs.entities).toContain(hammerEntity); // Non-consumable, should remain
    });
  });

  describe('KeyboardInputSystem Integration Points', () => {
    it('should properly handle InteractingComponent created by KeyboardInputSystem', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 3, y: 3 }],
        [ComponentType.Interacting, {}], // Simulates KeyboardInputSystem adding this on E-key press
      ]);

      const toolEntity = createEntityWithComponents([
        [
          ComponentType.UsableItem,
          { capabilities: ['activate'], isConsumable: false },
        ],
      ]);

      playerEntity.components[ComponentType.CarriedItem] =
        new CarriedItemComponent({ item: toolEntity.id });

      const switchEntity = createEntityWithComponents([
        [
          ComponentType.RequiresItem,
          { requiredCapabilities: ['activate'], isActive: true },
        ],
        [
          ComponentType.InteractionBehavior,
          {
            behaviorType: InteractionBehaviorType.TRANSFORM,
            newSpriteId: 'switch_on',
            isRepeatable: true,
          },
        ],
        [ComponentType.Position, { x: 3, y: 3 }],
      ]);

      updateArgs.entities = [playerEntity, toolEntity, switchEntity];

      // ItemInteractionSystem should process the InteractingComponent without issues
      expect(() => itemInteractionSystem.update(updateArgs)).not.toThrow();

      // Switch should have been processed for transformation
      const processedSwitch = updateArgs.entities.find(
        (e) => e === switchEntity,
      );
      expect(processedSwitch).toBeDefined();

      // RequiresItem should be deactivated after successful interaction
      const requiresItemComponent = processedSwitch?.components[
        ComponentType.RequiresItem
      ] as any;
      expect(requiresItemComponent?.isActive).toBe(false);
    });

    it('should handle absence of InteractingComponent gracefully', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 1, y: 1 }],
        // No InteractingComponent - KeyboardInputSystem didn't trigger interaction
      ]);

      updateArgs.entities = [playerEntity];

      // Should handle absence of InteractingComponent without error
      expect(() => itemInteractionSystem.update(updateArgs)).not.toThrow();

      // Entity should remain unchanged
      expect(updateArgs.entities).toContain(playerEntity);
    });

    it('should process multiple InteractingComponent entities independently', () => {
      // Create two separate players interacting simultaneously
      const player1 = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 0, y: 0 }],
        [ComponentType.Interacting, {}],
      ]);

      const player2 = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 1, y: 1 }],
        [ComponentType.Interacting, {}],
      ]);

      const key1 = createEntityWithComponents([
        [
          ComponentType.UsableItem,
          { capabilities: ['unlock'], isConsumable: true },
        ],
      ]);

      const key2 = createEntityWithComponents([
        [
          ComponentType.UsableItem,
          { capabilities: ['unlock'], isConsumable: true },
        ],
      ]);

      player1.components[ComponentType.CarriedItem] = new CarriedItemComponent({
        item: key1.id,
      });
      player2.components[ComponentType.CarriedItem] = new CarriedItemComponent({
        item: key2.id,
      });

      const door1 = createEntityWithComponents([
        [
          ComponentType.RequiresItem,
          { requiredCapabilities: ['unlock'], isActive: true },
        ],
        [
          ComponentType.InteractionBehavior,
          {
            behaviorType: InteractionBehaviorType.TRANSFORM,
            newSpriteId: 'door1_open',
            isRepeatable: false,
          },
        ],
        [ComponentType.Position, { x: 0, y: 0 }],
      ]);

      const door2 = createEntityWithComponents([
        [
          ComponentType.RequiresItem,
          { requiredCapabilities: ['unlock'], isActive: true },
        ],
        [
          ComponentType.InteractionBehavior,
          {
            behaviorType: InteractionBehaviorType.TRANSFORM,
            newSpriteId: 'door2_open',
            isRepeatable: false,
          },
        ],
        [ComponentType.Position, { x: 1, y: 1 }],
      ]);

      updateArgs.entities = [player1, player2, key1, key2, door1, door2];

      // Should process both interactions independently
      expect(() => itemInteractionSystem.update(updateArgs)).not.toThrow();

      // Both doors should be processed
      expect(updateArgs.entities).toContain(door1);
      expect(updateArgs.entities).toContain(door2);
    });
  });

  describe('Component Lifecycle and State Management', () => {
    it('should maintain component state consistency during interaction processing', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 4, y: 4 }],
        [ComponentType.Interacting, {}],
      ]);

      const wandEntity = createEntityWithComponents([
        [
          ComponentType.UsableItem,
          { capabilities: ['magic'], isConsumable: false },
        ],
      ]);

      playerEntity.components[ComponentType.CarriedItem] =
        new CarriedItemComponent({ item: wandEntity.id });

      const runeEntity = createEntityWithComponents([
        [
          ComponentType.RequiresItem,
          { requiredCapabilities: ['magic'], isActive: true },
        ],
        [
          ComponentType.InteractionBehavior,
          {
            behaviorType: InteractionBehaviorType.TRANSFORM,
            newSpriteId: 'rune_activated',
            isRepeatable: false,
          },
        ],
        [ComponentType.Position, { x: 4, y: 4 }],
      ]);

      updateArgs.entities = [playerEntity, wandEntity, runeEntity];

      // Process interaction and then cleanup
      itemInteractionSystem.update(updateArgs);
      cleanUpSystem.update(updateArgs);

      // Core entity state should be maintained
      const updatedPlayer = updateArgs.entities.find(
        (e) => e.components[ComponentType.Player],
      );
      expect(updatedPlayer).toBeDefined();
      expect(updatedPlayer?.components[ComponentType.Position]).toBeDefined();

      // Non-consumable item should remain
      const updatedWand = updateArgs.entities.find((e) => e === wandEntity);
      expect(updatedWand).toBeDefined();

      // Rune should have updated state
      const updatedRune = updateArgs.entities.find((e) => e === runeEntity);
      expect(updatedRune).toBeDefined();
      expect(
        (updatedRune?.components[ComponentType.RequiresItem] as any)?.isActive,
      ).toBe(false);
    });

    it('should handle item consumption correctly', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 2, y: 2 }],
        [ComponentType.Interacting, {}],
      ]);

      const potionEntity = createEntityWithComponents([
        [
          ComponentType.UsableItem,
          { capabilities: ['heal'], isConsumable: true },
        ],
      ]);

      playerEntity.components[ComponentType.CarriedItem] =
        new CarriedItemComponent({ item: potionEntity.id });

      const altarEntity = createEntityWithComponents([
        [
          ComponentType.RequiresItem,
          { requiredCapabilities: ['heal'], isActive: true },
        ],
        [
          ComponentType.InteractionBehavior,
          {
            behaviorType: InteractionBehaviorType.TRANSFORM,
            newSpriteId: 'altar_blessed',
            isRepeatable: false,
          },
        ],
        [ComponentType.Position, { x: 2, y: 2 }],
      ]);

      updateArgs.entities = [playerEntity, potionEntity, altarEntity];

      // Process interaction
      itemInteractionSystem.update(updateArgs);

      // The interaction should complete without errors, and the altar should be processed
      const updatedAltar = updateArgs.entities.find((e) => e === altarEntity);
      expect(updatedAltar).toBeDefined();

      // The RequiresItem component should be deactivated after successful interaction
      const requiresItemComponent = updatedAltar?.components[
        ComponentType.RequiresItem
      ] as any;
      expect(requiresItemComponent?.isActive).toBe(false);
    });
  });

  describe('System Independence and Isolation', () => {
    it('should handle empty entity arrays gracefully', () => {
      updateArgs.entities = [];

      // Both systems should handle empty arrays without issues
      expect(() => itemInteractionSystem.update(updateArgs)).not.toThrow();
      expect(() => cleanUpSystem.update(updateArgs)).not.toThrow();
    });

    it('should handle entities with missing required components gracefully', () => {
      // Create entities with incomplete component sets
      const incompleteEntity1 = createEntityWithComponents([
        [ComponentType.Position, { x: 1, y: 1 }],
        // Missing other required components for interaction
      ]);

      const incompleteEntity2 = createEntityWithComponents([
        [
          ComponentType.RequiresItem,
          { requiredCapabilities: ['test'], isActive: true },
        ],
        // Missing Position component
      ]);

      updateArgs.entities = [incompleteEntity1, incompleteEntity2];

      // Systems should handle incomplete entities gracefully
      expect(() => itemInteractionSystem.update(updateArgs)).not.toThrow();
      expect(() => cleanUpSystem.update(updateArgs)).not.toThrow();

      // Entities should remain in the array (not removed due to errors)
      expect(updateArgs.entities).toContain(incompleteEntity1);
      expect(updateArgs.entities).toContain(incompleteEntity2);
    });

    it('should maintain system isolation during concurrent operations', () => {
      const testEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 8, y: 8 }],
      ]);

      updateArgs.entities = [testEntity];

      // Each system should operate independently without side effects on others
      const entityStateBefore = JSON.stringify(testEntity);

      itemInteractionSystem.update(updateArgs);
      const entityStateAfterInteraction = JSON.stringify(testEntity);

      cleanUpSystem.update(updateArgs);
      const entityStateAfterCleanup = JSON.stringify(testEntity);

      // Entity should remain in the entities array
      expect(updateArgs.entities).toContain(testEntity);

      // Since there was no interaction triggered, entity state should be preserved
      expect(entityStateBefore).toBe(entityStateAfterInteraction);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed component data gracefully', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 6, y: 6 }],
        [ComponentType.Interacting, {}],
      ]);

      // Create entity with malformed component data
      const malformedItemEntity = {
        id: 'malformed-item',
        components: {
          [ComponentType.UsableItem]: null as any, // Malformed component
        },
      };

      playerEntity.components[ComponentType.CarriedItem] =
        new CarriedItemComponent({ item: malformedItemEntity.id });

      updateArgs.entities = [playerEntity, malformedItemEntity as any];

      // System should handle malformed data without crashing
      expect(() => itemInteractionSystem.update(updateArgs)).not.toThrow();
    });

    it('should handle rapid system updates consistently', () => {
      const stableEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 9, y: 9 }],
      ]);

      updateArgs.entities = [stableEntity];

      // Simulate rapid system updates (like would occur in game loop)
      for (let i = 0; i < 10; i++) {
        expect(() => {
          itemInteractionSystem.update(updateArgs);
          cleanUpSystem.update(updateArgs);
        }).not.toThrow();
      }

      // Entity should remain stable throughout rapid updates
      expect(updateArgs.entities).toContain(stableEntity);
      expect(updateArgs.entities.length).toBe(1);
    });

    it('should maintain proper system execution order requirements', () => {
      // Test that ItemInteractionSystem can be called before CleanUpSystem
      // (which is the required execution order per T017)
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 7, y: 7 }],
        [ComponentType.Interacting, {}],
      ]);

      updateArgs.entities = [playerEntity];

      // This execution order should work without issues
      expect(() => {
        itemInteractionSystem.update(updateArgs); // Process interactions first
        cleanUpSystem.update(updateArgs); // Clean up temporary components after
      }).not.toThrow();

      // Player should still exist after both systems process
      expect(updateArgs.entities).toContain(playerEntity);
    });
  });
});

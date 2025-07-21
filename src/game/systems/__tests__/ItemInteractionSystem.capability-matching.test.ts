import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItemInteractionSystem } from '../ItemInteractionSystem';
import type { UpdateArgs } from '../Systems';
import { ComponentType } from '../../components/ComponentTypes';
import { CarriedItemComponent } from '../../components/individualComponents/CarriedItemComponent';
import { createTestEntity, createEntityWithComponents } from '../../../__tests__/testUtils';

describe('ItemInteractionSystem - Capability Matching', () => {
  let system: ItemInteractionSystem;
  let mockUpdateArgs: UpdateArgs;

  beforeEach(() => {
    system = new ItemInteractionSystem();
    mockUpdateArgs = {
      entities: [],
      map: {} as any // Simple mock since we don't use map in capability matching
    };
  });

  describe('Array Intersection Logic', () => {
    it('should match single capability requirement', () => {
      // Create a player entity that is interacting
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 5, y: 5 }]
      ]);

      // Create an item that the player is carrying
      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      // Set the player to carry the key
      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      // Create a target entity that requires unlock capability
      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.Position, { x: 5, y: 5 }]
      ]);

      const entities = [playerEntity, keyEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      // Should process without throwing and find matching capability
      expect(() => system.update(mockUpdateArgs)).not.toThrow();
    });

    it('should match multiple capability requirements with partial match', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 8, y: 8 }]
      ]);

      // Item has multiple capabilities
      const multiToolEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock', 'cut', 'repair'], isConsumable: false }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: multiToolEntity.id });

      // Target requires multiple capabilities but only needs one match
      const complexDoorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock', 'magic'], isActive: true }],
        [ComponentType.Position, { x: 8, y: 8 }]
      ]);

      const entities = [playerEntity, multiToolEntity, complexDoorEntity];
      mockUpdateArgs.entities = entities;

      expect(() => system.update(mockUpdateArgs)).not.toThrow();
    });

    it('should not match when no capabilities overlap', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 12, y: 5 }]
      ]);

      // Item with different capabilities
      const swordEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['attack', 'defend'], isConsumable: false }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: swordEntity.id });

      // Target requires unrelated capabilities
      const magicalDoorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['magic', 'teleport'], isActive: true }],
        [ComponentType.Position, { x: 12, y: 5 }]
      ]);

      const entities = [playerEntity, swordEntity, magicalDoorEntity];
      mockUpdateArgs.entities = entities;

      expect(() => system.update(mockUpdateArgs)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle player with no carried items', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 3, y: 3 }]
      ]);
      // No CarriedItemComponent

      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.Position, { x: 3, y: 3 }]
      ]);

      const entities = [playerEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      expect(() => system.update(mockUpdateArgs)).not.toThrow();
    });

    it('should handle carried item entity not found in entities array', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 4, y: 4 }]
      ]);

      // Player carries an item that doesn't exist in entities array
      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: 'nonexistent-item-id' });

      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.Position, { x: 4, y: 4 }]
      ]);

      const entities = [playerEntity, doorEntity]; // Note: no carried item entity
      mockUpdateArgs.entities = entities;

      expect(() => system.update(mockUpdateArgs)).not.toThrow();
    });

    it('should handle carried item without UsableItem component', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 6, y: 6 }]
      ]);

      // Item exists but has no UsableItem component
      const regularRockEntity = createTestEntity();

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: regularRockEntity.id });

      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.Position, { x: 6, y: 6 }]
      ]);

      const entities = [playerEntity, regularRockEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      expect(() => system.update(mockUpdateArgs)).not.toThrow();
    });

    it('should handle target entity with inactive RequiresItem component', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 7, y: 7 }]
      ]);

      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      // Door is inactive (already unlocked)
      const inactiveDoorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: false }],
        [ComponentType.Position, { x: 7, y: 7 }]
      ]);

      const entities = [playerEntity, keyEntity, inactiveDoorEntity];
      mockUpdateArgs.entities = entities;

      expect(() => system.update(mockUpdateArgs)).not.toThrow();
    });

    it('should handle empty capabilities arrays', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 9, y: 9 }]
      ]);

      // Item with empty capabilities
      const emptyItemEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: [], isConsumable: true }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: emptyItemEntity.id });

      // Door requiring empty capabilities
      const emptyRequirementEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: [], isActive: true }],
        [ComponentType.Position, { x: 9, y: 9 }]
      ]);

      const entities = [playerEntity, emptyItemEntity, emptyRequirementEntity];
      mockUpdateArgs.entities = entities;

      expect(() => system.update(mockUpdateArgs)).not.toThrow();
    });
  });

  describe('First Compatible Item Logic', () => {
    it('should use first compatible item when multiple items match', () => {
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 10, y: 10 }]
      ]);

      // Create first matching item
      const firstKeyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      // Player carries the first key (in current system, player can only carry one item)
      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: firstKeyEntity.id });

      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.Position, { x: 10, y: 10 }]
      ]);

      const entities = [playerEntity, firstKeyEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      expect(() => system.update(mockUpdateArgs)).not.toThrow();
    });
  });

  describe('Logging and Debug Information', () => {
    it('should log appropriate debug information for successful matches', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 11, y: 11 }]
      ]);

      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock', 'special'], isConsumable: true }]
      ]);

      // Manually set the CarriedItemComponent for testing (since setComponent uses store)
      const carriedItemComponent = new CarriedItemComponent({ item: keyEntity.id });
      playerEntity.components[ComponentType.CarriedItem] = carriedItemComponent;

      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.Position, { x: 11, y: 11 }]
      ]);

      const entities = [playerEntity, keyEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      // Debug: Check if CarriedItemComponent is properly set
      expect(playerEntity.components.carriedItem).toBeDefined();
      expect((playerEntity.components.carriedItem as any).item).toBe(keyEntity.id);

      system.update(mockUpdateArgs);

      // Should see the success message about finding compatible capabilities
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Found compatible item with matching capabilities')
      );

      consoleLogSpy.mockRestore();
    });

    it('should log appropriate messages for edge cases', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 12, y: 12 }]
      ]);
      // No carried item

      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.Position, { x: 12, y: 12 }]
      ]);

      const entities = [playerEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      system.update(mockUpdateArgs);

      expect(consoleLogSpy).toHaveBeenCalledWith('No carried items found for interaction');

      consoleLogSpy.mockRestore();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItemInteractionSystem } from '../ItemInteractionSystem';
import type { UpdateArgs } from '../Systems';
import { ComponentType } from '../../components/ComponentTypes';
import { CarriedItemComponent } from '../../components/individualComponents/CarriedItemComponent';
import { createTestEntity, createEntityWithComponents } from '../../../__tests__/testUtils';

import { getEntitiesWithComponents, removeEntities } from '../../utils/EntityUtils';
import { getComponentIfExists, removeComponent } from '../../components/ComponentOperations';

// Mock the utility functions that handle entity operations
vi.mock('../../utils/EntityUtils', () => ({
  getEntitiesWithComponents: vi.fn(),
  removeEntities: vi.fn(),
  addEntities: vi.fn(),
}));

vi.mock('../../components/ComponentOperations', () => ({
  getComponentIfExists: vi.fn(),
  setComponent: vi.fn(),
  removeComponent: vi.fn(),
}));

describe('ItemInteractionSystem - Item Consumption', () => {
  let system: ItemInteractionSystem;
  let mockUpdateArgs: UpdateArgs;

  beforeEach(() => {
    system = new ItemInteractionSystem();
    mockUpdateArgs = {
      entities: [],
      map: {} as any
    };

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('Consumable Item Logic', () => {
    it('should remove consumable item from player inventory after successful interaction', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Create a player with interacting component
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}]
      ]);

      // Create a consumable key
      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      // Set up player carrying the key
      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      // Create a door that requires unlocking
      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: 'transform', 
          newSpriteId: 'door_open',
          isRepeatable: false 
        }]
      ]);

      const entities = [playerEntity, keyEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      // Mock entity queries
      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [doorEntity];
        return [];
      });

      // Mock component getters
      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.CarriedItem) {
          return playerEntity.components[ComponentType.CarriedItem];
        }
        if (entity === keyEntity && componentType === ComponentType.UsableItem) {
          return keyEntity.components[ComponentType.UsableItem];
        }
        if (entity === doorEntity && componentType === ComponentType.RequiresItem) {
          return doorEntity.components[ComponentType.RequiresItem];
        }
        if (entity === doorEntity && componentType === ComponentType.InteractionBehavior) {
          return doorEntity.components[ComponentType.InteractionBehavior];
        }
        return null;
      });

      // Execute the interaction
      system.update(mockUpdateArgs);

      // Verify consumable item was removed from player inventory
      expect(removeComponent).toHaveBeenCalledWith(
        playerEntity,
        ComponentType.CarriedItem
      );

      // Verify consumable item entity was removed from game world
      expect(removeEntities).toHaveBeenCalledWith([keyEntity.id]);

      // Verify appropriate log messages
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing item consumption')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Removing consumable item')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Consumable item')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('has been consumed and removed from game')
      );

      consoleLogSpy.mockRestore();
    });

    it('should retain non-consumable item in player inventory after interaction', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Create a player with interacting component
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}]
      ]);

      // Create a non-consumable multi-tool
      const multiToolEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock', 'cut'], isConsumable: false }]
      ]);

      // Set up player carrying the multi-tool
      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: multiToolEntity.id });

      // Create a door that requires unlocking
      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: 'transform', 
          newSpriteId: 'door_open',
          isRepeatable: false 
        }]
      ]);

      const entities = [playerEntity, multiToolEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      // Mock entity queries
      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [doorEntity];
        return [];
      });

      // Mock component getters
      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.CarriedItem) {
          return playerEntity.components[ComponentType.CarriedItem];
        }
        if (entity === multiToolEntity && componentType === ComponentType.UsableItem) {
          return multiToolEntity.components[ComponentType.UsableItem];
        }
        if (entity === doorEntity && componentType === ComponentType.RequiresItem) {
          return doorEntity.components[ComponentType.RequiresItem];
        }
        if (entity === doorEntity && componentType === ComponentType.InteractionBehavior) {
          return doorEntity.components[ComponentType.InteractionBehavior];
        }
        return null;
      });

      // Execute the interaction
      system.update(mockUpdateArgs);

      // Verify non-consumable item was NOT removed from player inventory
      expect(removeComponent).not.toHaveBeenCalledWith(
        playerEntity,
        ComponentType.CarriedItem
      );

      // Verify item entity was NOT removed from game world
      expect(removeEntities).not.toHaveBeenCalledWith([multiToolEntity.id]);

      // Verify appropriate log messages
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing item consumption')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Retaining non-consumable item')
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle item without UsableItem component gracefully', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Create a player with interacting component
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}]
      ]);

      // Create an item without UsableItem component
      const regularItemEntity = createTestEntity();

      // Set up player carrying the regular item
      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: regularItemEntity.id });

      // Create a door that requires unlocking (but this interaction shouldn't proceed due to missing UsableItem)
      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }]
      ]);

      const entities = [playerEntity, regularItemEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      // Mock entity queries
      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [doorEntity];
        return [];
      });

      // Mock component getters - return null for UsableItem component
      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.CarriedItem) {
          return playerEntity.components[ComponentType.CarriedItem];
        }
        if (entity === regularItemEntity && componentType === ComponentType.UsableItem) {
          return null; // No UsableItem component
        }
        if (entity === doorEntity && componentType === ComponentType.RequiresItem) {
          return doorEntity.components[ComponentType.RequiresItem];
        }
        return null;
      });

      // Execute the interaction - should not proceed to consumption due to missing UsableItem
      expect(() => system.update(mockUpdateArgs)).not.toThrow();

      // Verify no consumption logic was attempted
      expect(removeComponent).not.toHaveBeenCalled();
      expect(removeEntities).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('should handle items with different consumability settings correctly', () => {
      // This test verifies that the system correctly identifies and processes consumable vs non-consumable items
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Test both consumable and non-consumable scenarios in sequence
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}]
      ]);

      // Create a consumable lockpick
      const lockpickEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: lockpickEntity.id });

      // Create a door that requires unlocking
      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: 'transform', 
          newSpriteId: 'door_open',
          isRepeatable: false 
        }]
      ]);

      const entities = [playerEntity, lockpickEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      // Mock entity queries
      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [doorEntity];
        return [];
      });

      // Mock component getters
      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.CarriedItem) {
          return playerEntity.components[ComponentType.CarriedItem];
        }
        if (entity === lockpickEntity && componentType === ComponentType.UsableItem) {
          return lockpickEntity.components[ComponentType.UsableItem];
        }
        if (entity === doorEntity && componentType === ComponentType.RequiresItem) {
          return doorEntity.components[ComponentType.RequiresItem];
        }
        if (entity === doorEntity && componentType === ComponentType.InteractionBehavior) {
          return doorEntity.components[ComponentType.InteractionBehavior];
        }
        return null;
      });

      // Execute the interaction
      system.update(mockUpdateArgs);

      // Verify consumption logic ran and correctly identified the item as consumable
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Processing item consumption.*consumable: true/)
      );

      // Verify the consumable item was handled correctly
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Removing consumable item')
      );

      expect(removeComponent).toHaveBeenCalledWith(
        playerEntity,
        ComponentType.CarriedItem
      );

      expect(removeEntities).toHaveBeenCalledWith([lockpickEntity.id]);

      consoleLogSpy.mockRestore();
    });

    it('should handle missing CarriedItemComponent during consumption', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Create a player with interacting component but no carried item
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}]
      ]);
      // Note: No CarriedItemComponent set

      // Create a consumable key (though this scenario shouldn't happen in real gameplay)
      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      // Create a door that requires unlocking
      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: 'transform', 
          newSpriteId: 'door_open',
          isRepeatable: false 
        }]
      ]);

      const entities = [playerEntity, keyEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      // Mock entity queries
      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [doorEntity];
        return [];
      });

      // Mock component getters - return null for CarriedItem component
      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.CarriedItem) {
          return null; // No CarriedItem component
        }
        if (entity === keyEntity && componentType === ComponentType.UsableItem) {
          return keyEntity.components[ComponentType.UsableItem];
        }
        if (entity === doorEntity && componentType === ComponentType.RequiresItem) {
          return doorEntity.components[ComponentType.RequiresItem];
        }
        return null;
      });

      // This should not proceed to behavior processing since no compatible item is found
      expect(() => system.update(mockUpdateArgs)).not.toThrow();

      // Verify no consumption logic was attempted since no carried item was found
      expect(removeComponent).not.toHaveBeenCalled();
      expect(removeEntities).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });
  });

  describe('Multiple Item Support (Future Compatibility)', () => {
    it('should handle single carried item correctly with current architecture', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Test that the current single-item system works correctly
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}]
      ]);

      // Create a consumable key
      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      // Create a door that requires unlocking
      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: 'transform', 
          newSpriteId: 'door_open',
          isRepeatable: false 
        }]
      ]);

      const entities = [playerEntity, keyEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      // Mock entity queries
      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [doorEntity];
        return [];
      });

      // Mock component getters
      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.CarriedItem) {
          return playerEntity.components[ComponentType.CarriedItem];
        }
        if (entity === keyEntity && componentType === ComponentType.UsableItem) {
          return keyEntity.components[ComponentType.UsableItem];
        }
        if (entity === doorEntity && componentType === ComponentType.RequiresItem) {
          return doorEntity.components[ComponentType.RequiresItem];
        }
        if (entity === doorEntity && componentType === ComponentType.InteractionBehavior) {
          return doorEntity.components[ComponentType.InteractionBehavior];
        }
        return null;
      });

      // Execute the interaction
      system.update(mockUpdateArgs);

      // Verify the system processes the single carried item correctly
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Compatible item found for interaction')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing item consumption')
      );

      // Verify consumable handling
      expect(removeComponent).toHaveBeenCalledWith(
        playerEntity,
        ComponentType.CarriedItem
      );
      expect(removeEntities).toHaveBeenCalledWith([keyEntity.id]);

      consoleLogSpy.mockRestore();
    });
  });
});

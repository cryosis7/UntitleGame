import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItemInteractionSystem } from '../ItemInteractionSystem';
import type { UpdateArgs } from '../Systems';
import { ComponentType } from '../../components/ComponentTypes';
import { CarriedItemComponent } from '../../components/individualComponents/CarriedItemComponent';
import { InteractionBehaviorType } from '../../components/individualComponents/InteractionBehaviorType';
import { createTestEntity, createEntityWithComponents } from '../../../__tests__/testUtils';

import { getEntitiesWithComponents, removeEntities, addEntities } from '../../utils/EntityUtils';
import { createEntitiesFromTemplates } from '../../utils/EntityFactory';
import { getComponentIfExists, setComponent, removeComponent } from '../../components/ComponentOperations';

// Mock the utility functions that handle entity operations
vi.mock('../../utils/EntityUtils', () => ({
  getEntitiesWithComponents: vi.fn(),
  removeEntities: vi.fn(),
  addEntities: vi.fn(),
}));

vi.mock('../../utils/EntityFactory', () => ({
  createEntitiesFromTemplates: vi.fn(),
}));

vi.mock('../../components/ComponentOperations', () => ({
  getComponentIfExists: vi.fn(),
  setComponent: vi.fn(),
  removeComponent: vi.fn(),
}));

describe('ItemInteractionSystem - Behavior Processing', () => {
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

  describe('TRANSFORM Behavior', () => {
    it('should transform sprite and deactivate RequiresItem component', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Create a player with interacting component
      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 5, y: 5 }]
      ]);

      // Create a key item
      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      // Player carries the key
      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      // Create a door that transforms when unlocked (at same position as player)
      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: InteractionBehaviorType.TRANSFORM, 
          newSpriteId: 'door_open',
          isRepeatable: false 
        }],
        [ComponentType.Position, { x: 5, y: 5 }]
      ]);

      // Create sprite component mock
      const mockSpriteComponent = {
        sprite: { texture: { label: 'door_closed' } }
      };

      const entities = [playerEntity, keyEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      // Mock entity finding functions
      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[], entitiesArray: any[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) {
          return [playerEntity];
        }
        if (componentTypes.includes(ComponentType.RequiresItem)) {
          return [doorEntity];
        }
        return [];
      });

      // Mock component finding
      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.Position) {
          return playerEntity.components[ComponentType.Position];
        }
        if (entity === doorEntity && componentType === ComponentType.Position) {
          return doorEntity.components[ComponentType.Position];
        }
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
        if (entity === doorEntity && componentType === ComponentType.Sprite) {
          return mockSpriteComponent;
        }
        return null;
      });

      system.update(mockUpdateArgs);

      // Verify sprite was updated
      expect(mockSpriteComponent.sprite.texture.label).toBe('door_open');

      // Verify component was deactivated
      const requiresItemComponent = doorEntity.components[ComponentType.RequiresItem] as any;
      expect(requiresItemComponent.isActive).toBe(false);

      // Verify appropriate logging
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing behavior: transform')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Transformed entity sprite to: door_open')
      );

      consoleLogSpy.mockRestore();
    });

    it('should handle missing sprite component gracefully', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 5, y: 5 }]
      ]);

      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: InteractionBehaviorType.TRANSFORM, 
          newSpriteId: 'door_open',
          isRepeatable: false 
        }],
        [ComponentType.Position, { x: 5, y: 5 }]
      ]);

      const entities = [playerEntity, keyEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [doorEntity];
        return [];
      });

      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.Position) {
          return playerEntity.components[ComponentType.Position];
        }
        if (entity === doorEntity && componentType === ComponentType.Position) {
          return doorEntity.components[ComponentType.Position];
        }
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
        if (entity === doorEntity && componentType === ComponentType.Sprite) {
          return null; // No sprite component
        }
        return null;
      });

      expect(() => system.update(mockUpdateArgs)).not.toThrow();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Entity does not have Sprite component for TRANSFORM behavior')
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('REMOVE Behavior', () => {
    it('should remove entity from game world', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 3, y: 3 }]
      ]);

      const hammerEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['destroy'], isConsumable: false }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: hammerEntity.id });

      const wallEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['destroy'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: InteractionBehaviorType.REMOVE,
          isRepeatable: false 
        }],
        [ComponentType.Position, { x: 3, y: 3 }]
      ]);

      const entities = [playerEntity, hammerEntity, wallEntity];
      mockUpdateArgs.entities = entities;

      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [wallEntity];
        return [];
      });

      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.Position) {
          return playerEntity.components[ComponentType.Position];
        }
        if (entity === wallEntity && componentType === ComponentType.Position) {
          return wallEntity.components[ComponentType.Position];
        }
        if (entity === playerEntity && componentType === ComponentType.CarriedItem) {
          return playerEntity.components[ComponentType.CarriedItem];
        }
        if (entity === hammerEntity && componentType === ComponentType.UsableItem) {
          return hammerEntity.components[ComponentType.UsableItem];
        }
        if (entity === wallEntity && componentType === ComponentType.RequiresItem) {
          return wallEntity.components[ComponentType.RequiresItem];
        }
        if (entity === wallEntity && componentType === ComponentType.InteractionBehavior) {
          return wallEntity.components[ComponentType.InteractionBehavior];
        }
        return null;
      });

      system.update(mockUpdateArgs);

      // Verify removeEntities was called with the correct entity
      expect(removeEntities).toHaveBeenCalledWith([wallEntity.id]);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing behavior: remove')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Removing entity ${wallEntity.id} from game world`)
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('SPAWN_CONTENTS Behavior', () => {
    it('should spawn contents and remove original entity', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 10, y: 10 }]
      ]);

      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      const chestEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
          isRepeatable: false 
        }],
        [ComponentType.SpawnContents, {
          contents: [
            { components: { sprite: { sprite: 'gold_coin' }, pickable: {} } },
            { components: { sprite: { sprite: 'health_potion' }, pickable: {} } }
          ],
          spawnOffset: { x: 1, y: 0 }
        }],
        [ComponentType.Position, { x: 10, y: 10 }]
      ]);

      const entities = [playerEntity, keyEntity, chestEntity];
      mockUpdateArgs.entities = entities;

      // Mock created entities
      const mockSpawnedEntities = [
        createTestEntity({}, 'spawned-coin'),
        createTestEntity({}, 'spawned-potion')
      ];

      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [chestEntity];
        return [];
      });

      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.Position) {
          return playerEntity.components[ComponentType.Position];
        }
        if (entity === playerEntity && componentType === ComponentType.CarriedItem) {
          return playerEntity.components[ComponentType.CarriedItem];
        }
        if (entity === keyEntity && componentType === ComponentType.UsableItem) {
          return keyEntity.components[ComponentType.UsableItem];
        }
        if (entity === chestEntity && componentType === ComponentType.RequiresItem) {
          return chestEntity.components[ComponentType.RequiresItem];
        }
        if (entity === chestEntity && componentType === ComponentType.InteractionBehavior) {
          return chestEntity.components[ComponentType.InteractionBehavior];
        }
        if (entity === chestEntity && componentType === ComponentType.SpawnContents) {
          return chestEntity.components[ComponentType.SpawnContents];
        }
        if (entity === chestEntity && componentType === ComponentType.Position) {
          return chestEntity.components[ComponentType.Position];
        }
        return null;
      });

      (createEntitiesFromTemplates as any).mockReturnValue(mockSpawnedEntities);

      system.update(mockUpdateArgs);

      // Verify entities were created from templates
      expect(createEntitiesFromTemplates).toHaveBeenCalledWith(
        { components: { sprite: { sprite: 'gold_coin' }, pickable: {} } },
        { components: { sprite: { sprite: 'health_potion' }, pickable: {} } }
      );

      // Verify positions were set for spawned entities
      expect(setComponent).toHaveBeenCalledTimes(2); // Once for each spawned entity

      // Verify new entities were added
      expect(addEntities).toHaveBeenCalledWith(mockSpawnedEntities);

      // Verify original entity was removed
      expect(removeEntities).toHaveBeenCalledWith([chestEntity.id]);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing behavior: spawn_contents')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Spawning 2 entities at position (11, 10)')
      );

      consoleLogSpy.mockRestore();
    });

    it('should handle missing SpawnContents component', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 7, y: 8 }]
      ]);

      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      const chestEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
          isRepeatable: false 
        }],
        [ComponentType.Position, { x: 7, y: 8 }]
      ]);

      const entities = [playerEntity, keyEntity, chestEntity];
      mockUpdateArgs.entities = entities;

      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [chestEntity];
        return [];
      });

      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.Position) {
          return playerEntity.components[ComponentType.Position];
        }
        if (entity === chestEntity && componentType === ComponentType.Position) {
          return chestEntity.components[ComponentType.Position];
        }
        if (entity === playerEntity && componentType === ComponentType.CarriedItem) {
          return playerEntity.components[ComponentType.CarriedItem];
        }
        if (entity === keyEntity && componentType === ComponentType.UsableItem) {
          return keyEntity.components[ComponentType.UsableItem];
        }
        if (entity === chestEntity && componentType === ComponentType.RequiresItem) {
          return chestEntity.components[ComponentType.RequiresItem];
        }
        if (entity === chestEntity && componentType === ComponentType.InteractionBehavior) {
          return chestEntity.components[ComponentType.InteractionBehavior];
        }
        if (entity === chestEntity && componentType === ComponentType.SpawnContents) {
          return null; // No spawn contents component
        }
        return null;
      });

      expect(() => system.update(mockUpdateArgs)).not.toThrow();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Entity has SPAWN_CONTENTS behavior but no SpawnContentsComponent')
      );

      consoleLogSpy.mockRestore();
    });

    it('should handle missing Position component during spawn behavior', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Ensure createEntitiesFromTemplates returns an empty array for this test
      (createEntitiesFromTemplates as any).mockReturnValue([]);

      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 9, y: 12 }]
      ]);

      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      const chestEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
          isRepeatable: false 
        }],
        [ComponentType.SpawnContents, {
          contents: [{ components: { sprite: { sprite: 'gold_coin' } } }],
          spawnOffset: { x: 1, y: 0 }
        }],
        [ComponentType.Position, { x: 9, y: 12 }]
      ]);

      const entities = [playerEntity, keyEntity, chestEntity];
      mockUpdateArgs.entities = entities;

      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [chestEntity];
        return [];
      });

      // Mock that Position becomes unavailable at the spawn moment
      let positionCallCount = 0;
      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.Position) {
          return playerEntity.components[ComponentType.Position];
        }
        if (entity === chestEntity && componentType === ComponentType.Position) {
          positionCallCount++;
          // Allow position for proximity check (first call), but return null for spawn behavior (second call)
          if (positionCallCount <= 1) {
            return chestEntity.components[ComponentType.Position];
          } else {
            // At spawn time, position is not available
            return null;
          }
        }
        if (entity === playerEntity && componentType === ComponentType.CarriedItem) {
          return playerEntity.components[ComponentType.CarriedItem];
        }
        if (entity === keyEntity && componentType === ComponentType.UsableItem) {
          return keyEntity.components[ComponentType.UsableItem];
        }
        if (entity === chestEntity && componentType === ComponentType.RequiresItem) {
          return chestEntity.components[ComponentType.RequiresItem];
        }
        if (entity === chestEntity && componentType === ComponentType.InteractionBehavior) {
          return chestEntity.components[ComponentType.InteractionBehavior];
        }
        if (entity === chestEntity && componentType === ComponentType.SpawnContents) {
          return chestEntity.components[ComponentType.SpawnContents];
        }
        return null;
      });

      expect(() => system.update(mockUpdateArgs)).not.toThrow();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Cannot spawn contents - target entity has no Position component')
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing InteractionBehavior component', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 2, y: 3 }]
      ]);

      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      // Door has RequiresItem but no InteractionBehavior component
      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.Position, { x: 2, y: 3 }]
      ]);

      const entities = [playerEntity, keyEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [doorEntity];
        return [];
      });

      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.Position) {
          return playerEntity.components[ComponentType.Position];
        }
        if (entity === doorEntity && componentType === ComponentType.Position) {
          return doorEntity.components[ComponentType.Position];
        }
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
          return null; // No interaction behavior component
        }
        return null;
      });

      expect(() => system.update(mockUpdateArgs)).not.toThrow();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Target entity does not have InteractionBehavior component')
      );

      consoleLogSpy.mockRestore();
    });

    it('should handle unknown behavior types', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const playerEntity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Interacting, {}],
        [ComponentType.Position, { x: 6, y: 7 }]
      ]);

      const keyEntity = createEntityWithComponents([
        [ComponentType.UsableItem, { capabilities: ['unlock'], isConsumable: true }]
      ]);

      playerEntity.components[ComponentType.CarriedItem] = new CarriedItemComponent({ item: keyEntity.id });

      const doorEntity = createEntityWithComponents([
        [ComponentType.RequiresItem, { requiredCapabilities: ['unlock'], isActive: true }],
        [ComponentType.InteractionBehavior, { 
          behaviorType: 'unknown_behavior' as any,
          isRepeatable: false 
        }],
        [ComponentType.Position, { x: 6, y: 7 }]
      ]);

      const entities = [playerEntity, keyEntity, doorEntity];
      mockUpdateArgs.entities = entities;

      (getEntitiesWithComponents as any).mockImplementation((componentTypes: ComponentType[]) => {
        if (componentTypes.includes(ComponentType.Interacting)) return [playerEntity];
        if (componentTypes.includes(ComponentType.RequiresItem)) return [doorEntity];
        return [];
      });

      (getComponentIfExists as any).mockImplementation((entity: any, componentType: ComponentType) => {
        if (entity === playerEntity && componentType === ComponentType.Position) {
          return playerEntity.components[ComponentType.Position];
        }
        if (entity === doorEntity && componentType === ComponentType.Position) {
          return doorEntity.components[ComponentType.Position];
        }
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

      expect(() => system.update(mockUpdateArgs)).not.toThrow();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown behavior type: unknown_behavior')
      );

      consoleLogSpy.mockRestore();
    });
  });
});

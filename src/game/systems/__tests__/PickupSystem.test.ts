import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PickupSystem } from '../PickupSystem';
import { ComponentType } from '../../components/ComponentTypes';
import { createTestUpdateArgs, createMockGameMap, createEntityWithComponents } from '../../../__tests__/testUtils';
import { getComponentIfExists, setComponent, hasComponent, removeComponent, removeMapComponents } from '../../components/ComponentOperations';
import { getPlayerEntity, getEntitiesAtPosition } from '../../utils/EntityUtils';
import { PositionComponent } from '../../components/individualComponents/PositionComponent';
import { CarriedItemComponent } from '../../components/individualComponents/CarriedItemComponent';
import type { Entity } from '../../utils/ecsUtils';

// Mock ComponentOperations to work with test entities directly
vi.mock('../../components/ComponentOperations', async () => {
  const actual = await vi.importActual('../../components/ComponentOperations');
  
  return {
    ...actual,
    setComponent: vi.fn((entity: Entity, component: any) => {
      // For testing, directly modify the entity's components
      (entity.components as any)[component.type] = component;
    }),
    removeComponent: vi.fn((entity: Entity, componentType: string) => {
      // For testing, directly remove the component
      delete (entity.components as any)[componentType];
    }),
    removeMapComponents: vi.fn((entity: Entity) => {
      // For testing, remove position and sprite components
      delete (entity.components as any)[ComponentType.Position];
      delete (entity.components as any)[ComponentType.Sprite];
    })
  };
});

// Global variable to track current test entities for EntityUtils mock
let currentTestEntities: Entity[] = [];

// Mock EntityUtils to work with test entities directly  
vi.mock('../../utils/EntityUtils', async () => {
  const actual = await vi.importActual('../../utils/EntityUtils');
  
  return {
    ...actual,
    getPlayerEntity: vi.fn((entities: Entity[]) => {
      return entities.find(entity => hasComponent(entity, ComponentType.Player));
    }),
    getEntitiesAtPosition: vi.fn((position: { x: number; y: number }, entities?: Entity[]) => {
      const entitiesToCheck = entities || currentTestEntities;
      return entitiesToCheck.filter(entity => {
        const positionComponent = entity.components.position as any;
        return positionComponent?.x === position.x && positionComponent?.y === position.y;
      });
    })
  };
});

// Helper function to update the test entities context
function setCurrentTestEntities(entities: Entity[]) {
  currentTestEntities = entities;
}

describe('PickupSystem', () => {
  let system: PickupSystem;
  let playerEntity: Entity;
  let itemEntity: Entity;
  let updateArgs: ReturnType<typeof createTestUpdateArgs>;

  beforeEach(() => {
    system = new PickupSystem();
    
    // Create player entity with required components
    playerEntity = createEntityWithComponents([
      [ComponentType.Player, {}],
      [ComponentType.Position, { x: 5, y: 5 }],
      [ComponentType.Handling, {}]
    ]);
    
    // Create item entity at the same position as player
    itemEntity = createEntityWithComponents([
      [ComponentType.Pickable, { item: 'test-item' }],
      [ComponentType.Position, { x: 5, y: 5 }],
      [ComponentType.Sprite, { sprite: 'item' }]
    ]);
    
    const entities = [playerEntity, itemEntity];
    setCurrentTestEntities(entities);
    updateArgs = createTestUpdateArgs(entities, createMockGameMap());
  });

  describe('Item Collection Mechanics', () => {
    it('should pick up item when player has handling component and no carried item', () => {
      system.update(updateArgs);
      
      // Check that player now has carried item component
      const carriedItem = getComponentIfExists(playerEntity, ComponentType.CarriedItem);
      expect(carriedItem).toBeDefined();
      expect(carriedItem?.item).toBe(itemEntity.id);
      
      // Check that handling component was removed
      expect(hasComponent(playerEntity, ComponentType.Handling)).toBe(false);
      
      // Check that removeMapComponents was called
      expect(removeMapComponents).toHaveBeenCalledWith(itemEntity);
    });

    it('should place item when player has carried item component', () => {
      // Setup player with carried item
      const carriedItemComponent = new CarriedItemComponent({ item: itemEntity.id });
      setComponent(playerEntity, carriedItemComponent);
      
      // Remove the item from the map position initially
      removeComponent(itemEntity, ComponentType.Position);
      
      system.update(updateArgs);
      
      // Check that item was placed at player position
      expect(setComponent).toHaveBeenCalledWith(itemEntity, expect.any(PositionComponent));
      
      // Check that carried item component was removed from player
      expect(removeComponent).toHaveBeenCalledWith(playerEntity, ComponentType.CarriedItem);
      
      // Check that handling component was removed
      expect(removeComponent).toHaveBeenCalledWith(playerEntity, ComponentType.Handling);
    });

    it('should handle multiple items at same position and pick up first one', () => {
      const secondItemEntity = createEntityWithComponents([
        [ComponentType.Pickable, { item: 'second-item' }],
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Sprite, { sprite: 'item2' }]
      ]);
      
      const entities = [playerEntity, itemEntity, secondItemEntity];
      setCurrentTestEntities(entities);
      updateArgs = createTestUpdateArgs(entities, createMockGameMap());
      
      system.update(updateArgs);
      
      // Should pick up the first item (itemEntity)
      const carriedItem = getComponentIfExists(playerEntity, ComponentType.CarriedItem);
      expect(carriedItem?.item).toBe(itemEntity.id);
    });
  });

  describe('Entity State Changes During Pickup Operations', () => {
    it('should properly transition item from map to inventory', () => {
      const initialPosition = getComponentIfExists(itemEntity, ComponentType.Position);
      expect(initialPosition).toBeDefined();
      
      system.update(updateArgs);
      
      // Item should have map components removed
      expect(removeMapComponents).toHaveBeenCalledWith(itemEntity);
      
      // Player should have new carried item component
      const carriedItem = getComponentIfExists(playerEntity, ComponentType.CarriedItem);
      expect(carriedItem?.item).toBe(itemEntity.id);
    });

    it('should properly transition item from inventory to map', () => {
      // Setup initial carried item state
      setComponent(playerEntity, new CarriedItemComponent({ item: itemEntity.id }));
      removeComponent(itemEntity, ComponentType.Position);
      
      system.update(updateArgs);
      
      // Item should be placed at player position
      expect(setComponent).toHaveBeenCalledWith(
        itemEntity, 
        expect.objectContaining({
          x: 5, 
          y: 5
        })
      );
      
      // Player should no longer have carried item
      expect(removeComponent).toHaveBeenCalledWith(playerEntity, ComponentType.CarriedItem);
    });

    it('should always remove handling component after processing', () => {
      // Test pickup scenario
      system.update(updateArgs);
      expect(removeComponent).toHaveBeenCalledWith(playerEntity, ComponentType.Handling);
      
      // Reset and test placement scenario
      vi.clearAllMocks();
      setComponent(playerEntity, new CarriedItemComponent({ item: itemEntity.id }));
      setComponent(playerEntity, { type: ComponentType.Handling });
      
      system.update(updateArgs);
      expect(removeComponent).toHaveBeenCalledWith(playerEntity, ComponentType.Handling);
    });
  });

  describe('Inventory Management and Item Handling', () => {
    it('should maintain item entity reference in carried item component', () => {
      system.update(updateArgs);
      
      const carriedItem = getComponentIfExists(playerEntity, ComponentType.CarriedItem);
      expect(carriedItem?.item).toBe(itemEntity.id);
      
      // Verify the item entity still exists in the entities array
      const itemStillExists = updateArgs.entities.find(e => e.id === itemEntity.id);
      expect(itemStillExists).toBeDefined();
    });

    it('should handle inventory state transitions correctly', () => {
      // Test empty inventory -> has item
      expect(hasComponent(playerEntity, ComponentType.CarriedItem)).toBe(false);
      
      system.update(updateArgs);
      
      expect(getComponentIfExists(playerEntity, ComponentType.CarriedItem)).toBeDefined();
      
      // Test has item -> empty inventory
      vi.clearAllMocks();
      setComponent(playerEntity, { type: ComponentType.Handling });
      
      system.update(updateArgs);
      
      expect(removeComponent).toHaveBeenCalledWith(playerEntity, ComponentType.CarriedItem);
    });

    it('should not affect other player components during item operations', () => {
      const initialPlayerComponents = { ...playerEntity.components };
      
      system.update(updateArgs);
      
      // Position and Player components should remain unchanged
      expect(getComponentIfExists(playerEntity, ComponentType.Position)).toEqual(
        initialPlayerComponents.position
      );
      expect(hasComponent(playerEntity, ComponentType.Player)).toBe(true);
    });
  });

  describe('System Entity Filtering', () => {
    it('should only process pickable entities', () => {
      // Add non-pickable entity at same position
      const nonPickableEntity = createEntityWithComponents([
        [ComponentType.Position, { x: 5, y: 5 }],
        [ComponentType.Sprite, { sprite: 'wall' }]
      ]);
      
      const entities = [playerEntity, itemEntity, nonPickableEntity];
      setCurrentTestEntities(entities);
      updateArgs = createTestUpdateArgs(entities, createMockGameMap());
      
      system.update(updateArgs);
      
      // Should only pick up the pickable item, not the wall
      const carriedItem = getComponentIfExists(playerEntity, ComponentType.CarriedItem);
      expect(carriedItem?.item).toBe(itemEntity.id);
    });

    it('should filter entities by position correctly', () => {
      // Create item at different position
      const distantItem = createEntityWithComponents([
        [ComponentType.Pickable, { item: 'distant-item' }],
        [ComponentType.Position, { x: 10, y: 10 }],
        [ComponentType.Sprite, { sprite: 'item' }]
      ]);
      
      const entities = [playerEntity, distantItem];
      setCurrentTestEntities(entities);
      updateArgs = createTestUpdateArgs(entities, createMockGameMap());
      
      system.update(updateArgs);
      
      // Should not pick up distant item
      expect(hasComponent(playerEntity, ComponentType.CarriedItem)).toBe(false);
    });

    it('should require both position and pickable components for pickup', () => {
      // Create entity with pickable but no position
      const pickableNoPosition = createEntityWithComponents([
        [ComponentType.Pickable, { item: 'no-position-item' }],
        [ComponentType.Sprite, { sprite: 'item' }]
      ]);
      
      const entities = [playerEntity, pickableNoPosition];
      setCurrentTestEntities(entities);
      updateArgs = createTestUpdateArgs(entities, createMockGameMap());
      
      system.update(updateArgs);
      
      // Should not pick up entity without position
      expect(hasComponent(playerEntity, ComponentType.CarriedItem)).toBe(false);
    });
  });

  describe('Failure Scenarios', () => {
    it('should handle missing player entity gracefully', () => {
      const entitiesWithoutPlayer = [itemEntity];
      updateArgs = createTestUpdateArgs(entitiesWithoutPlayer, createMockGameMap());
      
      expect(() => system.update(updateArgs)).not.toThrow();
      
      // No operations should occur
      expect(setComponent).not.toHaveBeenCalled();
      expect(removeComponent).not.toHaveBeenCalled();
    });

    it('should handle player without position component', () => {
      removeComponent(playerEntity, ComponentType.Position);
      
      system.update(updateArgs);
      
      // No pickup operations should occur
      expect(removeMapComponents).not.toHaveBeenCalled();
      expect(hasComponent(playerEntity, ComponentType.CarriedItem)).toBe(false);
    });

    it('should handle player without handling component', () => {
      removeComponent(playerEntity, ComponentType.Handling);
      
      system.update(updateArgs);
      
      // No operations should occur
      expect(setComponent).not.toHaveBeenCalled();
      expect(removeMapComponents).not.toHaveBeenCalled();
    });

    it('should handle invalid carried item entity reference', () => {
      // Setup carried item with non-existent entity ID
      const invalidCarriedItem = new CarriedItemComponent({ item: 'non-existent-id' });
      setComponent(playerEntity, invalidCarriedItem);
      
      system.update(updateArgs);
      
      // Should NOT remove carried item component if entity doesn't exist (prevents data loss)
      expect(removeComponent).not.toHaveBeenCalledWith(playerEntity, ComponentType.CarriedItem);
      
      // But should still remove handling component
      expect(removeComponent).toHaveBeenCalledWith(playerEntity, ComponentType.Handling);
    });

    it('should handle empty entities array', () => {
      updateArgs = createTestUpdateArgs([], createMockGameMap());
      
      expect(() => system.update(updateArgs)).not.toThrow();
    });

    it('should handle no items at player position', () => {
      // Move item away from player
      setComponent(itemEntity, new PositionComponent({ x: 10, y: 10 }));
      
      system.update(updateArgs);
      
      // No pickup should occur
      expect(hasComponent(playerEntity, ComponentType.CarriedItem)).toBe(false);
      expect(removeMapComponents).not.toHaveBeenCalled();
      
      // But handling component should still be removed
      expect(removeComponent).toHaveBeenCalledWith(playerEntity, ComponentType.Handling);
    });
  });
});

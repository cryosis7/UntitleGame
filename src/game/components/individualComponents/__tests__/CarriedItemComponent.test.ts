import { describe, expect, it } from 'vitest';
import { CarriedItemComponent } from '../CarriedItemComponent';
import { ComponentType } from '../../ComponentTypes';
import type { CarriedItemComponentProps } from '../CarriedItemComponent';

describe('CarriedItemComponent', () => {
  describe('Constructor and Basic Properties', () => {
    it('should create instance with valid item string', () => {
      const props: CarriedItemComponentProps = { item: 'test-item-id' };
      const component = new CarriedItemComponent(props);

      expect(component).toBeInstanceOf(CarriedItemComponent);
      expect(component.type).toBe(ComponentType.CarriedItem);
      expect(component.item).toBe('test-item-id');
    });

    it('should assign correct ComponentType', () => {
      const component = new CarriedItemComponent({ item: 'any-item' });

      expect(component.type).toBe(ComponentType.CarriedItem);
      expect(component.type).toBe('carriedItem');
    });

    it('should preserve exact item string value', () => {
      const itemId = 'exact-test-value-123';
      const component = new CarriedItemComponent({ item: itemId });

      expect(component.item).toBe(itemId);
      expect(component.item).toStrictEqual(itemId);
    });
  });

  describe('Edge Cases and Special Values', () => {
    it('should handle empty string item', () => {
      const component = new CarriedItemComponent({ item: '' });

      expect(component.item).toBe('');
      expect(component.type).toBe(ComponentType.CarriedItem);
    });

    it('should handle item with whitespace', () => {
      const itemWithSpaces = '  item-with-spaces  ';
      const component = new CarriedItemComponent({ item: itemWithSpaces });

      expect(component.item).toBe(itemWithSpaces);
    });

    it('should handle item with special characters', () => {
      const specialItem = 'item-@#$%^&*()_+-=[]{}|;:,.<>?';
      const component = new CarriedItemComponent({ item: specialItem });

      expect(component.item).toBe(specialItem);
    });

    it('should handle item with unicode characters', () => {
      const unicodeItem = 'item-🎮⚔️🗝️';
      const component = new CarriedItemComponent({ item: unicodeItem });

      expect(component.item).toBe(unicodeItem);
    });

    it('should handle very long item string', () => {
      const longItem = 'a'.repeat(1000);
      const component = new CarriedItemComponent({ item: longItem });

      expect(component.item).toBe(longItem);
      expect(component.item.length).toBe(1000);
    });

    it('should handle item with newlines and tabs', () => {
      const itemWithControls = 'item\nwith\ttabs\rand\nnewlines';
      const component = new CarriedItemComponent({ item: itemWithControls });

      expect(component.item).toBe(itemWithControls);
    });
  });

  describe('Property Immutability and Consistency', () => {
    it('should maintain item property after creation', () => {
      const originalItem = 'persistent-item-id';
      const component = new CarriedItemComponent({ item: originalItem });

      expect(component.item).toBe(originalItem);
      
      // Verify property hasn't changed
      setTimeout(() => {
        expect(component.item).toBe(originalItem);
      }, 0);
    });

    it('should have consistent type property across instances', () => {
      const component1 = new CarriedItemComponent({ item: 'item1' });
      const component2 = new CarriedItemComponent({ item: 'item2' });

      expect(component1.type).toBe(component2.type);
      expect(component1.type).toBe(ComponentType.CarriedItem);
      expect(component2.type).toBe(ComponentType.CarriedItem);
    });

    it('should create independent instances', () => {
      const component1 = new CarriedItemComponent({ item: 'item1' });
      const component2 = new CarriedItemComponent({ item: 'item2' });

      expect(component1.item).not.toBe(component2.item);
      expect(component1).not.toBe(component2);
      expect(component1.type).toBe(component2.type);
    });
  });

  describe('Integration with ECS Architecture', () => {
    it('should be compatible with component dictionary structure', () => {
      const component = new CarriedItemComponent({ item: 'test-item' });

      // Should have properties expected by ECS system
      expect(component).toHaveProperty('type');
      expect(component).toHaveProperty('item');
      expect(typeof component.type).toBe('string');
      expect(typeof component.item).toBe('string');
    });

    it('should work with component type checking', () => {
      const component = new CarriedItemComponent({ item: 'test-item' });

      const isCarriedItemComponent = component.type === ComponentType.CarriedItem;
      expect(isCarriedItemComponent).toBe(true);

      const isOtherComponent = component.type === ComponentType.Position;
      expect(isOtherComponent).toBe(false);
    });

    it('should serialize properly for game state', () => {
      const component = new CarriedItemComponent({ item: 'serializable-item' });

      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);

      expect(parsed.type).toBe(ComponentType.CarriedItem);
      expect(parsed.item).toBe('serializable-item');
    });
  });

  describe('Type Safety and Validation', () => {
    it('should accept CarriedItemComponentProps interface', () => {
      const props: CarriedItemComponentProps = { item: 'typed-item' };
      const component = new CarriedItemComponent(props);

      expect(component.item).toBe('typed-item');
    });

    it('should work with destructured props', () => {
      const itemId = 'destructured-item';
      const component = new CarriedItemComponent({ item: itemId });

      expect(component.item).toBe(itemId);
    });

    it('should maintain type consistency with ComponentType enum', () => {
      const component = new CarriedItemComponent({ item: 'enum-test' });

      expect(component.type).toBe(ComponentType.CarriedItem);
      expect(ComponentType.CarriedItem).toBe('carriedItem');
    });
  });

  describe('Memory and Performance Considerations', () => {
    it('should create multiple instances efficiently', () => {
      const components: CarriedItemComponent[] = [];
      
      for (let i = 0; i < 100; i++) {
        components.push(new CarriedItemComponent({ item: `item-${i}` }));
      }

      expect(components).toHaveLength(100);
      components.forEach((component, index) => {
        expect(component.item).toBe(`item-${index}`);
        expect(component.type).toBe(ComponentType.CarriedItem);
      });
    });

    it('should not share references between instances', () => {
      const sharedItemId = 'shared-reference-test';
      const component1 = new CarriedItemComponent({ item: sharedItemId });
      const component2 = new CarriedItemComponent({ item: sharedItemId });

      expect(component1.item).toBe(component2.item);
      expect(component1).not.toBe(component2);
      
      // Instances should be separate even with same item value
      expect(component1 === component2).toBe(false);
    });
  });

  describe('Game Usage Scenarios', () => {
    it('should work with typical entity IDs', () => {
      const entityId = 'entity-12345-uuid-abc';
      const component = new CarriedItemComponent({ item: entityId });

      expect(component.item).toBe(entityId);
    });

    it('should work with empty inventory state', () => {
      const component = new CarriedItemComponent({ item: '' });

      expect(component.item).toBe('');
      expect(component.type).toBe(ComponentType.CarriedItem);
    });

    it('should support item switching scenarios', () => {
      const firstItem = 'sword-001';
      const secondItem = 'key-002';
      
      const component1 = new CarriedItemComponent({ item: firstItem });
      const component2 = new CarriedItemComponent({ item: secondItem });

      expect(component1.item).toBe(firstItem);
      expect(component2.item).toBe(secondItem);
      expect(component1.type).toBe(component2.type);
    });
  });
});
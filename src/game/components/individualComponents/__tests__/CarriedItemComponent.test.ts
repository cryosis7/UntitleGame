import { describe, it, expect } from 'vitest';
import { CarriedItemComponent, type CarriedItemComponentProps } from '../CarriedItemComponent';
import { ComponentType } from '../../ComponentTypes';

describe('CarriedItemComponent', () => {
  describe('Component Creation', () => {
    it('should create a carried item component with valid item name', () => {
      const props: CarriedItemComponentProps = { item: 'sword' };
      const component = new CarriedItemComponent(props);

      expect(component.type).toBe(ComponentType.CarriedItem);
      expect(component.item).toBe('sword');
    });

    it('should create component with different item types', () => {
      const items = ['potion', 'key', 'gem', 'scroll'];
      
      items.forEach(itemName => {
        const component = new CarriedItemComponent({ item: itemName });
        expect(component.type).toBe(ComponentType.CarriedItem);
        expect(component.item).toBe(itemName);
      });
    });

    it('should create component with empty string item', () => {
      const props: CarriedItemComponentProps = { item: '' };
      const component = new CarriedItemComponent(props);

      expect(component.item).toBe('');
      expect(component.type).toBe(ComponentType.CarriedItem);
    });

    it('should create component with whitespace item name', () => {
      const props: CarriedItemComponentProps = { item: '  magic wand  ' };
      const component = new CarriedItemComponent(props);

      expect(component.item).toBe('  magic wand  ');
    });
  });

  describe('Property Validation', () => {
    it('should handle special characters in item names', () => {
      const specialItems = [
        'sword+1',
        'potion_of_healing',
        'ring-of-power',
        'scroll@magic',
        'item#123',
        'key$gold'
      ];

      specialItems.forEach(itemName => {
        const component = new CarriedItemComponent({ item: itemName });
        expect(component.item).toBe(itemName);
        expect(component.type).toBe(ComponentType.CarriedItem);
      });
    });

    it('should handle unicode characters in item names', () => {
      const unicodeItems = [
        '⚔️sword',
        '🗝️key',
        '💎gem',
        '🧙‍♂️staff',
        'élixir',
        'ñíñó'
      ];

      unicodeItems.forEach(itemName => {
        const component = new CarriedItemComponent({ item: itemName });
        expect(component.item).toBe(itemName);
      });
    });

    it('should handle very long item names', () => {
      const longItemName = 'a'.repeat(1000);
      const component = new CarriedItemComponent({ item: longItemName });

      expect(component.item).toBe(longItemName);
      expect(component.item.length).toBe(1000);
    });

    it('should handle numeric strings as item names', () => {
      const numericItems = ['123', '0', '-1', '3.14', 'NaN', 'Infinity'];

      numericItems.forEach(itemName => {
        const component = new CarriedItemComponent({ item: itemName });
        expect(component.item).toBe(itemName);
        expect(typeof component.item).toBe('string');
      });
    });
  });

  describe('Component Type', () => {
    it('should always have the correct component type', () => {
      const component = new CarriedItemComponent({ item: 'test' });
      expect(component.type).toBe(ComponentType.CarriedItem);
    });

    it('should maintain type consistency across instances', () => {
      const component1 = new CarriedItemComponent({ item: 'item1' });
      const component2 = new CarriedItemComponent({ item: 'item2' });
      
      expect(component1.type).toBe(component2.type);
      expect(component1.type).toBe(ComponentType.CarriedItem);
    });
  });

  describe('Property Modification', () => {
    it('should allow direct item property modification', () => {
      const component = new CarriedItemComponent({ item: 'oldItem' });
      
      component.item = 'newItem';
      
      expect(component.item).toBe('newItem');
    });

    it('should handle item swapping scenarios', () => {
      const component = new CarriedItemComponent({ item: 'sword' });
      
      // Simulate item swap
      const oldItem = component.item;
      component.item = 'shield';
      
      expect(oldItem).toBe('sword');
      expect(component.item).toBe('shield');
    });

    it('should handle item clearing', () => {
      const component = new CarriedItemComponent({ item: 'potion' });
      
      component.item = '';
      
      expect(component.item).toBe('');
    });
  });

  describe('Inventory Management', () => {
    it('should support item identification', () => {
      const component = new CarriedItemComponent({ item: 'healthPotion' });
      
      const isHealthPotion = component.item === 'healthPotion';
      expect(isHealthPotion).toBe(true);
    });

    it('should support item categorization', () => {
      const weapons = ['sword', 'bow', 'dagger'];
      const potions = ['healthPotion', 'manaPotion', 'strengthPotion'];
      
      weapons.forEach(weapon => {
        const component = new CarriedItemComponent({ item: weapon });
        const isWeapon = weapons.includes(component.item);
        expect(isWeapon).toBe(true);
      });

      potions.forEach(potion => {
        const component = new CarriedItemComponent({ item: potion });
        const isPotion = potions.includes(component.item);
        expect(isPotion).toBe(true);
      });
    });

    it('should support item stack simulation', () => {
      const stackableItems = [
        { item: 'arrow', count: 50 },
        { item: 'gold', count: 1000 },
        { item: 'stone', count: 25 }
      ];

      stackableItems.forEach(({ item, count }) => {
        const component = new CarriedItemComponent({ item: `${item}x${count}` });
        expect(component.item).toBe(`${item}x${count}`);
      });
    });
  });

  describe('Game Logic Integration', () => {
    it('should work with item usage systems', () => {
      const usableItems = ['healthPotion', 'key', 'scroll'];
      
      usableItems.forEach(itemName => {
        const component = new CarriedItemComponent({ item: itemName });
        
        // Simulate item usage check
        const canUseItem = component.item === itemName;
        expect(canUseItem).toBe(true);
      });
    });

    it('should support item dropping mechanics', () => {
      const component = new CarriedItemComponent({ item: 'unwantedItem' });
      
      // Simulate item drop
      const droppedItem = component.item;
      component.item = '';
      
      expect(droppedItem).toBe('unwantedItem');
      expect(component.item).toBe('');
    });

    it('should work with quest item tracking', () => {
      const questItems = ['ancientKey', 'magicalOrb', 'dragonScale'];
      
      questItems.forEach(questItem => {
        const component = new CarriedItemComponent({ item: questItem });
        
        // Simulate quest item check
        const hasQuestItem = questItems.includes(component.item);
        expect(hasQuestItem).toBe(true);
      });
    });
  });

  describe('Serialization Compatibility', () => {
    it('should be JSON serializable', () => {
      const component = new CarriedItemComponent({ item: 'magicSword' });
      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.item).toBe('magicSword');
      expect(parsed.type).toBe(ComponentType.CarriedItem);
    });

    it('should handle special characters in serialization', () => {
      const component = new CarriedItemComponent({ item: 'sword+1"test"' });
      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.item).toBe('sword+1"test"');
    });

    it('should serialize empty items correctly', () => {
      const component = new CarriedItemComponent({ item: '' });
      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.item).toBe('');
      expect(parsed.type).toBe(ComponentType.CarriedItem);
    });

    it('should handle array serialization of inventory', () => {
      const inventory = [
        new CarriedItemComponent({ item: 'sword' }),
        new CarriedItemComponent({ item: 'shield' }),
        new CarriedItemComponent({ item: 'potion' })
      ];
      
      const serialized = JSON.stringify(inventory);
      const parsed = JSON.parse(serialized);
      
      expect(parsed).toHaveLength(3);
      expect(parsed[0].item).toBe('sword');
      expect(parsed[1].item).toBe('shield');
      expect(parsed[2].item).toBe('potion');
    });
  });

  describe('Component Equality and Comparison', () => {
    it('should create distinct instances with different items', () => {
      const component1 = new CarriedItemComponent({ item: 'sword' });
      const component2 = new CarriedItemComponent({ item: 'shield' });
      
      expect(component1).not.toBe(component2);
      expect(component1.item).not.toBe(component2.item);
      expect(component1.type).toBe(component2.type);
    });

    it('should support item-based comparison', () => {
      const component1 = new CarriedItemComponent({ item: 'sword' });
      const component2 = new CarriedItemComponent({ item: 'sword' });
      
      const haveSameItem = component1.item === component2.item;
      expect(haveSameItem).toBe(true);
      expect(component1).not.toBe(component2); // Different instances
    });

    it('should support case-sensitive item comparison', () => {
      const component1 = new CarriedItemComponent({ item: 'Sword' });
      const component2 = new CarriedItemComponent({ item: 'sword' });
      
      const haveSameItem = component1.item === component2.item;
      expect(haveSameItem).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null-like strings', () => {
      const nullLikeItems = ['null', 'undefined', 'NaN', 'false'];
      
      nullLikeItems.forEach(item => {
        const component = new CarriedItemComponent({ item });
        expect(component.item).toBe(item);
        expect(typeof component.item).toBe('string');
      });
    });

    it('should preserve string formatting', () => {
      const formattedItems = [
        'Item\nWith\nNewlines',
        'Item\tWith\tTabs',
        'Item With Spaces',
        '  Padded Item  '
      ];

      formattedItems.forEach(item => {
        const component = new CarriedItemComponent({ item });
        expect(component.item).toBe(item);
      });
    });
  });
});

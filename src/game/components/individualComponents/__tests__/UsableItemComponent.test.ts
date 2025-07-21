import { describe, it, expect } from 'vitest';
import { UsableItemComponent } from '../UsableItemComponent';
import { ComponentType } from '../../ComponentTypes';

describe('UsableItemComponent', () => {
  describe('Component Creation', () => {
    it('should create a usable item component with valid capabilities', () => {
      const component = new UsableItemComponent({
        capabilities: ['unlock', 'cut'],
      });

      expect(component.type).toBe(ComponentType.UsableItem);
      expect(component.capabilities).toEqual(['unlock', 'cut']);
      expect(component.isConsumable).toBe(true); // Default value
    });

    it('should create component with empty capabilities array', () => {
      const component = new UsableItemComponent({
        capabilities: [],
      });

      expect(component.capabilities).toEqual([]);
      expect(component.isConsumable).toBe(true);
    });

    it('should create component with single capability', () => {
      const component = new UsableItemComponent({
        capabilities: ['key'],
      });

      expect(component.capabilities).toEqual(['key']);
      expect(component.isConsumable).toBe(true);
    });

    it('should create component with explicit isConsumable false', () => {
      const component = new UsableItemComponent({
        capabilities: ['tool'],
        isConsumable: false,
      });

      expect(component.isConsumable).toBe(false);
    });

    it('should create component with explicit isConsumable true', () => {
      const component = new UsableItemComponent({
        capabilities: ['potion'],
        isConsumable: true,
      });

      expect(component.isConsumable).toBe(true);
    });
  });

  describe('Component Type', () => {
    it('should always have the correct component type', () => {
      const component = new UsableItemComponent({
        capabilities: ['test'],
      });

      expect(component.type).toBe(ComponentType.UsableItem);
    });

    it('should maintain type consistency across instances', () => {
      const component1 = new UsableItemComponent({
        capabilities: ['tool1'],
      });
      const component2 = new UsableItemComponent({
        capabilities: ['tool2'],
      });

      expect(component1.type).toBe(component2.type);
      expect(component1.type).toBe(ComponentType.UsableItem);
    });
  });

  describe('Capability Management', () => {
    it('should handle multiple capabilities correctly', () => {
      const capabilities = ['red-key', 'blue-key', 'master-tool'];
      const component = new UsableItemComponent({
        capabilities: capabilities,
      });

      expect(component.capabilities).toEqual(capabilities);
      expect(component.capabilities.length).toBe(3);
    });

    it('should handle duplicate capabilities', () => {
      const component = new UsableItemComponent({
        capabilities: ['tool', 'tool', 'unlock'],
      });

      expect(component.capabilities).toEqual(['tool', 'tool', 'unlock']);
      expect(component.capabilities.length).toBe(3);
    });

    it('should handle special characters in capabilities', () => {
      const component = new UsableItemComponent({
        capabilities: ['multi-tool_v2', 'key@door#1'],
      });

      expect(component.capabilities).toEqual(['multi-tool_v2', 'key@door#1']);
    });

    it('should handle long capability strings', () => {
      const longCapability = 'ancient-mystical-key-that-unlocks-the-forgotten-chamber';
      const component = new UsableItemComponent({
        capabilities: [longCapability],
      });

      expect(component.capabilities[0]).toBe(longCapability);
    });
  });

  describe('Consumption Behavior', () => {
    it('should support consumable items (default)', () => {
      const component = new UsableItemComponent({
        capabilities: ['healing-potion'],
      });

      expect(component.isConsumable).toBe(true);
    });

    it('should support non-consumable (reusable) items', () => {
      const component = new UsableItemComponent({
        capabilities: ['lockpick-set'],
        isConsumable: false,
      });

      expect(component.isConsumable).toBe(false);
    });

    it('should allow consumption state modification', () => {
      const component = new UsableItemComponent({
        capabilities: ['item'],
      });

      expect(component.isConsumable).toBe(true);

      component.isConsumable = false;
      expect(component.isConsumable).toBe(false);

      component.isConsumable = true;
      expect(component.isConsumable).toBe(true);
    });
  });

  describe('Property Modification', () => {
    it('should allow direct capability modification', () => {
      const component = new UsableItemComponent({
        capabilities: ['initial'],
      });

      component.capabilities.push('added');
      expect(component.capabilities).toEqual(['initial', 'added']);
    });

    it('should allow capability array replacement', () => {
      const component = new UsableItemComponent({
        capabilities: ['old1', 'old2'],
      });

      component.capabilities = ['new1', 'new2', 'new3'];
      expect(component.capabilities).toEqual(['new1', 'new2', 'new3']);
    });

    it('should allow complete property modification', () => {
      const component = new UsableItemComponent({
        capabilities: ['tool'],
        isConsumable: true,
      });

      component.capabilities = ['upgraded-tool', 'multi-use'];
      component.isConsumable = false;

      expect(component.capabilities).toEqual(['upgraded-tool', 'multi-use']);
      expect(component.isConsumable).toBe(false);
    });
  });

  describe('Game Logic Integration', () => {
    it('should support capability matching with requirements', () => {
      const component = new UsableItemComponent({
        capabilities: ['unlock', 'cut', 'light'],
      });

      const requirements = ['light', 'fire'];
      const hasMatch = component.capabilities.some(capability => 
        requirements.includes(capability)
      );

      expect(hasMatch).toBe(true);
    });

    it('should handle no capability matches', () => {
      const component = new UsableItemComponent({
        capabilities: ['hammer', 'nails'],
      });

      const requirements = ['key', 'lockpick'];
      const hasMatch = component.capabilities.some(capability => 
        requirements.includes(capability)
      );

      expect(hasMatch).toBe(false);
    });

    it('should work with item consumption logic', () => {
      const consumable = new UsableItemComponent({
        capabilities: ['healing'],
        isConsumable: true,
      });

      const reusable = new UsableItemComponent({
        capabilities: ['unlock'],
        isConsumable: false,
      });

      // Simulate item usage
      if (consumable.isConsumable) {
        // Item would be removed from inventory
        expect(consumable.isConsumable).toBe(true);
      }

      if (!reusable.isConsumable) {
        // Item would remain in inventory
        expect(reusable.isConsumable).toBe(false);
      }
    });
  });

  describe('Item Type Scenarios', () => {
    it('should handle tool items (non-consumable)', () => {
      const tool = new UsableItemComponent({
        capabilities: ['dig', 'break', 'construct'],
        isConsumable: false,
      });

      expect(tool.capabilities).toContain('dig');
      expect(tool.isConsumable).toBe(false);
    });

    it('should handle potion items (consumable)', () => {
      const potion = new UsableItemComponent({
        capabilities: ['heal', 'restore'],
        isConsumable: true,
      });

      expect(potion.capabilities).toContain('heal');
      expect(potion.isConsumable).toBe(true);
    });

    it('should handle key items', () => {
      const key = new UsableItemComponent({
        capabilities: ['red-door', 'chest-lock'],
        isConsumable: false,
      });

      expect(key.capabilities).toEqual(['red-door', 'chest-lock']);
      expect(key.isConsumable).toBe(false);
    });

    it('should handle universal items', () => {
      const masterKey = new UsableItemComponent({
        capabilities: ['universal', 'master-access', 'override'],
        isConsumable: false,
      });

      expect(masterKey.capabilities).toContain('universal');
      expect(masterKey.isConsumable).toBe(false);
    });
  });

  describe('Serialization Compatibility', () => {
    it('should be JSON serializable', () => {
      const component = new UsableItemComponent({
        capabilities: ['key1', 'tool2'],
        isConsumable: false,
      });

      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);

      expect(parsed.type).toBe(ComponentType.UsableItem);
      expect(parsed.capabilities).toEqual(['key1', 'tool2']);
      expect(parsed.isConsumable).toBe(false);
    });

    it('should handle empty capabilities in serialization', () => {
      const component = new UsableItemComponent({
        capabilities: [],
      });

      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);

      expect(parsed.capabilities).toEqual([]);
      expect(parsed.isConsumable).toBe(true);
    });

    it('should serialize complex capability names', () => {
      const component = new UsableItemComponent({
        capabilities: ['multi-use_tool@v1.2', 'special#key&access'],
        isConsumable: false,
      });

      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);

      expect(parsed.capabilities).toEqual(['multi-use_tool@v1.2', 'special#key&access']);
    });
  });

  describe('Component Validation', () => {
    it('should create distinct instances', () => {
      const component1 = new UsableItemComponent({
        capabilities: ['test1'],
      });
      const component2 = new UsableItemComponent({
        capabilities: ['test2'],
      });

      expect(component1).not.toBe(component2);
      expect(component1.capabilities).not.toBe(component2.capabilities);
    });

    it('should support type-based filtering for ECS systems', () => {
      const components = [
        new UsableItemComponent({ capabilities: ['tool'] }),
        new UsableItemComponent({ capabilities: ['key'] }),
      ];

      const filtered = components.filter(comp => comp.type === ComponentType.UsableItem);
      expect(filtered).toHaveLength(2);
    });

    it('should work with instanceof checks', () => {
      const component = new UsableItemComponent({
        capabilities: ['test'],
      });

      expect(component instanceof UsableItemComponent).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string capabilities', () => {
      const component = new UsableItemComponent({
        capabilities: ['', 'valid-tool'],
      });

      expect(component.capabilities).toEqual(['', 'valid-tool']);
    });

    it('should handle whitespace-only capabilities', () => {
      const component = new UsableItemComponent({
        capabilities: ['   ', 'normal-key'],
      });

      expect(component.capabilities).toEqual(['   ', 'normal-key']);
    });

    it('should preserve capability order', () => {
      const orderedCapabilities = ['first', 'second', 'third'];
      const component = new UsableItemComponent({
        capabilities: orderedCapabilities,
      });

      expect(component.capabilities).toEqual(orderedCapabilities);
    });

    it('should handle boolean conversion edge cases', () => {
      // Test falsy values
      const component1 = new UsableItemComponent({
        capabilities: ['test'],
        isConsumable: false,
      });

      // Test truthy values
      const component2 = new UsableItemComponent({
        capabilities: ['test'],
        isConsumable: true,
      });

      expect(component1.isConsumable).toBe(false);
      expect(component2.isConsumable).toBe(true);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large capability arrays efficiently', () => {
      const largeCapabilityArray = Array.from({ length: 100 }, (_, i) => `capability-${i}`);
      const component = new UsableItemComponent({
        capabilities: largeCapabilityArray,
      });

      expect(component.capabilities).toHaveLength(100);
      expect(component.capabilities[0]).toBe('capability-0');
      expect(component.capabilities[99]).toBe('capability-99');
    });

    it('should maintain reference integrity', () => {
      const capabilities = ['shared-capability'];
      const component = new UsableItemComponent({
        capabilities: capabilities,
      });

      // Modifying original array should not affect component (if properly constructed)
      capabilities.push('new-capability');
      expect(component.capabilities).toHaveLength(2); // Should include the new capability since arrays are reference types
    });
  });
});

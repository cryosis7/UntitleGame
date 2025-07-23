import { describe, it, expect } from 'vitest';
import { RequiresItemComponent } from '../RequiresItemComponent';
import { ComponentType } from '../../ComponentTypes';

describe('RequiresItemComponent', () => {
  describe('Component Creation', () => {
    it('should create a requires item component with valid capabilities', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['unlock', 'open'],
      });

      expect(component.type).toBe(ComponentType.RequiresItem);
      expect(component.requiredCapabilities).toEqual(['unlock', 'open']);
      expect(component.isActive).toBe(true); // Default value
    });

    it('should create component with empty capabilities array', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: [],
      });

      expect(component.requiredCapabilities).toEqual([]);
      expect(component.isActive).toBe(true);
    });

    it('should create component with single capability', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['key'],
      });

      expect(component.requiredCapabilities).toEqual(['key']);
      expect(component.isActive).toBe(true);
    });

    it('should create component with explicit isActive false', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['unlock'],
        isActive: false,
      });

      expect(component.isActive).toBe(false);
    });

    it('should create component with explicit isActive true', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['unlock'],
        isActive: true,
      });

      expect(component.isActive).toBe(true);
    });
  });

  describe('Component Type', () => {
    it('should always have the correct component type', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['test'],
      });

      expect(component.type).toBe(ComponentType.RequiresItem);
    });

    it('should maintain type consistency across instances', () => {
      const component1 = new RequiresItemComponent({
        requiredCapabilities: ['key1'],
      });
      const component2 = new RequiresItemComponent({
        requiredCapabilities: ['key2'],
      });

      expect(component1.type).toBe(component2.type);
      expect(component1.type).toBe(ComponentType.RequiresItem);
    });
  });

  describe('Capability Management', () => {
    it('should handle multiple capabilities correctly', () => {
      const capabilities = ['red-key', 'blue-key', 'master-key'];
      const component = new RequiresItemComponent({
        requiredCapabilities: capabilities,
      });

      expect(component.requiredCapabilities).toEqual(capabilities);
      expect(component.requiredCapabilities.length).toBe(3);
    });

    it('should handle duplicate capabilities', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['key', 'key', 'unlock'],
      });

      expect(component.requiredCapabilities).toEqual(['key', 'key', 'unlock']);
      expect(component.requiredCapabilities.length).toBe(3);
    });

    it('should handle special characters in capabilities', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['special-key_1', 'door@room#42'],
      });

      expect(component.requiredCapabilities).toEqual([
        'special-key_1',
        'door@room#42',
      ]);
    });

    it('should handle long capability strings', () => {
      const longCapability =
        'very-long-capability-name-for-specific-door-in-dungeon-level-5';
      const component = new RequiresItemComponent({
        requiredCapabilities: [longCapability],
      });

      expect(component.requiredCapabilities[0]).toBe(longCapability);
    });
  });

  describe('Property Modification', () => {
    it('should allow direct capability modification', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['initial'],
      });

      component.requiredCapabilities.push('added');
      expect(component.requiredCapabilities).toEqual(['initial', 'added']);
    });

    it('should allow isActive state modification', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['test'],
      });

      expect(component.isActive).toBe(true);

      component.isActive = false;
      expect(component.isActive).toBe(false);

      component.isActive = true;
      expect(component.isActive).toBe(true);
    });

    it('should allow capability array replacement', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['old1', 'old2'],
      });

      component.requiredCapabilities = ['new1', 'new2', 'new3'];
      expect(component.requiredCapabilities).toEqual(['new1', 'new2', 'new3']);
    });
  });

  describe('Game Logic Integration', () => {
    it('should support interaction state management', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['unlock'],
      });

      // Simulate successful interaction
      component.isActive = false;
      expect(component.isActive).toBe(false);

      // Should still retain capability requirements
      expect(component.requiredCapabilities).toEqual(['unlock']);
    });

    it('should work with capability matching logic', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['green-key', 'master-key'],
      });

      // Simulate capability matching scenarios
      const playerCapabilities = ['master-key', 'red-key'];
      const hasMatch = component.requiredCapabilities.some((required) =>
        playerCapabilities.includes(required),
      );

      expect(hasMatch).toBe(true);
    });

    it('should handle no capability matches', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['special-key'],
      });

      const playerCapabilities = ['common-key', 'basic-tool'];
      const hasMatch = component.requiredCapabilities.some((required) =>
        playerCapabilities.includes(required),
      );

      expect(hasMatch).toBe(false);
    });
  });

  describe('Serialization Compatibility', () => {
    it('should be JSON serializable', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['key1', 'key2'],
        isActive: false,
      });

      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);

      expect(parsed.type).toBe(ComponentType.RequiresItem);
      expect(parsed.requiredCapabilities).toEqual(['key1', 'key2']);
      expect(parsed.isActive).toBe(false);
    });

    it('should handle empty capabilities in serialization', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: [],
      });

      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);

      expect(parsed.requiredCapabilities).toEqual([]);
      expect(parsed.isActive).toBe(true);
    });
  });

  describe('Component Validation', () => {
    it('should create distinct instances', () => {
      const component1 = new RequiresItemComponent({
        requiredCapabilities: ['test1'],
      });
      const component2 = new RequiresItemComponent({
        requiredCapabilities: ['test2'],
      });

      expect(component1).not.toBe(component2);
      expect(component1.requiredCapabilities).not.toBe(
        component2.requiredCapabilities,
      );
    });

    it('should support type-based filtering for ECS systems', () => {
      const components = [
        new RequiresItemComponent({ requiredCapabilities: ['key1'] }),
        new RequiresItemComponent({ requiredCapabilities: ['key2'] }),
      ];

      const filtered = components.filter(
        (comp) => comp.type === ComponentType.RequiresItem,
      );
      expect(filtered).toHaveLength(2);
    });

    it('should work with instanceof checks', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['test'],
      });

      expect(component instanceof RequiresItemComponent).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string capabilities', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['', 'valid-key'],
      });

      expect(component.requiredCapabilities).toEqual(['', 'valid-key']);
    });

    it('should handle whitespace-only capabilities', () => {
      const component = new RequiresItemComponent({
        requiredCapabilities: ['   ', 'normal-key'],
      });

      expect(component.requiredCapabilities).toEqual(['   ', 'normal-key']);
    });

    it('should preserve capability order', () => {
      const orderedCapabilities = ['first', 'second', 'third'];
      const component = new RequiresItemComponent({
        requiredCapabilities: orderedCapabilities,
      });

      expect(component.requiredCapabilities).toEqual(orderedCapabilities);
    });
  });
});

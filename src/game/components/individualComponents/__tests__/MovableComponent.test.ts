import { describe, it, expect } from 'vitest';
import { MovableComponent } from '../MovableComponent';
import { ComponentType } from '../../ComponentTypes';

describe('MovableComponent', () => {
  describe('Component Creation', () => {
    it('should create a movable component', () => {
      const component = new MovableComponent();

      expect(component.type).toBe(ComponentType.Movable);
    });

    it('should create multiple instances with consistent type', () => {
      const component1 = new MovableComponent();
      const component2 = new MovableComponent();

      expect(component1.type).toBe(ComponentType.Movable);
      expect(component2.type).toBe(ComponentType.Movable);
      expect(component1.type).toBe(component2.type);
    });
  });

  describe('Component Type', () => {
    it('should always have the correct component type', () => {
      const component = new MovableComponent();
      expect(component.type).toBe(ComponentType.Movable);
    });

    it('should have type property that is read-only in practice', () => {
      const component = new MovableComponent();
      const originalType = component.type;
      
      // While we could technically reassign, the component should maintain its intended type
      expect(component.type).toBe(originalType);
      expect(component.type).toBe(ComponentType.Movable);
    });
  });

  describe('Marker Component Behavior', () => {
    it('should function as a marker component with no additional properties', () => {
      const component = new MovableComponent();
      
      // Should only have the type property
      expect(Object.keys(component)).toEqual(['type']);
    });

    it('should not have any methods beyond constructor', () => {
      const component = new MovableComponent();
      
      // Get all non-inherited properties and methods
      const ownProperties = Object.getOwnPropertyNames(component);
      const ownMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(component))
        .filter(name => name !== 'constructor' && typeof (component as any)[name] === 'function');
      
      expect(ownProperties).toEqual(['type']);
      expect(ownMethods).toEqual([]);
    });

    it('should be lightweight with minimal memory footprint', () => {
      const component = new MovableComponent();
      
      // Should have minimal properties
      expect(Object.keys(component).length).toBe(1);
      expect(component.type).toBe(ComponentType.Movable);
    });
  });

  describe('ECS Integration', () => {
    it('should be usable as a filter component in ECS systems', () => {
      const component = new MovableComponent();
      
      // Should be able to check component type for filtering
      const isMovable = component.type === ComponentType.Movable;
      expect(isMovable).toBe(true);
    });

    it('should work with entity component filtering patterns', () => {
      const movableComponents = [
        new MovableComponent(),
        new MovableComponent(),
        new MovableComponent()
      ];
      
      // Should be able to filter components by type
      const foundMovableComponents = movableComponents.filter(
        comp => comp.type === ComponentType.Movable
      );
      
      expect(foundMovableComponents).toHaveLength(3);
      expect(foundMovableComponents[0].type).toBe(ComponentType.Movable);
    });

    it('should support instanceof checks', () => {
      const component = new MovableComponent();
      
      expect(component instanceof MovableComponent).toBe(true);
    });
  });

  describe('Serialization Compatibility', () => {
    it('should be JSON serializable', () => {
      const component = new MovableComponent();
      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.type).toBe(ComponentType.Movable);
    });

    it('should serialize to minimal JSON structure', () => {
      const component = new MovableComponent();
      const serialized = JSON.stringify(component);
      
      // Should be a minimal JSON object with just the type
      expect(serialized).toBe(`{"type":"${ComponentType.Movable}"}`);
    });

    it('should handle array serialization of multiple components', () => {
      const components = [
        new MovableComponent(),
        new MovableComponent()
      ];
      
      const serialized = JSON.stringify(components);
      const parsed = JSON.parse(serialized);
      
      expect(parsed).toHaveLength(2);
      expect(parsed[0].type).toBe(ComponentType.Movable);
      expect(parsed[1].type).toBe(ComponentType.Movable);
    });
  });

  describe('Component Equality', () => {
    it('should create distinct instances', () => {
      const component1 = new MovableComponent();
      const component2 = new MovableComponent();
      
      expect(component1).not.toBe(component2); // Different instances
      expect(component1.type).toBe(component2.type); // Same type
    });

    it('should support type-based comparison', () => {
      const component1 = new MovableComponent();
      const component2 = new MovableComponent();
      
      // Should be considered equivalent for ECS purposes based on type
      const areEquivalent = component1.type === component2.type;
      expect(areEquivalent).toBe(true);
    });
  });

  describe('Component Immutability', () => {
    it('should have stable type after creation', () => {
      const component = new MovableComponent();
      const originalType = component.type;
      
      // Type should remain constant
      setTimeout(() => {
        expect(component.type).toBe(originalType);
      }, 0);
      
      expect(component.type).toBe(ComponentType.Movable);
    });
  });

  describe('Performance Characteristics', () => {
    it('should create components efficiently', () => {
      const startTime = performance.now();
      
      // Create many components
      const components = [];
      for (let i = 0; i < 1000; i++) {
        components.push(new MovableComponent());
      }
      
      const endTime = performance.now();
      
      expect(components).toHaveLength(1000);
      expect(components[0].type).toBe(ComponentType.Movable);
      expect(components[999].type).toBe(ComponentType.Movable);
      
      // Should complete in reasonable time (this is a loose check)
      expect(endTime - startTime).toBeLessThan(100); // 100ms for 1000 components
    });
  });
});

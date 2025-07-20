import { describe, it, expect } from 'vitest';
import { VelocityComponent, type VelocityComponentProps } from '../VelocityComponent';
import { ComponentType } from '../../ComponentTypes';

describe('VelocityComponent', () => {
  describe('Component Creation', () => {
    it('should create a velocity component with valid velocity values', () => {
      const props: VelocityComponentProps = { vx: 1, vy: -1 };
      const component = new VelocityComponent(props);

      expect(component.type).toBe(ComponentType.Velocity);
      expect(component.vx).toBe(1);
      expect(component.vy).toBe(-1);
    });

    it('should create component with zero velocity', () => {
      const props: VelocityComponentProps = { vx: 0, vy: 0 };
      const component = new VelocityComponent(props);

      expect(component.vx).toBe(0);
      expect(component.vy).toBe(0);
    });

    it('should create component with positive velocities', () => {
      const props: VelocityComponentProps = { vx: 5, vy: 3 };
      const component = new VelocityComponent(props);

      expect(component.vx).toBe(5);
      expect(component.vy).toBe(3);
    });

    it('should create component with negative velocities', () => {
      const props: VelocityComponentProps = { vx: -2, vy: -4 };
      const component = new VelocityComponent(props);

      expect(component.vx).toBe(-2);
      expect(component.vy).toBe(-4);
    });

    it('should create component with fractional velocities', () => {
      const props: VelocityComponentProps = { vx: 0.5, vy: -1.25 };
      const component = new VelocityComponent(props);

      expect(component.vx).toBe(0.5);
      expect(component.vy).toBe(-1.25);
    });
  });

  describe('Property Validation', () => {
    it('should handle very large velocity values', () => {
      const props: VelocityComponentProps = { vx: Number.MAX_SAFE_INTEGER, vy: Number.MAX_SAFE_INTEGER };
      const component = new VelocityComponent(props);

      expect(component.vx).toBe(Number.MAX_SAFE_INTEGER);
      expect(component.vy).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle very small velocity values', () => {
      const props: VelocityComponentProps = { vx: Number.MIN_SAFE_INTEGER, vy: Number.MIN_SAFE_INTEGER };
      const component = new VelocityComponent(props);

      expect(component.vx).toBe(Number.MIN_SAFE_INTEGER);
      expect(component.vy).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('should handle very small positive values', () => {
      const props: VelocityComponentProps = { vx: Number.EPSILON, vy: Number.MIN_VALUE };
      const component = new VelocityComponent(props);

      expect(component.vx).toBe(Number.EPSILON);
      expect(component.vy).toBe(Number.MIN_VALUE);
    });

    it('should handle Infinity values', () => {
      const props: VelocityComponentProps = { vx: Infinity, vy: -Infinity };
      const component = new VelocityComponent(props);

      expect(component.vx).toBe(Infinity);
      expect(component.vy).toBe(-Infinity);
    });
  });

  describe('Edge Cases', () => {
    it('should handle NaN velocities', () => {
      const props: VelocityComponentProps = { vx: NaN, vy: NaN };
      const component = new VelocityComponent(props);

      expect(Number.isNaN(component.vx)).toBe(true);
      expect(Number.isNaN(component.vy)).toBe(true);
    });

    it('should handle mixed valid and invalid velocities', () => {
      const props: VelocityComponentProps = { vx: 1, vy: NaN };
      const component = new VelocityComponent(props);

      expect(component.vx).toBe(1);
      expect(Number.isNaN(component.vy)).toBe(true);
    });

    it('should handle negative zero values', () => {
      const props: VelocityComponentProps = { vx: -0, vy: 0 };
      const component = new VelocityComponent(props);

      expect(component.vx).toBe(-0);
      expect(component.vy).toBe(0);
      expect(Object.is(component.vx, -0)).toBe(true);
    });
  });

  describe('Component Type', () => {
    it('should always have the correct component type', () => {
      const component = new VelocityComponent({ vx: 1, vy: 1 });
      expect(component.type).toBe(ComponentType.Velocity);
    });

    it('should maintain type consistency across instances', () => {
      const component1 = new VelocityComponent({ vx: 0, vy: 0 });
      const component2 = new VelocityComponent({ vx: 10, vy: -5 });
      
      expect(component1.type).toBe(component2.type);
      expect(component1.type).toBe(ComponentType.Velocity);
    });
  });

  describe('Property Modification', () => {
    it('should allow direct property modification', () => {
      const component = new VelocityComponent({ vx: 1, vy: 2 });
      
      component.vx = -3;
      component.vy = 4;
      
      expect(component.vx).toBe(-3);
      expect(component.vy).toBe(4);
    });

    it('should handle velocity direction changes', () => {
      const component = new VelocityComponent({ vx: 5, vy: -5 });
      
      // Reverse both directions
      component.vx = -component.vx;
      component.vy = -component.vy;
      
      expect(component.vx).toBe(-5);
      expect(component.vy).toBe(5);
    });

    it('should handle velocity magnitude changes', () => {
      const component = new VelocityComponent({ vx: 1, vy: 1 });
      
      // Double the magnitude
      component.vx *= 2;
      component.vy *= 2;
      
      expect(component.vx).toBe(2);
      expect(component.vy).toBe(2);
    });
  });

  describe('Physics Calculations Compatibility', () => {
    it('should support velocity magnitude calculation', () => {
      const component = new VelocityComponent({ vx: 3, vy: 4 });
      
      const magnitude = Math.sqrt(component.vx * component.vx + component.vy * component.vy);
      
      expect(magnitude).toBe(5); // 3-4-5 triangle
    });

    it('should support velocity normalization', () => {
      const component = new VelocityComponent({ vx: 6, vy: 8 });
      
      const magnitude = Math.sqrt(component.vx * component.vx + component.vy * component.vy);
      component.vx = component.vx / magnitude;
      component.vy = component.vy / magnitude;
      
      const newMagnitude = Math.sqrt(component.vx * component.vx + component.vy * component.vy);
      
      expect(newMagnitude).toBeCloseTo(1, 10); // Normalized to unit vector
      expect(component.vx).toBe(0.6);
      expect(component.vy).toBe(0.8);
    });

    it('should handle zero velocity normalization gracefully', () => {
      const component = new VelocityComponent({ vx: 0, vy: 0 });
      
      const magnitude = Math.sqrt(component.vx * component.vx + component.vy * component.vy);
      
      expect(magnitude).toBe(0);
      // Division by zero would result in NaN, which is expected behavior
    });
  });

  describe('Serialization Compatibility', () => {
    it('should be JSON serializable', () => {
      const component = new VelocityComponent({ vx: 2.5, vy: -1.8 });
      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.vx).toBe(2.5);
      expect(parsed.vy).toBe(-1.8);
      expect(parsed.type).toBe(ComponentType.Velocity);
    });

    it('should handle serialization with zero values', () => {
      const component = new VelocityComponent({ vx: 0, vy: -0 });
      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.vx).toBe(0);
      expect(parsed.vy).toBe(0);
    });
  });
});

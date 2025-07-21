import { describe, it, expect } from 'vitest';
import {
  PositionComponent,
  type PositionComponentProps,
} from '../PositionComponent';
import { ComponentType } from '../../ComponentTypes';

describe('PositionComponent', () => {
  describe('Component Creation', () => {
    it('should create a position component with valid coordinates', () => {
      const props: PositionComponentProps = { x: 5, y: 10 };
      const component = new PositionComponent(props);

      expect(component.type).toBe(ComponentType.Position);
      expect(component.x).toBe(5);
      expect(component.y).toBe(10);
    });

    it('should create component with zero coordinates', () => {
      const props: PositionComponentProps = { x: 0, y: 0 };
      const component = new PositionComponent(props);

      expect(component.x).toBe(0);
      expect(component.y).toBe(0);
    });

    it('should create component with negative coordinates', () => {
      const props: PositionComponentProps = { x: -5, y: -10 };
      const component = new PositionComponent(props);

      expect(component.x).toBe(-5);
      expect(component.y).toBe(-10);
    });

    it('should create component with fractional coordinates', () => {
      const props: PositionComponentProps = { x: 1.5, y: 2.7 };
      const component = new PositionComponent(props);

      expect(component.x).toBe(1.5);
      expect(component.y).toBe(2.7);
    });
  });

  describe('Property Validation', () => {
    it('should handle very large coordinate values', () => {
      const props: PositionComponentProps = {
        x: Number.MAX_SAFE_INTEGER,
        y: Number.MAX_SAFE_INTEGER,
      };
      const component = new PositionComponent(props);

      expect(component.x).toBe(Number.MAX_SAFE_INTEGER);
      expect(component.y).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle very small coordinate values', () => {
      const props: PositionComponentProps = {
        x: Number.MIN_SAFE_INTEGER,
        y: Number.MIN_SAFE_INTEGER,
      };
      const component = new PositionComponent(props);

      expect(component.x).toBe(Number.MIN_SAFE_INTEGER);
      expect(component.y).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('should handle Infinity values', () => {
      const props: PositionComponentProps = { x: Infinity, y: -Infinity };
      const component = new PositionComponent(props);

      expect(component.x).toBe(Infinity);
      expect(component.y).toBe(-Infinity);
    });
  });

  describe('Edge Cases', () => {
    it('should handle NaN coordinates', () => {
      const props: PositionComponentProps = { x: NaN, y: NaN };
      const component = new PositionComponent(props);

      expect(Number.isNaN(component.x)).toBe(true);
      expect(Number.isNaN(component.y)).toBe(true);
    });

    it('should handle mixed valid and invalid coordinates', () => {
      const props: PositionComponentProps = { x: 5, y: NaN };
      const component = new PositionComponent(props);

      expect(component.x).toBe(5);
      expect(Number.isNaN(component.y)).toBe(true);
    });
  });

  describe('Component Type', () => {
    it('should always have the correct component type', () => {
      const component = new PositionComponent({ x: 1, y: 2 });
      expect(component.type).toBe(ComponentType.Position);
    });

    it('should maintain type consistency across instances', () => {
      const component1 = new PositionComponent({ x: 0, y: 0 });
      const component2 = new PositionComponent({ x: 100, y: 200 });

      expect(component1.type).toBe(component2.type);
      expect(component1.type).toBe(ComponentType.Position);
    });
  });

  describe('Property Modification', () => {
    it('should allow direct property modification', () => {
      const component = new PositionComponent({ x: 1, y: 2 });

      component.x = 10;
      component.y = 20;

      expect(component.x).toBe(10);
      expect(component.y).toBe(20);
    });

    it('should handle property modification with edge values', () => {
      const component = new PositionComponent({ x: 1, y: 2 });

      component.x = -0;
      component.y = 0;

      // -0 is still 0 in JavaScript, but Object.is distinguishes them
      expect(component.x).toBe(-0);
      expect(component.y).toBe(0);
      expect(Object.is(component.x, -0)).toBe(true);
    });
  });

  describe('Serialization Compatibility', () => {
    it('should be JSON serializable', () => {
      const component = new PositionComponent({ x: 5, y: 10 });
      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);

      expect(parsed.x).toBe(5);
      expect(parsed.y).toBe(10);
      expect(parsed.type).toBe(ComponentType.Position);
    });

    it('should handle serialization with special values', () => {
      const component = new PositionComponent({ x: 0, y: -0 });
      const serialized = JSON.stringify(component);
      const parsed = JSON.parse(serialized);

      expect(parsed.x).toBe(0);
      expect(parsed.y).toBe(0);
    });
  });
});

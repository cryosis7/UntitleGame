import { describe, it, expect } from 'vitest';
import { InteractionBehaviorType } from '../InteractionBehaviorType';

describe('InteractionBehaviorType', () => {
  describe('Enum Values', () => {
    it('should have TRANSFORM behavior type', () => {
      expect(InteractionBehaviorType.TRANSFORM).toBe('transform');
    });

    it('should have REMOVE behavior type', () => {
      expect(InteractionBehaviorType.REMOVE).toBe('remove');
    });

    it('should have SPAWN_CONTENTS behavior type', () => {
      expect(InteractionBehaviorType.SPAWN_CONTENTS).toBe('spawn_contents');
    });

    it('should have all expected enum values', () => {
      const expectedValues = ['transform', 'remove', 'spawn_contents'];
      const actualValues = Object.values(InteractionBehaviorType);

      expect(actualValues).toHaveLength(expectedValues.length);
      expectedValues.forEach((value) => {
        expect(actualValues).toContain(value);
      });
    });
  });

  describe('Enum Keys', () => {
    it('should have TRANSFORM key', () => {
      expect(InteractionBehaviorType).toHaveProperty('TRANSFORM');
    });

    it('should have REMOVE key', () => {
      expect(InteractionBehaviorType).toHaveProperty('REMOVE');
    });

    it('should have SPAWN_CONTENTS key', () => {
      expect(InteractionBehaviorType).toHaveProperty('SPAWN_CONTENTS');
    });

    it('should have all expected enum keys', () => {
      const expectedKeys = ['TRANSFORM', 'REMOVE', 'SPAWN_CONTENTS'];
      const actualKeys = Object.keys(InteractionBehaviorType);

      expect(actualKeys).toHaveLength(expectedKeys.length);
      expectedKeys.forEach((key) => {
        expect(actualKeys).toContain(key);
      });
    });
  });

  describe('Type Safety', () => {
    it('should be assignable to string', () => {
      const behavior: string = InteractionBehaviorType.TRANSFORM;
      expect(typeof behavior).toBe('string');
    });

    it('should work with switch statements', () => {
      const testBehavior = (behavior: InteractionBehaviorType): string => {
        switch (behavior) {
          case InteractionBehaviorType.TRANSFORM:
            return 'transform';
          case InteractionBehaviorType.REMOVE:
            return 'remove';
          case InteractionBehaviorType.SPAWN_CONTENTS:
            return 'spawn_contents';
          default:
            return 'unknown';
        }
      };

      expect(testBehavior(InteractionBehaviorType.TRANSFORM)).toBe('transform');
      expect(testBehavior(InteractionBehaviorType.REMOVE)).toBe('remove');
      expect(testBehavior(InteractionBehaviorType.SPAWN_CONTENTS)).toBe(
        'spawn_contents',
      );
    });

    it('should work with object comparisons', () => {
      const behaviors = [
        InteractionBehaviorType.TRANSFORM,
        InteractionBehaviorType.REMOVE,
        InteractionBehaviorType.SPAWN_CONTENTS,
      ];

      expect(behaviors.includes(InteractionBehaviorType.TRANSFORM)).toBe(true);
      expect(behaviors.includes(InteractionBehaviorType.REMOVE)).toBe(true);
      expect(behaviors.includes(InteractionBehaviorType.SPAWN_CONTENTS)).toBe(
        true,
      );
    });
  });

  describe('Enum Usage Scenarios', () => {
    it('should work as object property', () => {
      const config = {
        doorBehavior: InteractionBehaviorType.TRANSFORM,
        barrierBehavior: InteractionBehaviorType.REMOVE,
        chestBehavior: InteractionBehaviorType.SPAWN_CONTENTS,
      };

      expect(config.doorBehavior).toBe(InteractionBehaviorType.TRANSFORM);
      expect(config.barrierBehavior).toBe(InteractionBehaviorType.REMOVE);
      expect(config.chestBehavior).toBe(InteractionBehaviorType.SPAWN_CONTENTS);
    });

    it('should work in array operations', () => {
      const allBehaviors = Object.values(InteractionBehaviorType);

      const filteredBehaviors = allBehaviors.filter(
        (behavior) => behavior !== InteractionBehaviorType.REMOVE,
      );

      expect(filteredBehaviors).toHaveLength(2);
      expect(filteredBehaviors).toContain(InteractionBehaviorType.TRANSFORM);
      expect(filteredBehaviors).toContain(
        InteractionBehaviorType.SPAWN_CONTENTS,
      );
      expect(filteredBehaviors).not.toContain(InteractionBehaviorType.REMOVE);
    });
  });
});

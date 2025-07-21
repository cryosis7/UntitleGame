import { InteractionBehaviorComponent } from '../InteractionBehaviorComponent';
import { InteractionBehaviorType } from '../InteractionBehaviorType';
import { ComponentType } from '../../ComponentTypes';

describe('InteractionBehaviorComponent', () => {
  describe('Constructor', () => {
    it('should create component with required properties', () => {
      const component = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.REMOVE,
      });

      expect(component.type).toBe(ComponentType.InteractionBehavior);
      expect(component.behaviorType).toBe(InteractionBehaviorType.REMOVE);
      expect(component.newSpriteId).toBeUndefined();
      expect(component.isRepeatable).toBe(false);
    });

    it('should create component with all properties specified', () => {
      const component = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.TRANSFORM,
        newSpriteId: 'door_open',
        isRepeatable: true,
      });

      expect(component.type).toBe(ComponentType.InteractionBehavior);
      expect(component.behaviorType).toBe(InteractionBehaviorType.TRANSFORM);
      expect(component.newSpriteId).toBe('door_open');
      expect(component.isRepeatable).toBe(true);
    });

    it('should default isRepeatable to false when not specified', () => {
      const component = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
      });

      expect(component.isRepeatable).toBe(false);
    });
  });

  describe('TRANSFORM Behavior Validation', () => {
    it('should require newSpriteId for TRANSFORM behavior', () => {
      expect(() => {
        new InteractionBehaviorComponent({
          behaviorType: InteractionBehaviorType.TRANSFORM,
        });
      }).toThrow(
        'InteractionBehaviorComponent: newSpriteId is required when behaviorType is TRANSFORM',
      );
    });

    it('should allow TRANSFORM behavior with newSpriteId', () => {
      expect(() => {
        new InteractionBehaviorComponent({
          behaviorType: InteractionBehaviorType.TRANSFORM,
          newSpriteId: 'door_open',
        });
      }).not.toThrow();
    });

    it('should create valid TRANSFORM component', () => {
      const component = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.TRANSFORM,
        newSpriteId: 'chest_open',
        isRepeatable: false,
      });

      expect(component.behaviorType).toBe(InteractionBehaviorType.TRANSFORM);
      expect(component.newSpriteId).toBe('chest_open');
      expect(component.isRepeatable).toBe(false);
    });
  });

  describe('REMOVE Behavior', () => {
    it('should allow REMOVE behavior without newSpriteId', () => {
      const component = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.REMOVE,
      });

      expect(component.behaviorType).toBe(InteractionBehaviorType.REMOVE);
      expect(component.newSpriteId).toBeUndefined();
    });

    it('should allow REMOVE behavior with newSpriteId (ignored)', () => {
      const component = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.REMOVE,
        newSpriteId: 'ignored_sprite',
      });

      expect(component.behaviorType).toBe(InteractionBehaviorType.REMOVE);
      expect(component.newSpriteId).toBe('ignored_sprite');
    });
  });

  describe('SPAWN_CONTENTS Behavior', () => {
    it('should allow SPAWN_CONTENTS behavior without newSpriteId', () => {
      const component = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
      });

      expect(component.behaviorType).toBe(
        InteractionBehaviorType.SPAWN_CONTENTS,
      );
      expect(component.newSpriteId).toBeUndefined();
    });

    it('should allow SPAWN_CONTENTS behavior with isRepeatable', () => {
      const component = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
        isRepeatable: true,
      });

      expect(component.behaviorType).toBe(
        InteractionBehaviorType.SPAWN_CONTENTS,
      );
      expect(component.isRepeatable).toBe(true);
    });
  });

  describe('Component Type Integration', () => {
    it('should have correct ComponentType', () => {
      const component = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.REMOVE,
      });

      expect(component.type).toBe(ComponentType.InteractionBehavior);
      expect(component.type).toBe('interactionBehavior');
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle all behavior types correctly', () => {
      const transformComponent = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.TRANSFORM,
        newSpriteId: 'test',
      });
      const removeComponent = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.REMOVE,
      });
      const spawnComponent = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
      });

      expect(transformComponent.behaviorType).toBe(
        InteractionBehaviorType.TRANSFORM,
      );
      expect(removeComponent.behaviorType).toBe(InteractionBehaviorType.REMOVE);
      expect(spawnComponent.behaviorType).toBe(
        InteractionBehaviorType.SPAWN_CONTENTS,
      );
    });

    it('should handle isRepeatable variations', () => {
      const repeatableComponent = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.REMOVE,
        isRepeatable: true,
      });
      const nonRepeatableComponent = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.REMOVE,
        isRepeatable: false,
      });

      expect(repeatableComponent.isRepeatable).toBe(true);
      expect(nonRepeatableComponent.isRepeatable).toBe(false);
    });
  });

  describe('Game Logic Integration', () => {
    it('should support door unlocking scenario', () => {
      const doorBehavior = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.TRANSFORM,
        newSpriteId: 'door_open',
        isRepeatable: false,
      });

      expect(doorBehavior.behaviorType).toBe(InteractionBehaviorType.TRANSFORM);
      expect(doorBehavior.newSpriteId).toBe('door_open');
      expect(doorBehavior.isRepeatable).toBe(false);
    });

    it('should support barrier destruction scenario', () => {
      const barrierBehavior = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.REMOVE,
        isRepeatable: false,
      });

      expect(barrierBehavior.behaviorType).toBe(InteractionBehaviorType.REMOVE);
      expect(barrierBehavior.isRepeatable).toBe(false);
    });

    it('should support chest opening scenario', () => {
      const chestBehavior = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
        isRepeatable: false,
      });

      expect(chestBehavior.behaviorType).toBe(
        InteractionBehaviorType.SPAWN_CONTENTS,
      );
      expect(chestBehavior.isRepeatable).toBe(false);
    });

    it('should support switch activation scenario (repeatable)', () => {
      const switchBehavior = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.TRANSFORM,
        newSpriteId: 'switch_on',
        isRepeatable: true,
      });

      expect(switchBehavior.behaviorType).toBe(
        InteractionBehaviorType.TRANSFORM,
      );
      expect(switchBehavior.newSpriteId).toBe('switch_on');
      expect(switchBehavior.isRepeatable).toBe(true);
    });
  });
});

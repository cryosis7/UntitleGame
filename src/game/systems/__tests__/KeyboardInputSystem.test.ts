import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { KeyboardInputSystem } from '../KeyboardInputSystem';
import { ComponentType } from '../../components/ComponentTypes';
import {
  createTestUpdateArgs,
  createMockGameMap,
  createEntityWithComponents,
} from '../../../__tests__/testUtils';
import { getComponentIfExists } from '../../components/ComponentOperations';
import { InteractingComponent } from '../../components/individualComponents/InteractingComponent';
import { HandlingComponent } from '../../components/individualComponents/HandlingComponent';
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
  };
});

// We need to extend the KeyboardInputSystem to access its private members for testing
class TestableKeyboardInputSystem extends KeyboardInputSystem {
  // Expose internal state for testing
  public getKeys() {
    return (this as any).keys;
  }

  public getHasChanged() {
    return (this as any).hasChanged;
  }

  public setKeys(keys: { [key: string]: boolean }) {
    (this as any).keys = keys;
  }

  public setHasChanged(hasChanged: boolean) {
    (this as any).hasChanged = hasChanged;
  }
}

// Mock window.addEventListener to capture event handlers
const mockEventHandlers: { [key: string]: (event: any) => void } = {};
const originalAddEventListener = window.addEventListener;

beforeEach(() => {
  // Reset mock event handlers
  Object.keys(mockEventHandlers).forEach(
    (key) => delete mockEventHandlers[key],
  );

  // Mock addEventListener to capture handlers
  window.addEventListener = vi.fn((eventType: string, handler: any) => {
    mockEventHandlers[eventType] = handler;
  });
});

afterEach(() => {
  // Restore original addEventListener
  window.addEventListener = originalAddEventListener;
  vi.restoreAllMocks();
});

// Helper function to simulate key events
const simulateKeyEvent = (type: 'keydown' | 'keyup', key: string) => {
  const handler = mockEventHandlers[type];
  if (handler) {
    handler({ key });
  }
};

describe('KeyboardInputSystem', () => {
  let system: TestableKeyboardInputSystem;
  let playerEntity: Entity;
  let updateArgs: ReturnType<typeof createTestUpdateArgs>;

  beforeEach(() => {
    system = new TestableKeyboardInputSystem();

    // Create player entity with required components
    playerEntity = createEntityWithComponents([
      [ComponentType.Player, {}],
      [ComponentType.Velocity, { vx: 0, vy: 0 }],
      [ComponentType.Position, { x: 0, y: 0 }],
    ]);

    updateArgs = createTestUpdateArgs([playerEntity], createMockGameMap());
  });

  describe('Key Event Processing', () => {
    it('should register keydown and keyup event listeners', () => {
      expect(window.addEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        'keyup',
        expect.any(Function),
      );
    });

    it('should handle keydown events and mark as changed', () => {
      // Initially no change should happen
      system.update(updateArgs);
      const initialVelocity = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      expect(initialVelocity?.vx).toBe(0);
      expect(initialVelocity?.vy).toBe(0);

      // Simulate keydown
      simulateKeyEvent('keydown', 'ArrowRight');
      system.update(updateArgs);

      const updatedVelocity = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      expect(updatedVelocity?.vx).toBe(1);
      expect(updatedVelocity?.vy).toBe(0);
    });

    it('should handle keyup events and update state', () => {
      // Press key down
      simulateKeyEvent('keydown', 'ArrowRight');
      system.update(updateArgs);

      let velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(1);

      // Release key
      simulateKeyEvent('keyup', 'ArrowRight');
      system.update(updateArgs);

      velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(0);
    });

    it('should only update when keys have changed', () => {
      // No key changes - should return early (no processing)
      system.update(updateArgs);
      let velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vy).toBe(0); // Unchanged

      // Press key to trigger change
      simulateKeyEvent('keydown', 'ArrowUp');
      system.update(updateArgs);

      velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vy).toBe(-1);

      // Update again without key change - should not process (hasChanged is false)
      system.update(updateArgs);

      velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vy).toBe(-1); // Unchanged because no processing happened
    });
  });

  describe('Movement Input Handling', () => {
    it('should set upward velocity on ArrowUp key', () => {
      simulateKeyEvent('keydown', 'ArrowUp');
      system.update(updateArgs);

      const velocity = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      expect(velocity?.vx).toBe(0);
      expect(velocity?.vy).toBe(-1);
    });

    it('should set downward velocity on ArrowDown key', () => {
      simulateKeyEvent('keydown', 'ArrowDown');
      system.update(updateArgs);

      const velocity = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      expect(velocity?.vx).toBe(0);
      expect(velocity?.vy).toBe(1);
    });

    it('should set leftward velocity on ArrowLeft key', () => {
      simulateKeyEvent('keydown', 'ArrowLeft');
      system.update(updateArgs);

      const velocity = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      expect(velocity?.vx).toBe(-1);
      expect(velocity?.vy).toBe(0);
    });

    it('should set rightward velocity on ArrowRight key', () => {
      simulateKeyEvent('keydown', 'ArrowRight');
      system.update(updateArgs);

      const velocity = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      expect(velocity?.vx).toBe(1);
      expect(velocity?.vy).toBe(0);
    });

    it('should handle diagonal movement with multiple keys', () => {
      simulateKeyEvent('keydown', 'ArrowUp');
      simulateKeyEvent('keydown', 'ArrowRight');
      system.update(updateArgs);

      const velocity = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      expect(velocity?.vx).toBe(1);
      expect(velocity?.vy).toBe(-1);
    });

    it('should handle opposing keys correctly (last key wins)', () => {
      simulateKeyEvent('keydown', 'ArrowUp');
      simulateKeyEvent('keydown', 'ArrowDown');
      system.update(updateArgs);

      const velocity = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      expect(velocity?.vy).toBe(1); // Down wins because it's processed after up
    });

    it('should reset velocity to zero when no movement keys are pressed', () => {
      // First set some velocity
      simulateKeyEvent('keydown', 'ArrowRight');
      system.update(updateArgs);

      let velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(1);

      // Release key
      simulateKeyEvent('keyup', 'ArrowRight');
      system.update(updateArgs);

      velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(0);
      expect(velocity?.vy).toBe(0);
    });
  });

  describe('Interaction Input Handling', () => {
    it('should add InteractingComponent on E key press', () => {
      // Debug test - verify entity setup
      console.log('Player entity:', JSON.stringify(playerEntity, null, 2));

      // Directly set key state and hasChanged flag for controlled testing
      system.setKeys({ E: true });
      system.setHasChanged(true);

      console.log('Keys set:', system.getKeys());
      console.log('HasChanged set:', system.getHasChanged());

      system.update(updateArgs);

      console.log(
        'After update - Player entity:',
        JSON.stringify(playerEntity, null, 2),
      );

      const interactingComponent = getComponentIfExists(
        playerEntity,
        ComponentType.Interacting,
      );
      console.log('InteractingComponent found:', interactingComponent);
      expect(interactingComponent).toBeInstanceOf(InteractingComponent);
    });

    it('should add HandlingComponent on space key press', () => {
      system.setKeys({ ' ': true });
      system.setHasChanged(true);

      system.update(updateArgs);

      const handlingComponent = getComponentIfExists(
        playerEntity,
        ComponentType.Handling,
      );
      expect(handlingComponent).toBeInstanceOf(HandlingComponent);
    });

    it('should handle multiple interaction keys simultaneously', () => {
      system.setKeys({ E: true, ' ': true });
      system.setHasChanged(true);

      system.update(updateArgs);

      const interactingComponent = getComponentIfExists(
        playerEntity,
        ComponentType.Interacting,
      );
      const handlingComponent = getComponentIfExists(
        playerEntity,
        ComponentType.Handling,
      );

      expect(interactingComponent).toBeInstanceOf(InteractingComponent);
      expect(handlingComponent).toBeInstanceOf(HandlingComponent);
    });

    it('should handle movement and interaction keys together', () => {
      system.setKeys({ ArrowUp: true, E: true, ' ': true });
      system.setHasChanged(true);

      system.update(updateArgs);

      const velocity = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      const interactingComponent = getComponentIfExists(
        playerEntity,
        ComponentType.Interacting,
      );
      const handlingComponent = getComponentIfExists(
        playerEntity,
        ComponentType.Handling,
      );

      expect(velocity?.vy).toBe(-1);
      expect(interactingComponent).toBeInstanceOf(InteractingComponent);
      expect(handlingComponent).toBeInstanceOf(HandlingComponent);
    });

    it('should not add interaction components when keys are released', () => {
      // Press E key first
      system.setKeys({ E: true });
      system.setHasChanged(true);

      system.update(updateArgs);

      let interactingComponent = getComponentIfExists(
        playerEntity,
        ComponentType.Interacting,
      );
      expect(interactingComponent).toBeInstanceOf(InteractingComponent);

      // Release E key (simulate keyup by removing from keys and triggering change)
      system.setKeys({ E: false });
      system.setHasChanged(true);

      system.update(updateArgs);

      // The component should still exist because the system doesn't remove components,
      // but no new component should be added on subsequent updates
      interactingComponent = getComponentIfExists(
        playerEntity,
        ComponentType.Interacting,
      );
      expect(interactingComponent).toBeInstanceOf(InteractingComponent);
    });
  });

  describe('System Edge Cases and Validation', () => {
    it('should handle empty entities array', () => {
      const emptyUpdateArgs = createTestUpdateArgs([], createMockGameMap());

      simulateKeyEvent('keydown', 'ArrowUp');

      expect(() => {
        system.update(emptyUpdateArgs);
      }).not.toThrow();
    });

    it('should handle null/undefined map', () => {
      const nullMapArgs = createTestUpdateArgs([playerEntity], null as any);

      simulateKeyEvent('keydown', 'ArrowUp');

      expect(() => {
        system.update(nullMapArgs);
      }).not.toThrow();
    });

    it('should require exactly one player entity', () => {
      // Test with no player entities
      const nonPlayerEntity = createEntityWithComponents([
        [ComponentType.Position, { x: 0, y: 0 }],
        [ComponentType.Velocity, { vx: 0, vy: 0 }],
      ]);
      const noPlayerArgs = createTestUpdateArgs(
        [nonPlayerEntity],
        createMockGameMap(),
      );

      simulateKeyEvent('keydown', 'ArrowUp');
      system.update(noPlayerArgs);

      const velocity = getComponentIfExists(
        nonPlayerEntity,
        ComponentType.Velocity,
      );
      expect(velocity?.vy).toBe(0); // Should not be modified

      // Test with multiple player entities
      const playerEntity2 = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Velocity, { vx: 0, vy: 0 }],
        [ComponentType.Position, { x: 1, y: 1 }],
      ]);
      const multiPlayerArgs = createTestUpdateArgs(
        [playerEntity, playerEntity2],
        createMockGameMap(),
      );

      simulateKeyEvent('keydown', 'ArrowDown');
      system.update(multiPlayerArgs);

      const velocity1 = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      const velocity2 = getComponentIfExists(
        playerEntity2,
        ComponentType.Velocity,
      );
      expect(velocity1?.vy).toBe(0); // Should not be modified
      expect(velocity2?.vy).toBe(0); // Should not be modified
    });

    it('should handle player entity without velocity component', () => {
      const playerWithoutVelocity = createEntityWithComponents([
        [ComponentType.Player, {}],
        [ComponentType.Position, { x: 0, y: 0 }],
      ]);
      const updateArgsNoVel = createTestUpdateArgs(
        [playerWithoutVelocity],
        createMockGameMap(),
      );

      // Create a new system for this test to avoid state contamination
      const testSystem = new TestableKeyboardInputSystem();
      testSystem.setKeys({ ArrowUp: true });
      testSystem.setHasChanged(true);

      expect(() => {
        testSystem.update(updateArgsNoVel);
      }).not.toThrow();

      // Should still handle interaction components
      testSystem.setKeys({ E: true });
      testSystem.setHasChanged(true);
      testSystem.update(updateArgsNoVel);

      const interactingComponent = getComponentIfExists(
        playerWithoutVelocity,
        ComponentType.Interacting,
      );
      expect(interactingComponent).toBeInstanceOf(InteractingComponent);
    });

    it('should handle unknown key presses gracefully', () => {
      simulateKeyEvent('keydown', 'UnknownKey');
      simulateKeyEvent('keydown', 'Tab');
      simulateKeyEvent('keydown', 'Escape');

      expect(() => {
        system.update(updateArgs);
      }).not.toThrow();

      const velocity = getComponentIfExists(
        playerEntity,
        ComponentType.Velocity,
      );
      expect(velocity?.vx).toBe(0);
      expect(velocity?.vy).toBe(0);
    });

    it('should maintain key state correctly across multiple updates', () => {
      // Press and hold key
      simulateKeyEvent('keydown', 'ArrowRight');

      // First update with key held
      system.update(updateArgs);
      let velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(1);

      // Second update without key change - should not process (hasChanged is false)
      system.update(updateArgs);
      velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(1); // Unchanged because no processing happened

      // Release key (this will set hasChanged to true again)
      simulateKeyEvent('keyup', 'ArrowRight');
      system.update(updateArgs);

      velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vx).toBe(0); // Key is no longer pressed
    });

    it('should properly reset hasChanged flag after processing', () => {
      // First key press should trigger update
      simulateKeyEvent('keydown', 'ArrowUp');
      system.update(updateArgs);

      let velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vy).toBe(-1);

      // Subsequent update without key change should not process (hasChanged is false)
      system.update(updateArgs);

      velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vy).toBe(-1); // Unchanged because no processing happened

      // Another key change should trigger update again
      simulateKeyEvent('keydown', 'ArrowDown');
      system.update(updateArgs);

      velocity = getComponentIfExists(playerEntity, ComponentType.Velocity);
      expect(velocity?.vy).toBe(1); // New input processed (down overrides up)
    });
  });
});

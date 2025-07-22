/**
 * Centralized ECS Test Setup Utilities
 * 
 * This module provides standardized test setup and configuration for ECS tests.
 * Use these utilities to ensure consistent test environments across all ECS components and systems.
 */

import { vi, beforeEach, afterEach } from 'vitest';
import { setupPixiMocks } from '../mocks/pixiMocks';
import type { Entity } from '../../src/game/utils/ecsUtils';
import type { UpdateArgs } from '../../src/game/systems/Systems';

/**
 * Standard test setup for ECS components and systems
 * Call this in describe blocks for consistent test environment
 */
export function setupECSTestEnvironment() {
  beforeEach(() => {
    // Setup Pixi.js mocks for components that use rendering
    setupPixiMocks();
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Reset any global state
    resetTestState();
  });
  
  afterEach(() => {
    // Clean up after each test
    vi.clearAllMocks();
    resetTestState();
  });
}

/**
 * Resets shared test state to prevent test pollution
 */
export function resetTestState() {
  // Clear any singleton state that might persist between tests
  // This ensures test isolation
}

/**
 * Creates a minimal ECS test environment with entities and systems
 */
export function createMinimalECSEnvironment() {
  const entities: Entity[] = [];
  const systems: any[] = [];
  
  const addEntity = (entity: Entity) => {
    entities.push(entity);
    return entity;
  };
  
  const removeEntity = (entityId: string) => {
    const index = entities.findIndex(e => e.id === entityId);
    if (index > -1) {
      entities.splice(index, 1);
    }
  };
  
  const addSystem = (system: any) => {
    systems.push(system);
    return system;
  };
  
  return {
    entities,
    systems,
    addEntity,
    removeEntity,
    addSystem,
    getEntities: () => [...entities],
    getSystems: () => [...systems]
  };
}

/**
 * Default mock UpdateArgs for system testing
 */
export function createStandardUpdateArgs(entities: Entity[] = []): UpdateArgs {
  return {
    entities,
    map: {
      id: 'test-map',
      hasChanged: false,
      isPositionInMap: vi.fn().mockReturnValue(true),
      isTileWalkable: vi.fn().mockReturnValue(true),
      getAdjacentPosition: vi.fn().mockImplementation((pos, direction) => {
        // Simple mock adjacent position calculation
        switch (direction) {
          case 'up': return { x: pos.x, y: pos.y - 1 };
          case 'down': return { x: pos.x, y: pos.y + 1 };
          case 'left': return { x: pos.x - 1, y: pos.y };
          case 'right': return { x: pos.x + 1, y: pos.y };
          default: return pos;
        }
      }),
      getAllEntities: vi.fn().mockReturnValue([]),
      getTile: vi.fn().mockReturnValue(null),
      isValidPosition: vi.fn().mockReturnValue(true)
    },
    time: {
      deltaTime: 1,
      elapsedMS: 16.67,
      lastTime: Date.now(),
      speed: 1,
      started: true
    }
  };
}

/**
 * Common component test patterns
 */
export const ComponentTestPatterns = {
  /**
   * Test that a component has the correct type
   */
  shouldHaveCorrectType(component: any, expectedType: any) {
    return () => {
      expect(component.type).toBe(expectedType);
    };
  },

  /**
   * Test that a component is serializable
   */
  shouldBeSerializable(component: any) {
    return () => {
      expect(() => JSON.stringify(component)).not.toThrow();
      const serialized = JSON.stringify(component);
      expect(serialized).toBeDefined();
      expect(typeof serialized).toBe('string');
    };
  },

  /**
   * Test that a component creates distinct instances
   */
  shouldCreateDistinctInstances(ComponentClass: any, props1: any, props2: any) {
    return () => {
      const instance1 = new ComponentClass(props1);
      const instance2 = new ComponentClass(props2);
      
      expect(instance1).not.toBe(instance2);
      expect(instance1.type).toBe(instance2.type);
    };
  }
};

/**
 * Common system test patterns
 */
export const SystemTestPatterns = {
  /**
   * Test that a system handles empty entity arrays
   */
  shouldHandleEmptyEntities(SystemClass: any) {
    return () => {
      const system = new SystemClass();
      const updateArgs = createStandardUpdateArgs([]);
      
      expect(() => system.update([], updateArgs)).not.toThrow();
    };
  },

  /**
   * Test that a system has required interface methods
   */
  shouldImplementSystemInterface(SystemClass: any) {
    return () => {
      const system = new SystemClass();
      
      expect(system).toHaveProperty('update');
      expect(typeof system.update).toBe('function');
    };
  }
};

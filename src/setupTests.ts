import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// React Testing Library cleanup (this should happen automatically, but ensure it does)
import { cleanup } from '@testing-library/react';

// Global test configuration for ECS testing suite

// Mock GameMap to avoid Pixi.js initialization issues during testing
vi.mock('../game/map/GameMap', () => {
  class MockGameMap {
    id: string;
    hasChanged: boolean;

    constructor() {
      this.id = crypto.randomUUID();
      this.hasChanged = true;
    }

    init() {}
    getAllEntities() {
      return [];
    }
    getSpriteContainer() {
      return {};
    }
    isPositionInMap() {
      return true;
    }
    getTile() {
      return null;
    }
    getAdjacentPosition(pos: any, direction: string) {
      return pos;
    }
    getAdjacentTile() {
      return null;
    }
    isTileWalkable() {
      return true;
    }
    isValidPosition() {
      return true;
    }
  }

  return { GameMap: MockGameMap };
});

// Mock Pixi.js before any imports that might use it
vi.mock('pixi.js', () => {
  const mockContainer = () => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    visible: true,
    alpha: 1,
    scale: { x: 1, y: 1 },
    position: { x: 0, y: 0 },
    parent: null,
    children: [],
    destroyed: false,
    addChild: vi.fn(),
    removeChild: vi.fn(),
    removeChildren: vi.fn(),
    destroy: vi.fn(),
    eventMode: 'auto',
  });

  const mockSprite = () => ({
    ...mockContainer(),
    texture: null,
    anchor: { x: 0, y: 0 },
    tint: 0xffffff,
  });

  const mockTexture = () => ({
    width: 100,
    height: 100,
    valid: true,
    destroyed: false,
    source: null,
    destroy: vi.fn(),
  });

  return {
    Application: vi.fn(() => ({
      stage: mockContainer(),
      ticker: {
        started: false,
        speed: 1,
        deltaTime: 1,
        elapsedMS: 16,
        lastTime: 0,
        add: vi.fn(),
        remove: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        update: vi.fn(),
        destroy: vi.fn(),
      },
      canvas: {
        width: 800,
        height: 600,
      },
      view: {
        width: 800,
        height: 600,
      },
      screen: { width: 800, height: 600 },
      init: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
    })),
    Container: vi.fn(() => mockContainer()),
    Sprite: vi.fn(() => mockSprite()),
    Graphics: vi.fn(() => mockContainer()),
    Ticker: vi.fn(() => ({
      started: false,
      speed: 1,
      deltaTime: 1,
      elapsedMS: 16,
      lastTime: 0,
      add: vi.fn(),
      remove: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      update: vi.fn(),
      destroy: vi.fn(),
    })),
    Texture: {
      from: vi.fn(() => mockTexture()),
      EMPTY: mockTexture(),
    },
    Spritesheet: vi.fn(() => ({
      textures: {},
      parse: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
    })),
  };
});

// Clean up jsdom after each test to prevent memory leaks
afterEach(() => {
  // Only clear elements that are not from React Testing Library
  // React Testing Library cleanup is handled separately
  const reactRoot = document.querySelector('[data-testid]')?.parentElement;

  // Clear DOM except for React Testing Library managed elements
  Array.from(document.body.children).forEach((child) => {
    // Keep React Testing Library containers
    if (child !== reactRoot && !child.hasAttribute('data-testid')) {
      child.remove();
    }
  });
});
afterEach(cleanup);

// Mock console methods to prevent test output noise unless explicitly needed
const originalConsole = { ...console };
Object.assign(console, {
  // Silence console.log in tests unless NODE_ENV is explicitly set for debugging
  log:
    import.meta.env.NODE_ENV === 'test-debug' ? originalConsole.log : vi.fn(),
  warn:
    import.meta.env.NODE_ENV === 'test-debug' ? originalConsole.warn : vi.fn(),
  error: originalConsole.error, // Keep errors visible
});

// Global timeout for async operations in ECS tests
vi.setConfig({
  testTimeout: 10000,
  hookTimeout: 10000,
});

// Common test utilities available globally
(globalThis as any).testUtils = {
  // Helper to wait for next tick
  waitForNextTick: () => new Promise((resolve) => setTimeout(resolve, 0)),

  // Helper to create DOM elements for testing
  createTestElement: (
    tag: string = 'div',
    attributes: Record<string, string> = {},
  ) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  },
};

// Type declaration for global test utilities
declare global {
  var testUtils: {
    waitForNextTick: () => Promise<void>;
    createTestElement: (
      tag?: string,
      attributes?: Record<string, string>,
    ) => HTMLElement;
  };
}

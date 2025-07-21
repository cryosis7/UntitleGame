import { vi } from 'vitest';

// Mock Pixi.js classes for headless testing
// This file provides mocks for all Pixi.js classes used in the game

// Base display object mock with common properties
const createDisplayObjectMock = () => ({
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
});

// Container mock - extends display object with child management
export const mockContainer = () => ({
  ...createDisplayObjectMock(),
  addChild: vi.fn().mockImplementation(function (this: any, child: any) {
    this.children.push(child);
    child.parent = this;
    return child;
  }),
  removeChild: vi.fn().mockImplementation(function (this: any, child: any) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
    return child;
  }),
  removeChildren: vi.fn().mockImplementation(function (this: any) {
    this.children.forEach((child: any) => (child.parent = null));
    this.children.length = 0;
  }),
});

// Sprite mock - display object that can have textures
export const mockSprite = () => ({
  ...createDisplayObjectMock(),
  texture: null,
  anchor: { x: 0, y: 0 },
  tint: 0xffffff,
  setSize: vi.fn().mockImplementation(function (this: any, size: number) {
    this.width = size;
    this.height = size;
  }),
});

// Graphics mock - for drawing shapes
export const mockGraphics = () => ({
  ...createDisplayObjectMock(),
  clear: vi.fn().mockReturnThis(),
  beginFill: vi.fn().mockReturnThis(),
  endFill: vi.fn().mockReturnThis(),
  drawRect: vi.fn().mockReturnThis(),
  drawCircle: vi.fn().mockReturnThis(),
  lineStyle: vi.fn().mockReturnThis(),
  moveTo: vi.fn().mockReturnThis(),
  lineTo: vi.fn().mockReturnThis(),
});

// Texture mock - represents image textures
export const mockTexture = () => ({
  width: 100,
  height: 100,
  valid: true,
  destroyed: false,
  source: null,
  destroy: vi.fn(),
});

// Spritesheet mock - manages collections of textures
export const mockSpritesheet = () => ({
  textures: {},
  parse: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn(),
});

// Ticker mock - manages frame updates
export const mockTicker = () => ({
  started: false,
  speed: 1,
  deltaTime: 1,
  elapsedMS: 16,
  lastTime: 0,
  add: vi.fn(),
  remove: vi.fn(),
  start: vi.fn().mockImplementation(function (this: any) {
    this.started = true;
  }),
  stop: vi.fn().mockImplementation(function (this: any) {
    this.started = false;
  }),
  update: vi.fn(),
  destroy: vi.fn(),
});

// Application mock - main Pixi application
export const mockApplication = () => ({
  stage: mockContainer(),
  ticker: mockTicker(),
  canvas: document.createElement('canvas'),
  view: document.createElement('canvas'),
  renderer: {
    width: 800,
    height: 600,
    resolution: 1,
    backgroundColor: 0x000000,
  },
  screen: { width: 800, height: 600 },
  init: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn(),
  render: vi.fn(),
  resize: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
});

// Assets mock - handles asset loading
export const mockAssets = {
  load: vi.fn(async (_path?: string) => mockTexture()),
  get: vi.fn((_path?: string) => mockTexture()),
  add: vi.fn().mockReturnThis(),
  loadBundle: vi.fn().mockResolvedValue({}),
};

// Mock constructors that return our mock objects
export const Container = vi.fn(() => mockContainer());
export const Sprite = vi.fn(() => mockSprite());
export const Graphics = vi.fn(() => mockGraphics());
export const Application = vi.fn(() => mockApplication());
export const Ticker = vi.fn(() => mockTicker());
export const Spritesheet = vi.fn((_texture?: any, _data?: any) =>
  mockSpritesheet(),
);

// Static methods and properties
export const Texture = {
  from: vi.fn((_source?: string) => mockTexture()),
  WHITE: mockTexture(),
  EMPTY: mockTexture(),
};

export const Assets = mockAssets;

// Factory functions for easy test usage
export const createMockPixiApp = () => mockApplication();
export const createMockContainer = () => mockContainer();
export const createMockSprite = () => mockSprite();
export const createMockGraphics = () => mockGraphics();
export const createMockTexture = () => mockTexture();
export const createMockSpritesheet = () => mockSpritesheet();
export const createMockTicker = () => mockTicker();

// Mock setup utilities
export const setupPixiMocks = () => {
  // Clear all mock call history
  vi.clearAllMocks();

  // Reset any shared state
  Container.mockClear();
  Sprite.mockClear();
  Graphics.mockClear();
  Application.mockClear();
  Ticker.mockClear();
  Spritesheet.mockClear();
  Texture.from.mockClear();
  Assets.load.mockClear();
  Assets.get.mockClear();
};

// Helper to mock Pixi.js module imports
export const mockPixiModule = () => {
  vi.mock('pixi.js', () => ({
    Application,
    Container,
    Sprite,
    Graphics,
    Ticker,
    Spritesheet,
    Texture,
    Assets,
  }));
};

import { vi } from 'vitest';
import type { Entity } from '../game/utils/ecsUtils';
import type { UpdateArgs } from '../game/systems/Systems';
import {
  ComponentType,
  type ComponentDictionary,
  type Component,
  type FullComponentDictionary,
} from '../game/components/ComponentTypes';
import {
  hasComponent,
  getComponentIfExists,
  getComponentAbsolute,
} from '../game/components/ComponentOperations';

// Import all component classes for factory functions
import {
  PositionComponent,
  type PositionComponentProps,
} from '../game/components/individualComponents/PositionComponent';
import { PlayerComponent } from '../game/components/individualComponents/PlayerComponent';
import { MovableComponent } from '../game/components/individualComponents/MovableComponent';
import {
  VelocityComponent,
  type VelocityComponentProps,
} from '../game/components/individualComponents/VelocityComponent';
import { PickableComponent } from '../game/components/individualComponents/PickableComponent';
import {
  CarriedItemComponent,
  type CarriedItemComponentProps,
} from '../game/components/individualComponents/CarriedItemComponent';
import { InteractingComponent } from '../game/components/individualComponents/InteractingComponent';
import { HandlingComponent } from '../game/components/individualComponents/HandlingComponent';
import { WalkableComponent } from '../game/components/individualComponents/WalkableComponent';
import { RenderInSidebarComponent } from '../game/components/individualComponents/RenderInSidebarComponent';
import {
  RequiresItemComponent,
  type RequiresItemComponentProps,
} from '../game/components/individualComponents/RequiresItemComponent';
import {
  UsableItemComponent,
  type UsableItemComponentProps,
} from '../game/components/individualComponents/UsableItemComponent';
import {
  InteractionBehaviorComponent,
  type InteractionBehaviorComponentProps,
} from '../game/components/individualComponents/InteractionBehaviorComponent';
import {
  SpawnContentsComponent,
  type SpawnContentsComponentProps,
} from '../game/components/individualComponents/SpawnContentsComponent';

// Create a simple mock sprite for SpriteComponent testing
const createMockSprite = () => ({
  x: 0,
  y: 0,
  width: 32,
  height: 32,
  visible: true,
  alpha: 1,
  texture: null,
  anchor: { x: 0.5, y: 0.5 },
  tint: 0xffffff,
  destroy: vi.fn(),
});

// SpriteComponent needs special handling due to Pixi.js dependency
class MockSpriteComponent {
  type = ComponentType.Sprite;
  sprite: any;

  constructor({ sprite }: { sprite: string }) {
    this.sprite = createMockSprite();
    // Store the sprite name for testing
    (this.sprite as any).textureName = sprite;
  }
}

/**
 * ECS Test Utilities for Entity Component System Testing
 *
 * This module provides comprehensive testing utilities for:
 * - Creating test entities and components
 * - Asserting component states and properties
 * - Mocking system update arguments
 * - Creating test game maps
 * - Managing test state isolation and cleanup
 */

// =============================================================================
// Entity Factory Functions
// =============================================================================

/**
 * Creates a test entity with optional components
 * @param components - Optional component dictionary to attach to entity
 * @param id - Optional custom entity ID (defaults to UUID)
 * @returns Test entity with specified components
 */
export function createTestEntity(
  components: ComponentDictionary = {},
  id?: string,
): Entity {
  return {
    id: id ?? crypto.randomUUID(),
    components,
  };
}

/**
 * Creates a test component of the specified type with given properties
 * @param componentType - Type of component to create
 * @param props - Properties to initialize the component with
 * @returns Initialized component instance
 */
export function createTestComponent<T extends ComponentType>(
  componentType: T,
  props: any = {},
): FullComponentDictionary[T] {
  switch (componentType) {
    case ComponentType.Position:
      return new PositionComponent(
        props as PositionComponentProps,
      ) as FullComponentDictionary[T];
    case ComponentType.Sprite:
      return new MockSpriteComponent(
        props,
      ) as any as FullComponentDictionary[T];
    case ComponentType.Player:
      return new PlayerComponent() as FullComponentDictionary[T];
    case ComponentType.Movable:
      return new MovableComponent() as FullComponentDictionary[T];
    case ComponentType.Velocity:
      return new VelocityComponent(
        props as VelocityComponentProps,
      ) as FullComponentDictionary[T];
    case ComponentType.Pickable:
      return new PickableComponent() as FullComponentDictionary[T];
    case ComponentType.CarriedItem:
      return new CarriedItemComponent(
        props as CarriedItemComponentProps,
      ) as FullComponentDictionary[T];
    case ComponentType.Interacting:
      return new InteractingComponent() as FullComponentDictionary[T];
    case ComponentType.Handling:
      return new HandlingComponent() as FullComponentDictionary[T];
    case ComponentType.Walkable:
      return new WalkableComponent() as FullComponentDictionary[T];
    case ComponentType.RenderInSidebar:
      return new RenderInSidebarComponent() as FullComponentDictionary[T];
    case ComponentType.RequiresItem:
      return new RequiresItemComponent(
        props as RequiresItemComponentProps,
      ) as FullComponentDictionary[T];
    case ComponentType.UsableItem:
      return new UsableItemComponent(
        props as UsableItemComponentProps,
      ) as FullComponentDictionary[T];
    case ComponentType.InteractionBehavior:
      return new InteractionBehaviorComponent(
        props as InteractionBehaviorComponentProps,
      ) as FullComponentDictionary[T];
    case ComponentType.SpawnContents:
      return new SpawnContentsComponent(
        props as SpawnContentsComponentProps,
      ) as FullComponentDictionary[T];
    default:
      throw new Error(`Unknown component type: ${componentType}`);
  }
}

/**
 * Creates a test entity with specified components using factory pattern
 * @param componentConfigs - Array of component type and props pairs
 * @param id - Optional custom entity ID
 * @returns Test entity with all specified components attached
 *
 * @example
 * const entity = createEntityWithComponents([
 *   [ComponentType.Position, { x: 5, y: 10 }],
 *   [ComponentType.Player, {}],
 *   [ComponentType.Movable, {}]
 * ]);
 */
export function createEntityWithComponents(
  componentConfigs: Array<[ComponentType, any]>,
  id?: string,
): Entity {
  const components: ComponentDictionary = {};

  componentConfigs.forEach(([type, props]) => {
    components[type] = createTestComponent(type, props);
  });

  return createTestEntity(components, id);
}

// =============================================================================
// Component Assertion Helpers
// =============================================================================

/**
 * Asserts that an entity has a specific component
 * @param entity - Entity to check
 * @param componentType - Expected component type
 * @throws Error if entity doesn't have the component
 */
export function expectEntityHasComponent(
  entity: Entity,
  componentType: ComponentType,
): void {
  if (!hasComponent(entity, componentType)) {
    throw new Error(
      `Expected entity ${entity.id} to have component ${componentType}, but it doesn't`,
    );
  }
}

/**
 * Asserts that an entity does not have a specific component
 * @param entity - Entity to check
 * @param componentType - Component type that should not exist
 * @throws Error if entity has the component
 */
export function expectEntityDoesNotHaveComponent(
  entity: Entity,
  componentType: ComponentType,
): void {
  if (hasComponent(entity, componentType)) {
    throw new Error(
      `Expected entity ${entity.id} to NOT have component ${componentType}, but it does`,
    );
  }
}

/**
 * Asserts that a component has specific properties
 * @param entity - Entity containing the component
 * @param componentType - Type of component to check
 * @param expectedProps - Expected property values
 * @throws Error if component properties don't match expected values
 */
export function expectComponentProps<T extends ComponentType>(
  entity: Entity,
  componentType: T,
  expectedProps: Partial<FullComponentDictionary[T]>,
): void {
  expectEntityHasComponent(entity, componentType);

  const component = getComponentAbsolute(entity, componentType);

  Object.entries(expectedProps).forEach(([key, expectedValue]) => {
    const actualValue = (component as any)[key];
    if (actualValue !== expectedValue) {
      throw new Error(
        `Expected component ${componentType} property ${key} to be ${expectedValue}, but got ${actualValue}`,
      );
    }
  });
}

/**
 * Gets a component from an entity for testing (throws if not found)
 * @param entity - Entity to get component from
 * @param componentType - Type of component to retrieve
 * @returns The component instance
 * @throws Error if component doesn't exist
 */
export function getTestComponent<T extends ComponentType>(
  entity: Entity,
  componentType: T,
): FullComponentDictionary[T] {
  const component = getComponentIfExists(entity, componentType);
  if (!component) {
    throw new Error(
      `Entity ${entity.id} does not have component ${componentType}`,
    );
  }
  return component as FullComponentDictionary[T];
}

// =============================================================================
// System Testing Utilities
// =============================================================================

/**
 * Creates a simple mock GameMap interface for testing
 */
export interface MockGameMap {
  id: string;
  hasChanged: boolean;
  getAllEntities(): Entity[];
  getSpriteContainer(): any;
  isPositionInMap(pos: { x: number; y: number }): boolean;
  getTile(pos: { x: number; y: number }): Entity | null;
  getAdjacentPosition(
    pos: { x: number; y: number },
    direction: string,
  ): { x: number; y: number };
  getAdjacentTile(
    pos: { x: number; y: number },
    direction: string,
  ): Entity | null;
  isTileWalkable(pos: { x: number; y: number }): boolean;
  isValidPosition(pos: { x: number; y: number }): boolean;
}

/**
 * Creates mock UpdateArgs for system testing
 * @param entities - Array of entities to process
 * @param map - Optional mock game map (creates default if not provided)
 * @param time - Optional mock Ticker (creates mock if not provided)
 * @returns Mock UpdateArgs object
 */
export function createTestUpdateArgs(
  entities: Entity[] = [],
  map?: MockGameMap,
  time?: any,
): UpdateArgs {
  return {
    entities,
    map: map ?? createMockGameMap(),
    time: time ?? createMockTicker(),
  } as UpdateArgs;
}

/**
 * Creates a mock Pixi.js Ticker for system testing
 * @param deltaTime - Mock delta time value
 * @returns Mock ticker object
 */
export function createMockTicker(deltaTime: number = 1): any {
  return {
    deltaTime,
    elapsedMS: 16.67, // ~60 FPS
    lastTime: Date.now(),
    speed: 1,
    started: true,
    add: vi.fn(),
    remove: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    update: vi.fn(),
  };
}

// =============================================================================
// GameMap Mocking Utilities
// =============================================================================

/**
 * Creates a mock GameMap for testing
 * @param width - Map width (default: 10)
 * @param height - Map height (default: 10)
 * @param entities - Optional array of entities to place on map
 * @returns Mock GameMap instance
 */
export function createMockGameMap(
  width: number = 10,
  height: number = 10,
  entities: Entity[] = [],
): MockGameMap {
  const tiles: (Entity | null)[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(null));

  // Place entities on the map
  entities.forEach((entity) => {
    if (hasComponent(entity, ComponentType.Position)) {
      const pos = getTestComponent(entity, ComponentType.Position);
      if (pos.x < width && pos.y < height && pos.x >= 0 && pos.y >= 0) {
        tiles[pos.y][pos.x] = entity;
      }
    }
  });

  const mockMap: MockGameMap = {
    id: crypto.randomUUID(),
    hasChanged: true,

    getAllEntities: vi.fn(() => entities),

    getSpriteContainer: vi.fn(() => ({
      addChild: vi.fn(),
      removeChild: vi.fn(),
      children: [],
    })),

    isPositionInMap: vi.fn(
      (pos: { x: number; y: number }) =>
        pos.x >= 0 && pos.y >= 0 && pos.x < width && pos.y < height,
    ),

    getTile: vi.fn((pos: { x: number; y: number }) => {
      if (pos.x >= 0 && pos.y >= 0 && pos.x < width && pos.y < height) {
        return tiles[pos.y][pos.x];
      }
      return null;
    }),

    getAdjacentPosition: vi.fn(
      (pos: { x: number; y: number }, direction: string) => {
        switch (direction) {
          case 'up':
            return { x: pos.x, y: pos.y - 1 };
          case 'down':
            return { x: pos.x, y: pos.y + 1 };
          case 'left':
            return { x: pos.x - 1, y: pos.y };
          case 'right':
            return { x: pos.x + 1, y: pos.y };
          default:
            return pos;
        }
      },
    ),

    getAdjacentTile: vi.fn(
      (pos: { x: number; y: number }, direction: string) => {
        const adjPos = mockMap.getAdjacentPosition(pos, direction);
        return mockMap.getTile(adjPos);
      },
    ),

    isTileWalkable: vi.fn((pos: { x: number; y: number }) => {
      const tile = mockMap.getTile(pos);
      return tile ? hasComponent(tile, ComponentType.Walkable) : false;
    }),

    isValidPosition: vi.fn((pos: { x: number; y: number }) => {
      // A position is valid if it's in bounds.
      // Empty positions (null tiles) are valid for movement.
      // Tiles with entities are valid only if the entity has a Walkable component.
      if (!mockMap.isPositionInMap(pos)) return false;

      const tile = mockMap.getTile(pos);
      // Empty position (null tile) is valid
      if (tile === null) return true;

      // Position with entity is valid only if entity is walkable
      return hasComponent(tile, ComponentType.Walkable);
    }),
  };

  return mockMap;
}

// =============================================================================
// Test State Management and Cleanup
// =============================================================================

/**
 * Cleans up test state by clearing all vi.fn() mocks
 * Call this in beforeEach or afterEach to ensure test isolation
 */
export function cleanupTestState(): void {
  // Clear any vi.fn() mocks
  vi.clearAllMocks();
}

/**
 * Creates an isolated test environment with fresh mock setup
 * @returns Object with helper functions for the test environment
 */
export function createTestEnvironment() {
  // Clean slate
  cleanupTestState();

  const testEntities: Entity[] = [];
  const testMap = createMockGameMap();

  // Helper to add entity to test environment
  const addEntity = (entity: Entity) => {
    testEntities.push(entity);
    return entity;
  };

  // Helper to remove entity from test environment
  const removeEntity = (entityId: string) => {
    const index = testEntities.findIndex((e) => e.id === entityId);
    if (index > -1) {
      testEntities.splice(index, 1);
    }
  };

  // Helper to get current entities
  const getEntities = () => [...testEntities];

  // Helper to set test map
  const setMap = (map: MockGameMap) => {
    // Update test map reference
    Object.assign(testMap, map);
  };

  return {
    addEntity,
    removeEntity,
    getEntities,
    setMap,
    map: testMap,
    cleanup: cleanupTestState,
  };
}

// =============================================================================
// Advanced Test Utilities
// =============================================================================

/**
 * Creates multiple test entities with random IDs and components
 * @param count - Number of entities to create
 * @param componentFactory - Function that returns components for each entity
 * @returns Array of test entities
 */
export function createMultipleTestEntities(
  count: number,
  componentFactory: (index: number) => ComponentDictionary = () => ({}),
): Entity[] {
  return Array.from({ length: count }, (_, index) =>
    createTestEntity(componentFactory(index)),
  );
}

/**
 * Finds entities in an array that have all specified components
 * @param entities - Array of entities to filter
 * @param componentTypes - Component types that entities must have
 * @returns Filtered array of entities
 */
export function findEntitiesWithComponents(
  entities: Entity[],
  ...componentTypes: ComponentType[]
): Entity[] {
  return entities.filter((entity) =>
    componentTypes.every((type) => hasComponent(entity, type)),
  );
}

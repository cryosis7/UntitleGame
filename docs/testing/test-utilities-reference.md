# Test Utilities Quick Reference

## Overview

This document provides quick reference examples for using the ECS test utilities and helper functions. Use this as a cheat sheet when writing new tests.

## Test Utilities (`src/__tests__/testUtils.ts`)

### Entity Creation

#### Basic Entity Creation

```typescript
import { createTestEntity } from '../__tests__/testUtils';

// Create empty entity
const entity = createTestEntity();

// Create entity with specific ID
const entity = createTestEntity('player-1');
```

#### Entity with Components

```typescript
import { createEntityWith } from '../__tests__/testUtils';
import { PositionComponent, VelocityComponent } from '../game/components';

// Create entity with multiple components
const entity = createEntityWith(PositionComponent, VelocityComponent);

// Create entity without specific components (for negative testing)
const entity = createEntityWithout(VelocityComponent);
```

#### Specialized Entity Factories

```typescript
// Pre-configured entities for common test scenarios
const player = createPlayerEntity(); // Position + Player + Movable
const item = createPickableItem('sword'); // Position + Pickable + Sprite
const wall = createWallEntity(); // Position + Sprite + !Walkable
```

### Component Operations

#### Component Management

```typescript
import {
  addComponent,
  removeComponent,
  hasComponent,
  getComponent,
} from '../__tests__/testUtils';

// Add component to entity
addComponent(entity, PositionComponent, { x: 10, y: 20 });

// Check if entity has component
if (hasComponent(entity, PositionComponent)) {
  // Get component data
  const position = getComponent(entity, PositionComponent);
  console.log(position.x, position.y);
}

// Remove component
removeComponent(entity, PositionComponent);
```

#### Component Assertions

```typescript
import {
  expectEntityHasComponent,
  expectComponentProps,
} from '../__tests__/testUtils';

// Assert entity has required components
expectEntityHasComponent(entity, PositionComponent);
expectEntityHasComponent(entity, VelocityComponent);

// Assert component properties
expectComponentProps(entity, PositionComponent, { x: 10, y: 20 });
expectComponentProps(entity, VelocityComponent, { dx: 5, dy: 0 });
```

### Mock Data Creation

#### Update Arguments

```typescript
import { createTestUpdateArgs } from '../__tests__/testUtils';

// Create mock update arguments for system tests
const mockArgs = createTestUpdateArgs();

// With custom delta time
const mockArgs = createTestUpdateArgs({ deltaTime: 33.33 }); // 30 FPS

// With custom game map
const mockArgs = createTestUpdateArgs({
  gameMap: createMockGameMap({ width: 1024, height: 768 }),
});
```

#### Game Map Mocking

```typescript
import { createMockGameMap } from '../__tests__/testUtils';

// Basic mock game map
const gameMap = createMockGameMap();

// Mock with custom dimensions
const gameMap = createMockGameMap({ width: 800, height: 600 });

// Mock with specific tile behavior
const gameMap = createMockGameMap({
  isWalkable: vi.fn().mockReturnValue(false), // All tiles blocked
  getTileAt: vi.fn().mockReturnValue({ type: 'wall' }),
});
```

#### Input State Mocking

```typescript
import { createMockInputState } from '../__tests__/testUtils';

// Mock with no keys pressed
const inputState = createMockInputState();

// Mock with specific keys pressed
const inputState = createMockInputState({
  keys: { w: true, a: false, s: false, d: false },
});

// Mock mouse input
const inputState = createMockInputState({
  mouse: { x: 100, y: 150, leftButton: true },
});
```

### Collection Utilities

#### Entity Filtering

```typescript
import {
  filterEntitiesWith,
  filterEntitiesWithout,
} from '../__tests__/testUtils';

const entities = [
  /* ... */
];

// Get entities with specific components
const movableEntities = filterEntitiesWith(
  entities,
  PositionComponent,
  VelocityComponent,
);

// Get entities without specific components
const staticEntities = filterEntitiesWithout(entities, VelocityComponent);
```

#### Counting Utilities

```typescript
import { countEntitiesWith, expectEntityCount } from '../__tests__/testUtils';

// Count entities with components
const playerCount = countEntitiesWith(entities, PlayerComponent);

// Assert entity counts
expectEntityCount(entities, PickableComponent, 5); // Expect 5 pickable items
expectEntityCount(entities, PlayerComponent, 1); // Expect 1 player
```

## PIXI.js Mocks (`src/__tests__/mocks/pixiMocks.ts`)

### Sprite Mocking

```typescript
import { createMockSprite } from '../__tests__/mocks/pixiMocks';

// Basic sprite mock
const sprite = createMockSprite();

// Sprite with custom properties
const sprite = createMockSprite({
  x: 100,
  y: 200,
  width: 64,
  height: 64,
  texture: 'player.png',
});

// Sprite with event listeners
const sprite = createMockSprite();
sprite.on = vi.fn();
sprite.emit = vi.fn();
```

### Application Mocking

```typescript
import { createMockApplication } from '../__tests__/mocks/pixiMocks';

// Mock PIXI Application
const app = createMockApplication();

// Verify stage interactions
app.stage.addChild(sprite);
expect(app.stage.addChild).toHaveBeenCalledWith(sprite);

// Mock ticker behavior
app.ticker.add(gameLoop);
expect(app.ticker.add).toHaveBeenCalledWith(gameLoop);
```

### Graphics Mocking

```typescript
import { createMockGraphics } from '../__tests__/mocks/pixiMocks';

// Mock graphics object for drawing
const graphics = createMockGraphics();

graphics.beginFill(0xff0000);
graphics.drawRect(0, 0, 100, 100);
graphics.endFill();

// Verify drawing calls
expect(graphics.beginFill).toHaveBeenCalledWith(0xff0000);
expect(graphics.drawRect).toHaveBeenCalledWith(0, 0, 100, 100);
```

## Component Test Templates

### Basic Component Test

```typescript
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  describe('constructor', () => {
    it('should create with valid data', () => {
      const component = new ComponentName({
        /* valid props */
      });
      expect(component).toBeDefined();
    });

    it('should throw with invalid data', () => {
      expect(() => new ComponentName(null)).toThrow();
    });
  });

  describe('properties', () => {
    it('should get and set properties correctly', () => {
      const component = new ComponentName({ property: 'value' });
      expect(component.property).toBe('value');

      component.property = 'newValue';
      expect(component.property).toBe('newValue');
    });
  });
});
```

### Position Component Test Example

```typescript
import { PositionComponent } from '../PositionComponent';

describe('PositionComponent', () => {
  it('should create with coordinates', () => {
    const pos = new PositionComponent({ x: 10, y: 20 });
    expect(pos.x).toBe(10);
    expect(pos.y).toBe(20);
  });

  it('should handle negative coordinates', () => {
    const pos = new PositionComponent({ x: -5, y: -10 });
    expect(pos.x).toBe(-5);
    expect(pos.y).toBe(-10);
  });

  it('should validate coordinate types', () => {
    expect(() => new PositionComponent({ x: 'invalid', y: 0 })).toThrow();
    expect(() => new PositionComponent({ x: NaN, y: 0 })).toThrow();
  });
});
```

## System Test Templates

### Basic System Test

```typescript
import { SystemName } from '../SystemName';
import {
  createTestEntity,
  createTestUpdateArgs,
} from '../../__tests__/testUtils';

describe('SystemName', () => {
  let mockUpdateArgs: UpdateArgs;

  beforeEach(() => {
    mockUpdateArgs = createTestUpdateArgs();
  });

  describe('entity filtering', () => {
    it('should only process entities with required components', () => {
      const validEntity = createEntityWith(
        RequiredComponent1,
        RequiredComponent2,
      );
      const invalidEntity = createEntityWith(RequiredComponent1); // Missing component 2

      const entities = [validEntity, invalidEntity];
      const result = SystemName.update(entities, mockUpdateArgs);

      expect(result.processedCount).toBe(1);
    });
  });

  describe('processing logic', () => {
    it('should transform entity data correctly', () => {
      const entity = createEntityWith(RequiredComponent1, RequiredComponent2);
      // Set up initial state

      SystemName.update([entity], mockUpdateArgs);

      // Assert expected transformations
      const component = getComponent(entity, RequiredComponent1);
      expect(component.someProperty).toBe(expectedValue);
    });
  });
});
```

### Movement System Test Example

```typescript
import { MovementSystem } from '../MovementSystem';
import { PositionComponent, VelocityComponent } from '../components';

describe('MovementSystem', () => {
  it('should update position based on velocity', () => {
    const entity = createEntityWith(PositionComponent, VelocityComponent);

    // Set initial position and velocity
    addComponent(entity, PositionComponent, { x: 0, y: 0 });
    addComponent(entity, VelocityComponent, { dx: 5, dy: -3 });

    const mockArgs = createTestUpdateArgs({ deltaTime: 16.67 });
    MovementSystem.update([entity], mockArgs);

    const position = getComponent(entity, PositionComponent);
    expect(position.x).toBeCloseTo(5);
    expect(position.y).toBeCloseTo(-3);
  });
});
```

## Integration Test Templates

### System Chain Test

```typescript
describe('System Integration', () => {
  it('should process entities through multiple systems', () => {
    const player = createPlayerEntity();
    const entities = [player];
    const mockArgs = createTestUpdateArgs();

    // System 1: Input Processing
    KeyboardInputSystem.update(entities, mockArgs);
    const velocity = getComponent(player, VelocityComponent);
    expect(velocity.dx).not.toBe(0); // Input should create movement

    // System 2: Movement Processing
    MovementSystem.update(entities, mockArgs);
    const position = getComponent(player, PositionComponent);
    expect(position.x).toBe(velocity.dx); // Position should update

    // System 3: Rendering
    RenderSystem.update(entities, mockArgs);
    const sprite = getComponent(player, SpriteComponent);
    expect(sprite.x).toBe(position.x); // Sprite should match position
  });
});
```

### Gameplay Scenario Test

```typescript
describe('Item Pickup Scenario', () => {
  it('should complete full pickup workflow', () => {
    const player = createPlayerEntity();
    const item = createPickableItem('health_potion');

    // Position item near player
    positionEntityNear(item, player);

    const entities = [player, item];
    const mockArgs = createTestUpdateArgs();

    // Trigger pickup
    PickupSystem.update(entities, mockArgs);

    // Verify pickup succeeded
    expect(hasComponent(player, CarriedItemComponent)).toBe(true);
    const carried = getComponent(player, CarriedItemComponent);
    expect(carried.itemType).toBe('health_potion');

    // Verify item removed from world
    expect(hasComponent(item, PickableComponent)).toBe(false);
  });
});
```

## Assertion Helpers

### Custom Matchers

```typescript
// Position assertions
expect(position).toBeAtLocation(10, 20);
expect(entity).toBePositionedAt(100, 150);

// Component assertions
expect(entity).toHaveComponent(PositionComponent);
expect(entity).toHaveComponents([PositionComponent, VelocityComponent]);
expect(entity).toMatchComponentState(PositionComponent, { x: 10, y: 20 });

// Collection assertions
expect(entities).toHaveEntityCount(5);
expect(entities).toHaveEntityWithId('player-1');
expect(entities).toContainEntityWith(PlayerComponent);
```

### Numeric Assertions

```typescript
// For floating point comparisons
expect(position.x).toBeCloseTo(10.0, 2); // 2 decimal places
expect(velocity.magnitude).toBeWithinRange(5, 15);

// For game coordinates
expect(position).toBeWithinBounds(gameMap.bounds);
expect(entity).toBeVisibleOnScreen(camera);
```

## Mock Verification

### System Call Verification

```typescript
const systemSpy = vi.spyOn(MovementSystem, 'update');

// Run system
MovementSystem.update(entities, mockArgs);

// Verify calls
expect(systemSpy).toHaveBeenCalledTimes(1);
expect(systemSpy).toHaveBeenCalledWith(entities, mockArgs);

// Verify internal method calls
const processEntitySpy = vi.spyOn(MovementSystem, 'processEntity');
expect(processEntitySpy).toHaveBeenCalledTimes(2); // Two entities processed
```

### PIXI.js Mock Verification

```typescript
const sprite = createMockSprite();

// Test code that uses sprite
RenderSystem.updateSprite(entity, sprite);

// Verify sprite operations
expect(sprite.x).toBe(100);
expect(sprite.y).toBe(200);
expect(sprite.visible).toBe(true);
```

## Common Test Patterns

### Setup and Teardown

```typescript
describe('SystemName', () => {
  let entities: Entity[];
  let mockArgs: UpdateArgs;

  beforeEach(() => {
    entities = [];
    mockArgs = createTestUpdateArgs();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup if needed
    entities.forEach((entity) => (entity.components = {}));
  });
});
```

### Parameterized Tests

```typescript
describe.each([
  { x: 0, y: 0, expected: { x: 5, y: 3 } },
  { x: 10, y: 20, expected: { x: 15, y: 23 } },
  { x: -5, y: -10, expected: { x: 0, y: -7 } },
])('MovementSystem with position $x,$y', ({ x, y, expected }) => {
  it(`should move to ${expected.x},${expected.y}`, () => {
    const entity = createEntityWith(PositionComponent, VelocityComponent);
    addComponent(entity, PositionComponent, { x, y });
    addComponent(entity, VelocityComponent, { dx: 5, dy: 3 });

    MovementSystem.update([entity], mockArgs);

    const position = getComponent(entity, PositionComponent);
    expect(position.x).toBe(expected.x);
    expect(position.y).toBe(expected.y);
  });
});
```

### Error Testing

```typescript
describe('error handling', () => {
  it('should handle null entities gracefully', () => {
    expect(() => SystemName.update(null, mockArgs)).not.toThrow();
  });

  it('should handle invalid component data', () => {
    const entity = createTestEntity();
    addComponent(entity, PositionComponent, { x: NaN, y: 0 });

    expect(() => SystemName.update([entity], mockArgs)).not.toThrow();
    // System should handle or skip invalid data
  });
});
```

This reference guide provides copy-paste examples for common testing scenarios. Refer to the main TESTING_GUIDE.md for detailed explanations and best practices.

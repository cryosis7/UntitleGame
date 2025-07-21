# Testing Guide: ECS Game Development

## Overview

This guide provides comprehensive testing strategies and best practices for Entity-Component-System (ECS) game development. It covers unit testing, integration testing, and the testing infrastructure for this PIXI.js-based ECS game.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Structure and Organization](#test-structure-and-organization)
3. [ECS Testing Patterns](#ecs-testing-patterns)
4. [Component Testing](#component-testing)
5. [System Testing](#system-testing)
6. [Integration Testing](#integration-testing)
7. [Test Utilities and Helpers](#test-utilities-and-helpers)
8. [Mocking Strategies](#mocking-strategies)
9. [Coverage Guidelines](#coverage-guidelines)
10. [CI/CD Integration](#cicd-integration)
11. [Common Patterns and Examples](#common-patterns-and-examples)
12. [Troubleshooting](#troubleshooting)

---

## Testing Philosophy

### ECS-Specific Testing Approach

The Entity-Component-System architecture requires a different testing mindset:

**Entities** → Test as collections of components  
**Components** → Test as data containers with validation  
**Systems** → Test as pure functions processing entities

### Core Principles

1. **Isolation**: Each test should be independent and focused
2. **Predictability**: Tests should produce consistent results
3. **Performance**: Tests should run quickly to encourage frequent execution
4. **Maintainability**: Tests should be easy to understand and modify
5. **Coverage**: Critical game logic should have comprehensive coverage

### Testing Pyramid for ECS Games

```
    /\     Integration Tests (E2E Gameplay)    /\
   /  \           (Fewer, Slower)             /  \
  /____\                                     /____\
 /      \       System Tests                /      \
/        \    (Moderate Coverage)          /        \
/__________\                              /__________\
            \  Component Unit Tests     /
             \   (Many, Fast)          /
              \______________________ /
```

---

## Test Structure and Organization

### Directory Structure

```
src/
├── __tests__/                          # Global test utilities
│   ├── testUtils.ts                   # ECS-specific test helpers
│   ├── testUtilsSimple.ts            # Basic test helpers
│   └── mocks/
│       └── pixiMocks.ts              # PIXI.js mocking
├── game/
│   ├── components/
│   │   └── individualComponents/
│   │       ├── __tests__/            # Component unit tests
│   │       │   ├── PositionComponent.test.ts
│   │       │   ├── VelocityComponent.test.ts
│   │       │   └── ...
│   │       └── ComponentName.ts
│   ├── systems/
│   │   ├── __tests__/               # System unit tests
│   │   │   ├── MovementSystem.test.ts
│   │   │   ├── PickupSystem.test.ts
│   │   │   └── ...
│   │   └── SystemName.ts
│   ├── utils/
│   │   ├── __tests__/               # Utility function tests
│   │   │   ├── ecsUtils.test.ts
│   │   │   └── ...
│   │   └── utilityName.ts
│   └── __tests__/                   # Integration tests
│       ├── ecsIntegration.test.ts   # System integration
│       └── gameplayScenarios.test.ts # End-to-end scenarios
```

### Naming Conventions

#### Test File Naming

- **Component tests**: `ComponentName.test.ts`
- **System tests**: `SystemName.test.ts`
- **Integration tests**: `featureName.test.ts`
- **Utility tests**: `utilityName.test.ts`

#### Test Case Naming

```typescript
describe('MovementSystem', () => {
  describe('when processing entities with velocity', () => {
    it('should update position based on velocity', () => {
      // Test implementation
    });

    it('should handle zero velocity correctly', () => {
      // Test implementation
    });

    it('should respect collision boundaries', () => {
      // Test implementation
    });
  });
});
```

---

## ECS Testing Patterns

### The Three Pillars of ECS Testing

#### 1. Entity Testing Pattern

```typescript
// Test entities as component collections
it('should create a complete player entity', () => {
  const entity = createTestEntity();
  addComponent(entity, PositionComponent, { x: 0, y: 0 });
  addComponent(entity, PlayerComponent, {});
  addComponent(entity, MovableComponent, {});

  expect(hasComponent(entity, PositionComponent)).toBe(true);
  expect(hasComponent(entity, PlayerComponent)).toBe(true);
  expect(hasComponent(entity, MovableComponent)).toBe(true);
});
```

#### 2. Component Testing Pattern

```typescript
// Test components as data containers
it('should validate position coordinates', () => {
  const position = { x: 10, y: 20 };
  const component = new PositionComponent(position);

  expect(component.x).toBe(10);
  expect(component.y).toBe(20);
});

it('should handle invalid position data', () => {
  const invalidPosition = { x: NaN, y: -Infinity };

  expect(() => new PositionComponent(invalidPosition)).toThrow();
});
```

#### 3. System Testing Pattern

```typescript
// Test systems as pure functions
it('should process entities with required components', () => {
  const entities = [
    createEntityWith(PositionComponent, VelocityComponent),
    createEntityWith(PositionComponent, VelocityComponent),
    createEntityWithout(VelocityComponent), // Should be ignored
  ];

  const result = MovementSystem.update(entities, mockUpdateArgs);

  expect(result.processedCount).toBe(2);
});
```

### Test Data Factories

#### Entity Factories

```typescript
// Test-specific entity creation
export function createTestEntity(): Entity {
  return { id: Math.random(), components: {} };
}

export function createPlayerEntity(): Entity {
  const entity = createTestEntity();
  addComponent(entity, PositionComponent, { x: 0, y: 0 });
  addComponent(entity, PlayerComponent, {});
  addComponent(entity, MovableComponent, {});
  return entity;
}

export function createPickableItem(itemType: string): Entity {
  const entity = createTestEntity();
  addComponent(entity, PositionComponent, { x: 5, y: 5 });
  addComponent(entity, PickableComponent, { itemType });
  addComponent(entity, SpriteComponent, { texture: `${itemType}.png` });
  return entity;
}
```

#### Component Factories

```typescript
// Consistent component creation for tests
export function createPosition(
  x: number = 0,
  y: number = 0,
): PositionComponent {
  return new PositionComponent({ x, y });
}

export function createVelocity(
  dx: number = 0,
  dy: number = 0,
): VelocityComponent {
  return new VelocityComponent({ dx, dy });
}
```

---

## Component Testing

### Component Test Structure

Every component test should cover:

1. **Construction**: Valid and invalid initialization
2. **Properties**: Getter and setter behavior
3. **Validation**: Input sanitization and bounds checking
4. **Serialization**: JSON conversion if applicable

### Example: Position Component Testing

```typescript
import { PositionComponent } from '../PositionComponent';

describe('PositionComponent', () => {
  describe('constructor', () => {
    it('should create with valid coordinates', () => {
      const component = new PositionComponent({ x: 10, y: 20 });
      expect(component.x).toBe(10);
      expect(component.y).toBe(20);
    });

    it('should handle zero coordinates', () => {
      const component = new PositionComponent({ x: 0, y: 0 });
      expect(component.x).toBe(0);
      expect(component.y).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const component = new PositionComponent({ x: -5, y: -10 });
      expect(component.x).toBe(-5);
      expect(component.y).toBe(-10);
    });

    it('should throw on invalid coordinates', () => {
      expect(() => new PositionComponent({ x: NaN, y: 0 })).toThrow();
      expect(() => new PositionComponent({ x: 0, y: Infinity })).toThrow();
    });
  });

  describe('property updates', () => {
    it('should update x coordinate', () => {
      const component = new PositionComponent({ x: 0, y: 0 });
      component.x = 15;
      expect(component.x).toBe(15);
    });

    it('should validate property updates', () => {
      const component = new PositionComponent({ x: 0, y: 0 });
      expect(() => (component.x = NaN)).toThrow();
    });
  });
});
```

### Component Testing Checklist

- [ ] Constructor with valid inputs
- [ ] Constructor with edge cases (zeros, negatives)
- [ ] Constructor with invalid inputs (should throw)
- [ ] Property getters return correct values
- [ ] Property setters update correctly
- [ ] Property setters validate inputs
- [ ] Serialization (if implemented)
- [ ] Integration with entity system

---

## System Testing

### System Test Structure

Every system test should cover:

1. **Entity Filtering**: Only processes entities with required components
2. **Processing Logic**: Correct transformations and updates
3. **Edge Cases**: Empty arrays, missing components
4. **Side Effects**: State changes, external interactions
5. **Error Handling**: Invalid inputs, system failures

### Example: Movement System Testing

```typescript
import { MovementSystem } from '../MovementSystem';
import { createTestEntity, addComponent } from '../../__tests__/testUtils';
import { PositionComponent, VelocityComponent } from '../components';

describe('MovementSystem', () => {
  let mockUpdateArgs: UpdateArgs;

  beforeEach(() => {
    mockUpdateArgs = createTestUpdateArgs();
  });

  describe('entity filtering', () => {
    it('should only process entities with Position and Velocity components', () => {
      const entities = [
        createEntityWith(PositionComponent, VelocityComponent), // Should process
        createEntityWith(PositionComponent), // Should skip - no velocity
        createEntityWith(VelocityComponent), // Should skip - no position
        createTestEntity(), // Should skip - no components
      ];

      const spy = vi.spyOn(MovementSystem, 'processEntity');
      MovementSystem.update(entities, mockUpdateArgs);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(entities[0], mockUpdateArgs);
    });
  });

  describe('movement processing', () => {
    it('should update position based on velocity', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 0, y: 0 });
      addComponent(entity, VelocityComponent, { dx: 5, dy: -3 });

      MovementSystem.update([entity], mockUpdateArgs);

      const position = getComponent(entity, PositionComponent);
      expect(position.x).toBe(5);
      expect(position.y).toBe(-3);
    });

    it('should handle zero velocity', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 10, y: 20 });
      addComponent(entity, VelocityComponent, { dx: 0, dy: 0 });

      MovementSystem.update([entity], mockUpdateArgs);

      const position = getComponent(entity, PositionComponent);
      expect(position.x).toBe(10); // No change
      expect(position.y).toBe(20); // No change
    });

    it('should respect movement boundaries', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 0, y: 0 });
      addComponent(entity, VelocityComponent, { dx: -10, dy: -10 });

      MovementSystem.update([entity], mockUpdateArgs);

      const position = getComponent(entity, PositionComponent);
      expect(position.x).toBeGreaterThanOrEqual(0); // Boundary check
      expect(position.y).toBeGreaterThanOrEqual(0); // Boundary check
    });
  });

  describe('edge cases', () => {
    it('should handle empty entity array', () => {
      expect(() => MovementSystem.update([], mockUpdateArgs)).not.toThrow();
    });

    it('should handle null updateArgs gracefully', () => {
      const entities = [createEntityWith(PositionComponent, VelocityComponent)];
      expect(() => MovementSystem.update(entities, null)).not.toThrow();
    });
  });
});
```

### System Testing Checklist

- [ ] Processes only entities with required components
- [ ] Correctly transforms entity data
- [ ] Handles empty entity arrays
- [ ] Respects system boundaries and constraints
- [ ] Manages side effects properly
- [ ] Error handling for invalid inputs
- [ ] Performance with large entity sets

---

## Integration Testing

### Integration Testing Strategy

Integration tests verify that multiple systems work together correctly:

1. **System Chain Testing**: Multiple systems processing same entities
2. **Game Loop Integration**: Full update cycle testing
3. **Cross-System Communication**: Shared state and component interactions
4. **Scenario Testing**: Complete gameplay workflows

### Example: Player Movement Integration

```typescript
describe('Player Movement Integration', () => {
  let gameEntities: Entity[];
  let player: Entity;
  let mockUpdateArgs: UpdateArgs;

  beforeEach(() => {
    // Setup complete game state
    player = createPlayerEntity();
    gameEntities = [player, ...createEnvironmentEntities()];
    mockUpdateArgs = createTestUpdateArgs();
  });

  it('should complete full movement cycle', () => {
    // 1. Input System processes keyboard input
    KeyboardInputSystem.update(gameEntities, mockUpdateArgs);

    // Verify velocity was set
    const velocity = getComponent(player, VelocityComponent);
    expect(velocity.dx).not.toBe(0);

    // 2. Movement System processes velocity
    MovementSystem.update(gameEntities, mockUpdateArgs);

    // Verify position was updated
    const position = getComponent(player, PositionComponent);
    expect(position.x).toBe(velocity.dx);

    // 3. Render System updates visual representation
    RenderSystem.update(gameEntities, mockUpdateArgs);

    // Verify sprite position matches entity position
    const sprite = getComponent(player, SpriteComponent);
    expect(sprite.x).toBe(position.x);
    expect(sprite.y).toBe(position.y);
  });
});
```

### Integration Testing Patterns

#### Game Loop Testing

```typescript
describe('Game Loop Integration', () => {
  it('should execute all systems in correct order', () => {
    const systemOrder: string[] = [];
    const spyInput = vi
      .spyOn(KeyboardInputSystem, 'update')
      .mockImplementation(() => systemOrder.push('Input'));
    const spyMovement = vi
      .spyOn(MovementSystem, 'update')
      .mockImplementation(() => systemOrder.push('Movement'));
    const spyRender = vi
      .spyOn(RenderSystem, 'update')
      .mockImplementation(() => systemOrder.push('Render'));

    GameLoop.update(entities, updateArgs);

    expect(systemOrder).toEqual(['Input', 'Movement', 'Render']);
  });
});
```

---

## Test Utilities and Helpers

### Core Test Utilities (`src/__tests__/testUtils.ts`)

#### Entity Management

```typescript
// Create test entities with specific components
export function createTestEntity(): Entity {
  return { id: Math.random(), components: {} };
}

export function createEntityWith(...componentTypes: ComponentType[]): Entity {
  const entity = createTestEntity();
  componentTypes.forEach((ComponentType) => {
    addComponent(entity, ComponentType, getDefaultProps(ComponentType));
  });
  return entity;
}

// Component operations
export function expectEntityHasComponent(
  entity: Entity,
  componentType: ComponentType,
): void {
  expect(hasComponent(entity, componentType)).toBe(true);
}

export function expectComponentProps(
  entity: Entity,
  componentType: ComponentType,
  expectedProps: any,
): void {
  const component = getComponent(entity, componentType);
  expect(component).toMatchObject(expectedProps);
}
```

#### Mock Data Creation

```typescript
// Create consistent test data
export function createTestUpdateArgs(): UpdateArgs {
  return {
    deltaTime: 16.67, // 60 FPS
    gameMap: createMockGameMap(),
    inputState: createMockInputState(),
  };
}

export function createMockGameMap(): GameMap {
  return {
    width: 800,
    height: 600,
    getTileAt: vi.fn().mockReturnValue(null),
    isWalkable: vi.fn().mockReturnValue(true),
  };
}
```

#### Assertion Helpers

```typescript
// Custom assertions for ECS patterns
export function expectEntityCount(
  entities: Entity[],
  componentType: ComponentType,
  expectedCount: number,
): void {
  const count = entities.filter((entity) =>
    hasComponent(entity, componentType),
  ).length;
  expect(count).toBe(expectedCount);
}

export function expectSystemProcessedEntities(
  systemSpy: any,
  expectedEntityCount: number,
): void {
  expect(systemSpy).toHaveBeenCalledTimes(expectedEntityCount);
}
```

---

## Mocking Strategies

### PIXI.js Mocking (`src/__tests__/mocks/pixiMocks.ts`)

```typescript
// Mock PIXI.js objects that don't need full implementation
export const mockApplication = {
  stage: {
    addChild: vi.fn(),
    removeChild: vi.fn(),
    children: [],
  },
  ticker: {
    add: vi.fn(),
    remove: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  },
};

export const mockSprite = {
  x: 0,
  y: 0,
  width: 32,
  height: 32,
  texture: null,
  visible: true,
};

// Factory functions for consistent mocks
export function createMockSprite(overrides = {}): any {
  return { ...mockSprite, ...overrides };
}
```

### State Management Mocking

```typescript
// Mock Jotai atoms for predictable state
export function createMockAtom<T>(initialValue: T): any {
  let value = initialValue;
  return {
    get: () => value,
    set: (newValue: T) => {
      value = newValue;
    },
    subscribe: vi.fn(),
  };
}
```

### Game Engine Mocking

```typescript
// Mock complex game engine interactions
export const mockGameEngine = {
  entities: [],
  addEntity: vi.fn((entity) => mockGameEngine.entities.push(entity)),
  removeEntity: vi.fn((entity) => {
    const index = mockGameEngine.entities.indexOf(entity);
    if (index > -1) mockGameEngine.entities.splice(index, 1);
  }),
  getEntitiesWith: vi.fn((componentType) =>
    mockGameEngine.entities.filter((e) => hasComponent(e, componentType)),
  ),
};
```

---

## Coverage Guidelines

### Coverage Targets

#### By Component Type

- **Game Logic Components**: 95%+ coverage
- **System Logic**: 90%+ coverage
- **Utility Functions**: 85%+ coverage
- **Integration Scenarios**: 75%+ coverage
- **UI Components**: 70%+ coverage

#### Coverage Metrics

```yaml
# vitest.config.ts coverage thresholds
coverage:
  lines: 80
  functions: 90
  branches: 75
  statements: 80

  # Higher standards for critical game logic
  'src/game/systems/': { lines: 85 }
  'src/game/components/': { lines: 85 }
```

### Exclusion Patterns

```yaml
# Files excluded from coverage
exclude:
  - '**/__tests__/**'
  - '**/*.test.*'
  - '**/*.config.*'
  - '**/mocks/**'
  - 'src/setupTests.ts'
  - '**/*.d.ts'
```

### Coverage Analysis Tools

- **HTML Reports**: Detailed line-by-line coverage visualization
- **JSON Reports**: Programmatic coverage analysis
- **CI Integration**: Automated coverage reporting in PRs
- **Trend Tracking**: Coverage changes over time via Codecov

---

## CI/CD Integration

### Automated Testing Pipeline

#### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml (simplified)
name: Tests and Coverage
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Run tests
        run: yarn test

      - name: Generate coverage
        run: yarn test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

#### PR Coverage Comments

Automated comments provide coverage feedback:

```
## Coverage Report
- **Lines**: 85.2% (+2.1%)
- **Functions**: 92.1% (+0.8%)
- **Branches**: 78.3% (-0.5%)

### Changed Files
- `MovementSystem.ts`: 95.2% (+5.0%)
- `PickupSystem.ts`: 88.7% (-1.2%)
```

### Local Development Integration

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:watch:coverage": "vitest --coverage --watch",
    "coverage:validate": "vitest run --coverage --reporter=verbose"
  }
}
```

---

## Common Patterns and Examples

### Pattern 1: Component Lifecycle Testing

```typescript
describe('Component Lifecycle', () => {
  it('should handle component addition and removal', () => {
    const entity = createTestEntity();

    // Add component
    addComponent(entity, PositionComponent, { x: 0, y: 0 });
    expect(hasComponent(entity, PositionComponent)).toBe(true);

    // Modify component
    const position = getComponent(entity, PositionComponent);
    position.x = 10;
    expect(position.x).toBe(10);

    // Remove component
    removeComponent(entity, PositionComponent);
    expect(hasComponent(entity, PositionComponent)).toBe(false);
  });
});
```

### Pattern 2: System State Isolation

```typescript
describe('System State Isolation', () => {
  it('should not affect entities without required components', () => {
    const entityWithComponents = createEntityWith(
      PositionComponent,
      VelocityComponent,
    );
    const entityWithoutComponents = createTestEntity();

    const originalEntity = { ...entityWithoutComponents };

    MovementSystem.update(
      [entityWithComponents, entityWithoutComponents],
      mockArgs,
    );

    // Entity without components should be unchanged
    expect(entityWithoutComponents).toEqual(originalEntity);
  });
});
```

### Pattern 3: Multi-System Integration

```typescript
describe('Multi-System Integration', () => {
  it('should handle pickup workflow correctly', () => {
    const player = createPlayerEntity();
    const item = createPickableItem('sword');

    // Position item near player
    const itemPosition = getComponent(item, PositionComponent);
    const playerPosition = getComponent(player, PositionComponent);
    itemPosition.x = playerPosition.x;
    itemPosition.y = playerPosition.y;

    const entities = [player, item];

    // Run pickup system
    PickupSystem.update(entities, mockUpdateArgs);

    // Verify item was picked up
    expect(hasComponent(player, CarriedItemComponent)).toBe(true);
    expect(hasComponent(item, PickableComponent)).toBe(false);

    // Run cleanup system
    CleanUpSystem.update(entities, mockUpdateArgs);

    // Verify item was removed from game
    expect(entities).not.toContain(item);
  });
});
```

---

## Troubleshooting

### Common Test Issues

#### Issue: Mock Not Working

```typescript
// Problem: PIXI.js objects throwing errors in tests
// Solution: Proper mock setup in setupTests.ts

// setupTests.ts
vi.mock('pixi.js', () => ({
  Application: vi.fn().mockImplementation(() => mockApplication),
  Sprite: vi.fn().mockImplementation(() => mockSprite),
  // ... other mocks
}));
```

#### Issue: Component Tests Failing

```typescript
// Problem: Component constructor validation too strict
// Solution: Test both valid and invalid inputs

it('should handle edge cases gracefully', () => {
  // Test boundary values
  expect(() => new PositionComponent({ x: 0, y: 0 })).not.toThrow();
  expect(() => new PositionComponent({ x: -1, y: -1 })).not.toThrow();

  // Test invalid values
  expect(() => new PositionComponent({ x: NaN, y: 0 })).toThrow();
  expect(() => new PositionComponent(null)).toThrow();
});
```

#### Issue: Integration Tests Flaky

```typescript
// Problem: Test order dependencies
// Solution: Proper test isolation

beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();

  // Reset game state
  gameEntities.length = 0;

  // Create fresh test data
  mockUpdateArgs = createTestUpdateArgs();
});
```

#### Issue: Coverage Not Updating

```typescript
// Problem: Coverage excludes not working
// Solution: Check vitest.config.ts patterns

// vitest.config.ts
coverage: {
  exclude: ['**/__tests__/**', '**/*.test.*', '**/mocks/**'];
}
```

### Performance Optimization

#### Slow Tests

```typescript
// Use beforeAll for expensive setup
beforeAll(async () => {
  // Expensive operations once per test suite
  await setupTestDatabase();
});

// Use beforeEach for cheap setup
beforeEach(() => {
  // Quick reset operations
  entities.length = 0;
  vi.clearAllMocks();
});
```

#### Memory Leaks

```typescript
// Clean up after tests
afterEach(() => {
  // Clear entity references
  entities.forEach((entity) => (entity.components = {}));

  // Clean up mocks
  vi.restoreAllMocks();
});
```

---

## Best Practices Summary

### Do's ✅

- **Test behavior, not implementation details**
- **Use descriptive test names that explain the scenario**
- **Create focused, single-purpose tests**
- **Mock external dependencies (PIXI.js, network, etc.)**
- **Use test utilities for common operations**
- **Test edge cases and error conditions**
- **Maintain test isolation and independence**
- **Keep tests fast and deterministic**

### Don'ts ❌

- **Don't test library code (PIXI.js internals)**
- **Don't write tests that depend on other tests**
- **Don't ignore flaky tests - fix them**
- **Don't mock everything - test real interactions when safe**
- **Don't write tests just for coverage - focus on value**
- **Don't leave debugging code (console.log) in tests**
- **Don't skip error case testing**

### Code Quality

- **Use TypeScript for test type safety**
- **Follow consistent naming conventions**
- **Extract complex test setup into helper functions**
- **Document complex test scenarios**
- **Use meaningful assertions with clear error messages**

---

This testing guide provides a comprehensive foundation for testing ECS game development. For specific implementation examples, refer to the existing test files in the codebase.

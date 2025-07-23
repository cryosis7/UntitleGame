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
3. **Maintainability**: Tests should be easy to understand and modify
4. **Coverage**: Critical game logic should have comprehensive coverage

### Testing Pyramid for ECS Games

//TODO: FIX - This ascii diargam doesn't show the complete triangle, the sides are cutoff

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

// TODO: This will need to be rewritten after refactor

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

//TODO: Update after refactor

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

// TODO: Provide example after refactor

### Example: Player Movement Integration

```typescript
// TODO
```

### Integration Testing Patterns

#### Game Loop Testing

```typescript
// TODO
```

---

## Test Utilities and Helpers

//TODO These have all changed

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

---

## Best Practices Summary

### Do's ✅

- **Test behavior, not implementation details**
- **Use descriptive test names that explain the scenario**
- **Create focused, single-purpose tests**
- **Mock external dependencies (PIXI.js, network, etc.)**
- **Don't over-mock. Use discretion**
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
- **Don't comment everything. Use Arrange, Act, Assert comments**

### Code Quality

- **Use TypeScript for test type safety**
- **Follow consistent naming conventions**
- **Extract complex test setup into helper functions**
- **Document complex test scenarios**
- **Use meaningful assertions with clear error messages**

# Unit Testing Guidelines

This document provides guidelines for writing effective unit tests.

## Core Principles

Always follow established practices in similar files.

### Test Structure and Organization

**File Placement**: Place unit test files adjacent to the source files they test using the `.test.ts` suffix:

- `src/game/systems/MovementSystem.test.ts` for `MovementSystem.ts`
- `src/game/components/PositionComponent.test.ts` for `PositionComponent.ts`

**Test Organization**: Structure tests using nested `describe` blocks that follow a clear hierarchy:

```typescript
describe('SystemName', () => {
  describe('Core Functionality', () => {
    describe('Happy Path Tests', () => {
      // Successful operation tests
    });

    describe('Validation Tests', () => {
      // Input validation and edge cases
    });
  });

  describe('Component Compatibility', () => {
    // Component interaction tests
  });

  describe('Error Handling & Edge Cases', () => {
    // Error scenarios and boundary conditions
  });
});
```

### Test Naming Conventions

Use descriptive test names that follow the pattern: `should [expected behavior] when [condition]`

**Good Examples**:

- `should process interaction and consume item when target entity accepts all directions`
- `should skip processing when carried item lacks UsableItem component`
- `should handle multiple entities in same position`

**Avoid Generic Names**:

- `should work`
- `test basic functionality`
- `handles input`

**Avoid Implementation Specific Language**:

- `consumes item when isConsumable is true`

### Setup and Teardown

**beforeEach Setup**: Initialize clean state for each test:

```typescript
beforeEach(() => {
  system = new SystemUnderTest();
  entities = [];
  store.set(entitiesAtom, entities);
});
```

**Test Fixtures**: Create reusable entity creation functions:

```typescript
const createTestEntity = ({
                            position = { x: 0, y: 0 },
                            customProperty = 'default',
                          }: {
  position?: PositionComponentProps;
  customProperty?: string;
} = {}) => {
  return createEntity([
    new PositionComponent(position),
    new CustomComponent({ customProperty }),
  ]);
};
```

## ECS-Specific Guidelines

### Use Real ECS Infrastructure

**Do**: Use actual ComponentOperations and EntityFactory

```typescript
const entity = createEntity([
  new PositionComponent({ x: 5, y: 5 }),
  new VelocityComponent({ dx: 1, dy: 0 }),
]);
store.set(entitiesAtom, [entity]);
```

**Don't**: Mock core ECS operations

```typescript
// Avoid this approach
vi.mocked(ComponentOperations.addComponent).mockImplementation(/* ... */);
```

### Entity Creation Patterns

**Use EntityFactory**: Leverage the EntityFactory for consistent entity creation:

```typescript
import { createEntity } from '../utils/EntityFactory';

const player = createEntity([
  new PositionComponent({ x: 0, y: 0 }),
  new RenderableComponent({ spriteId: 'player' }),
]);
```

**Store Management**: Always update the store with test entities:

```typescript
store.set(entitiesAtom, [entity1, entity2, entity3]);
```

### Component Testing

**Test Component States**: Verify component addition, modification, and removal:

```typescript
it('should remove interacting component after successful interaction', () => {
  // Setup entity with InteractingComponent
  system.update(getUpdateArgs());

  const updatedEntity = getEntity(entity.id);
  expect(updatedEntity!.components).not.toHaveProperty(ComponentType.Interacting);
});
```

## Test Coverage Patterns

### Happy Path Testing

Cover the primary success scenarios:

- Valid inputs produce expected outputs
- All required components are present
- System behaves correctly under normal conditions

### Edge Case Testing

**Boundary Conditions**:

- Empty arrays or collections
- Maximum/minimum values
- Null/undefined inputs

**Component Compatibility**:

- Missing required components
- Invalid component combinations
- Component state transitions

**Spatial Logic** (for position-based systems):

- Entities at boundaries
- Overlapping positions
- Out-of-bounds scenarios

### Parameterized Testing

Use `it.each` for testing multiple similar scenarios. Always use the template literal syntax:

```typescript
it.each`
  condition                      | directions
  ${'accepts all directions'}    | ${['up', 'down', 'left', 'right']}
  ${'has direction requirement'} | ${['down']}
`(
  'should process interaction when target entity $condition',
  ({ directions }) => {
    // Test implementation
  },
);
```

## Error Handling

### Graceful Degradation

Test that systems handle errors without crashing:

```typescript
it('should continue processing when entity reference is invalid', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
  });

  // Setup invalid state
  system.update(getUpdateArgs());

  expect(consoleSpy).toHaveBeenCalledWith('Expected error message');
  expect(() => system.update(getUpdateArgs())).not.toThrow();
});
```

## Assertions and Expectations

### Entity State Verification

**Check Entity Existence**:

```typescript
expect(getEntity(entityId)).toBeUndefined(); // Entity removed
expect(getEntity(entityId)).toBeDefined();   // Entity exists
```

**Component Verification**:

```typescript
const entity = getEntity(entityId);
expect(entity!.components).toHaveProperty(ComponentType.Position);
expect(entity!.components).not.toHaveProperty(ComponentType.Interacting);
```

**Position-Based Checks**:

```typescript
expect(getEntitiesAtPosition({ x: 5, y: 5 })).toHaveLength(2);
expect(getEntitiesAtPosition({ x: 10, y: 10 })).toHaveLength(0);
```

### Array and Collection Assertions

```typescript
const entities = store.get(entitiesAtom);
expect(entities).toContainEqual(expectedEntity);
expect(entities).not.toContainEqual(removedEntity);
expect(entities).toHaveLength(expectedCount);
```

## Best Practices

- Avoid over-mocking - test real behavior when possible
- Use descriptive variable names
- Only comment complex test scenarios
- Use specific assertions rather than generic truthy/falsy checks.

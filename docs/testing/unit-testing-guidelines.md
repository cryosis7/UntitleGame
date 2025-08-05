# Unit Testing Guidelines

This document provides guidelines for writing effective unit tests.

## Core Principles

Always follow established practices in similar files.

### Test Structure and Organization

**File Placement**: Place unit test files adjacent to the source files they test using the `.test.ts` suffix:

- `src/game/systems/MovementSystem.test.ts` for `MovementSystem.ts`
- `src/game/components/PositionComponent.test.ts` for `PositionComponent.ts`

**Test Organization**: Structure tests using nested `describe` blocks that follow a clear hierarchy:
  - Top level: Component/class name
  - Second-Fifth level: Specific scenarios
  - Use descriptive names that read like sentences
  - Group related tests together
  - Use beforeEach/afterEach within describe blocks for shared setup

```typescript
  describe('ItemInteractionSystem', () => {
    describe('when applying interaction behaviors', () => {
      describe('with transform behavior', () => {
```

### Test Naming Conventions

Set up the `Given/When` scenarios in the describe blocks, and use descriptive test names that follow the pattern: `it('should [expected behavior]',`

**Good Examples**:

- `should consume item when target entity accepts all directions`
- `should skip processing`
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

### Use Real ECS Infrastructure

**Do**: Use actual entity and component implementations

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

### Error Handling

Test that systems handle errors without crashing using console spy and asserting `toThrow` and `not.toThrow`.

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

## Best Practices

- Avoid over-mocking - test real behavior when possible
- Use descriptive variable names
- Only comment complex test scenarios
- Use specific assertions rather than generic truthy/falsy checks.

# Unit Testing Guidelines

This document provides guidelines for writing effective unit tests.

## Core Principles

Always follow established practices in similar files.

### Test Structure and Organization

**File Placement**: Place unit test files adjacent to the source files they test using the `.test.ts` suffix:

- `src/game/systems/MovementSystem.test.ts` for `MovementSystem.ts`
- `src/game/components/PositionComponent.test.ts` for `PositionComponent.ts`

**Test Organization**: Structure tests using nested `describe` blocks that follow a clear hierarchy.
Set up the `Given/When` scenarios in the describe blocks, and use descriptive test names

- Top level: Component/class name
- Second-Fifth level: Specific scenarios
- Use descriptive names that read like sentences
- Group related tests together
- Use beforeEach/afterEach within describe blocks for shared setup

```typescript
  describe('ItemInteractionSystem', () => {
  describe('on update', () => {
    describe('when interaction succeeds', () => {
      describe('with valid requirements matching', () => {
```

**Good Examples**:

- `it('should consume item when target entity accepts all directions'`
- `it('should skip processing'`
- `it('should handle multiple entities in same position'`

**Avoid Generic Names**:

- `it('should work'`
- `it('test basic functionality'`
- `it('handles input'`

**Avoid Implementation Specific Language**:

- `it('deletes entity when isConsumable is true'`

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

### Common Patterns

- **Use EntityFactory**: Leverage the EntityFactory for consistent entity creation.
- **Use ComponentOperations**: Access and modify components using the utilities provided in `ComponentOperations.ts`. Do
  not access components directly from the entity object.
- Use `it.each` for testing multiple similar scenarios. Always use the template literal syntax. Never use the array
  syntax.

## Assertions and Expectations

**Check Entity Existence**:

```typescript
expect(getEntity(entityId)).toBeUndefined();
expect(getEntity(entityId)).toBeDefined();
```

**Component Verification**: Validate component presence and properties using the existing component operations.

```typescript
const entity = getEntity(entityId);
expect(hasComponent(entitiy!, ComponentType.Position)).toBeTruthy();
expect(getComponentIfExists(entity!, ComponentType.Position)).toMatchObject({
  x: 5,
  y: 5,
});
```
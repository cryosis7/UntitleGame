# Store-Based Testing Approach for ECS Components and Systems

This document outlines the store-based testing approach that replaces ComponentOperations mocking throughout the codebase. This approach provides more accurate testing by using real Jotai store operations instead of mocked functions.

## Why Store-Based Testing?

### Problems with ComponentOperations Mocking (Anti-Pattern)

**AVOID**: Mocking ComponentOperations functions like `setComponent()`, `getComponentIfExists()`, etc.

**Why this is problematic:**
1. **Architectural Mismatch**: Real ComponentOperations work with the global Jotai store, but mocks work with plain objects
2. **False Test Security**: Tests pass with mocks but may fail in real scenarios  
3. **Missing Integration Issues**: Mocks don't catch problems with store state management
4. **Maintenance Burden**: Mock implementations must be kept in sync with real implementations

### Store-Based Testing Benefits

**DO**: Use real ComponentOperations with a test-specific Jotai store

**Benefits:**
1. **Real Behavior Testing**: Uses actual ComponentOperations functions with real store
2. **Better Integration Coverage**: Catches issues with store state management
3. **Future-Proof**: No need to update mocks when ComponentOperations change
4. **Simplified Tests**: Less mock setup, more focus on actual behavior

## How to Use Store-Based Testing

### 1. Setup Test Environment

```typescript
import { setupECSTestEnvironment, createTestStore } from '../../../tests/helpers/ecsTestSetup';

describe('YourSystem', () => {
  setupECSTestEnvironment(); // Sets up Pixi mocks and store isolation
  
  it('should do something', () => {
    const testStore = createTestStore();
    // Your test code here...
  });
});
```

### 2. Create Entities Using EntityFactory Integration

```typescript
import { EntityTemplates, StoreBasedTestUtils } from '../../../tests/helpers/ecsTestSetup';

// Use pre-built entity templates
const player = testStore.createEntity(EntityTemplates.player(0, 0));
const item = testStore.createEntity(EntityTemplates.item(5, 5, 'potion'));

// Or create custom entities
const customTemplate: EntityTemplate = {
  components: {
    [ComponentType.Position]: { x: 10, y: 20 },
    [ComponentType.Sprite]: { sprite: 'custom' }
  }
};
const entity = testStore.createEntity(customTemplate);
```

### 3. Use Real ComponentOperations

```typescript
import * as ComponentOperations from '../../components/ComponentOperations';

// ✅ CORRECT: Use real ComponentOperations
const position = ComponentOperations.getComponentIfExists(entity, ComponentType.Position);
expect(position?.x).toBe(10);

// ❌ INCORRECT: Don't mock ComponentOperations
// vi.mock('../../components/ComponentOperations', () => ({ ... }));
```

### 4. Test System Interactions

```typescript
it('should process entities correctly', () => {
  const testStore = createTestStore();
  
  // Setup entities using store
  const entities = StoreBasedTestUtils.setupEntities(
    testStore,
    EntityTemplates.player(0, 0),
    EntityTemplates.item(1, 1)
  );
  
  const system = new YourSystem();
  const updateArgs = createStandardUpdateArgs(entities);
  
  // Run system
  system.update(updateArgs);
  
  // Validate using real ComponentOperations
  const [player, item] = entities;
  expect(ComponentOperations.hasComponent(player, ComponentType.CarriedItem)).toBe(true);
});
```

## Available Utilities

### Entity Templates

Pre-built templates for common entity types:

- `EntityTemplates.player(x, y)` - Player entity with position, sprite, velocity
- `EntityTemplates.item(x, y, sprite)` - Pickable item entity
- `EntityTemplates.chest(x, y, requiredItem?)` - Chest with optional key requirement
- `EntityTemplates.key(x, y, keyType)` - Key with specific capabilities

### Store Management

```typescript
const testStore = createTestStore();

// Entity management
testStore.addEntity(entity);
testStore.createEntity(template);
testStore.clearEntities();
testStore.getEntities();

// Cleanup (automatic in setupECSTestEnvironment)
StoreBasedTestUtils.cleanupTestStore(testStore);
```

### Validation Helpers

```typescript
// Validate entity has expected components
StoreBasedTestUtils.validateEntityState(entity, [
  ComponentType.Player,
  ComponentType.Position
]);
```

## Migration from Mocked Tests

### Before (Problematic Approach)

```typescript
// ❌ Don't do this
vi.mock('../../components/ComponentOperations', () => ({
  setComponent: vi.fn((entity, component) => {
    entity.components[component.type] = component; // Plain object manipulation
  }),
  getComponentIfExists: vi.fn((entity, type) => entity.components[type])
}));
```

### After (Store-Based Approach)

```typescript
// ✅ Do this instead
import { setupECSTestEnvironment, createTestStore, EntityTemplates } from '../../../tests/helpers/ecsTestSetup';
import * as ComponentOperations from '../../components/ComponentOperations';

describe('YourSystem', () => {
  setupECSTestEnvironment();
  
  it('should work correctly', () => {
    const testStore = createTestStore();
    const entity = testStore.createEntity(EntityTemplates.player(0, 0));
    
    // Use real ComponentOperations - no mocking needed
    const position = ComponentOperations.getComponentIfExists(entity, ComponentType.Position);
    expect(position?.x).toBe(0);
  });
});
```

## Testing Quality Standards

1. **Use Real Operations**: Always use real ComponentOperations instead of mocks
2. **Store Isolation**: Each test should have its own clean store state
3. **EntityFactory Integration**: Use `createEntityFromTemplate` for consistent entity creation
4. **Clear Validation**: Use ComponentOperations to validate expected state changes
5. **Comprehensive Coverage**: Test both success and error cases with real store behavior

## Common Patterns

### Testing Component Addition/Removal

```typescript
it('should add component to entity', () => {
  const testStore = createTestStore();
  const entity = testStore.createEntity(EntityTemplates.player(0, 0));
  
  // Use real ComponentOperations
  ComponentOperations.setComponent(entity, new CarriedItemComponent({ item: 'potion' }));
  
  // Validate with real operations
  expect(ComponentOperations.hasComponent(entity, ComponentType.CarriedItem)).toBe(true);
  
  const carriedItem = ComponentOperations.getComponentIfExists(entity, ComponentType.CarriedItem);
  expect(carriedItem?.item).toBe('potion');
});
```

### Testing System Updates

```typescript
it('should update entity positions', () => {
  const testStore = createTestStore();
  const entity = testStore.createEntity(EntityTemplates.player(0, 0));
  
  // Set velocity using real operations
  ComponentOperations.setComponent(entity, new VelocityComponent({ vx: 1, vy: 0 }));
  
  const system = new MovementSystem();
  system.update(createStandardUpdateArgs([entity]));
  
  // Validate position change with real operations
  const position = ComponentOperations.getComponentAbsolute(entity, ComponentType.Position);
  expect(position.x).toBe(1);
  expect(position.y).toBe(0);
});
```

This approach ensures tests accurately reflect real system behavior while maintaining proper isolation and using the existing EntityFactory infrastructure.

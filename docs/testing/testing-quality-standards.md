# Testing Quality Standards and Guidelines

## Overview

This document establishes comprehensive testing standards for our ECS game architecture. It leverages the hybrid testing structure with adjacent unit tests and centralized integration tests to ensure code quality, maintainability, and system reliability.

## Testing Architecture

### Hybrid Structure

- **Adjacent Unit Tests**: Located alongside source files (e.g., `src/game/systems/MovementSystem.test.ts`)
- **Centralized Integration Tests**: Located in `tests/integration/` for multi-system workflows
- **Shared Test Utilities**: Centralized in `tests/helpers/` for consistency and reusability

### Directory Structure

```
src/
  game/
    systems/
      MovementSystem.ts
      MovementSystem.test.ts    # Adjacent unit test
    components/
      ComponentName.test.ts     # Adjacent unit test
tests/
  helpers/
    ecsTestSetup.ts            # Centralized ECS test patterns
    testUtils.ts               # Shared test utilities
  integration/
    gameplayScenarios.test.ts  # Multi-system integration tests
  mocks/
    pixiMocks.ts              # Centralized mocking infrastructure
```

## Unit Testing Standards

### Component Testing

**Standard Pattern** (see `MovementSystem.test.ts` for reference):

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SystemName } from './SystemName';
import { ComponentTestPatterns } from '../../../tests/helpers/ecsTestSetup';
import {
  createTestEntity,
  createTestUpdateArgs,
} from '../../../tests/helpers/testUtils';

describe('SystemName', () => {
  let system: SystemName;
  let entities: Entity[];
  let updateArgs: UpdateArgs;

  beforeEach(() => {
    system = new SystemName();
    entities = [
      /* test entities */
    ];
    updateArgs = createTestUpdateArgs(entities);
  });

  describe('Core Functionality', () => {
    it('should handle basic operation', () => {
      // Test implementation
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty entities array', () => {
      const result = system.update(createTestUpdateArgs([]));
      expect(result).not.toThrow();
    });

    it('should handle malformed components', () => {
      // Test malformed data scenarios
    });
  });

  describe('Component Validation', () => {
    it('should validate component structure', () => {
      ComponentTestPatterns.validateComponentStructure(
        ComponentType.Test,
        testComponent,
      );
    });

    it('should handle component serialization', () => {
      ComponentTestPatterns.testComponentSerialization(testComponent);
    });
  });
});
```

**Required Coverage Areas:**

1. **Core functionality** - Happy path scenarios
2. **Edge cases** - Boundary conditions, empty inputs, malformed data
3. **Error handling** - Invalid states, null/undefined handling
4. **Component validation** - Structure, serialization, immutability
5. **Performance** - No unnecessary allocations, efficient operations

### Component Testing Requirements

**Component Validation Pattern:**

```typescript
// Use standardized component testing from ecsTestSetup.ts
ComponentTestPatterns.validateComponentStructure(
  ComponentType.Position,
  positionComponent,
);
ComponentTestPatterns.testComponentSerialization(positionComponent);
ComponentTestPatterns.testComponentImmutability(PositionComponent, {
  x: 1,
  y: 2,
});
```

**Required Component Tests:**

- Type correctness
- Constructor parameter validation
- Serialization/deserialization
- Immutable behavior
- Default value handling

## Integration Testing Standards

### Multi-System Workflow Testing

**Standard Pattern** (see `keyChestInteraction.integration.test.ts` for reference):

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStandardUpdateArgs } from '../helpers/ecsTestSetup';
import * as EntityUtils from '../../src/game/utils/EntityUtils';

// Mock external dependencies
vi.mock('../../src/game/utils/EntityUtils', async () => {
  const actual = await vi.importActual('../../src/game/utils/EntityUtils');
  return {
    ...actual,
    getEntitiesAtPosition: vi.fn(),
    getPlayerEntity: vi.fn(),
  };
});

describe('Integration Test Name', () => {
  let system1: System1;
  let system2: System2;
  let entities: Entity[];

  beforeEach(() => {
    // Initialize systems
    system1 = new System1();
    system2 = new System2();

    // Create test entities with realistic component combinations
    entities = [
      /* realistic entity setup */
    ];

    // Configure mocks to use test entities
    vi.mocked(EntityUtils.getPlayerEntity).mockReturnValue(playerEntity);
    vi.mocked(
      EntityUtils.getEntitiesAtPosition,
    ).mockImplementation(/* realistic implementation */);
  });

  describe('Complete Workflow', () => {
    it('should execute multi-system workflow correctly', () => {
      // Step 1: First system operation
      system1.update(createStandardUpdateArgs(entities));
      // Verify intermediate state

      // Step 2: Second system operation
      system2.update(createStandardUpdateArgs(entities));
      // Verify final state
    });
  });

  describe('Edge Cases', () => {
    it('should handle system interaction failures', () => {
      // Test failure scenarios between systems
    });
  });

  describe('System State Validation', () => {
    it('should maintain consistent entity state across systems', () => {
      // Count components before/after
      // Verify no unexpected state changes
    });
  });
});
```

**Integration Test Requirements:**

1. **Realistic scenarios** - Test actual gameplay workflows
2. **System interactions** - Verify systems work together correctly
3. **State consistency** - Ensure entity state remains valid across systems
4. **Error propagation** - Test how errors in one system affect others
5. **Performance impact** - Verify multi-system operations perform acceptably

## Testing Utilities and Patterns

### Centralized Test Utilities

**Required Usage:**

```typescript
// Always import from centralized location
import {
  createTestEntity,
  createEntityWithComponents,
  createTestUpdateArgs,
  createMockGameMap,
} from '../../../tests/helpers/testUtils';

import {
  setupECSTestEnvironment,
  createStandardUpdateArgs,
  ComponentTestPatterns,
  SystemTestPatterns,
} from '../../../tests/helpers/ecsTestSetup';
```

**Prohibited:**

- Duplicating utility functions in individual test files
- Creating entity mocks without using standardized patterns
- Direct component instantiation without proper validation

### Mocking Standards

**Pixi.js Mocking:**

```typescript
// Always use centralized Pixi mocks
import '../../../tests/mocks/pixiMocks';
// Pixi components automatically mocked
```

**Component Operations Mocking:**

```typescript
// Mock ComponentOperations for controlled testing
vi.mock('../components/ComponentOperations', async () => {
  const actual = await vi.importActual('../components/ComponentOperations');
  return {
    ...actual,
    setComponent: vi.fn((entity, component) => {
      entity.components[component.type] = component;
    }),
  };
});
```

**External Dependencies:**

- Mock all external API calls
- Mock random number generation for deterministic tests
- Mock time-dependent functions for consistent test execution

## Quality Gates

### Pre-Commit Requirements

**Automated Checks:**

```bash
npm run test                    # All tests must pass
npm run lint                    # No linting errors
npm run type-check             # No TypeScript errors
```

**Coverage Requirements:**

- Minimum 80% line coverage for new code
- Minimum 70% branch coverage for new code
- 100% coverage required for critical systems (MovementSystem, ItemInteractionSystem)

**Test Categories Required:**

- [ ] Unit tests for all new components/systems
- [ ] Integration tests for new multi-system workflows
- [ ] Edge case coverage for boundary conditions
- [ ] Error handling tests for failure scenarios

### Code Review Checklist

**Test Quality Verification:**

- [ ] Tests use centralized utilities (no duplicate test code)
- [ ] Proper mocking of external dependencies
- [ ] Clear test descriptions that explain the scenario
- [ ] Appropriate test categorization (unit vs integration)
- [ ] Performance considerations addressed
- [ ] Tests are deterministic (no flaky tests)

**System-Specific Requirements:**

- [ ] ECS systems tested in isolation and integration
- [ ] Component validation included for all new components
- [ ] Game logic tested with realistic scenarios
- [ ] User interaction workflows covered by integration tests

## Best Practices

### Test Organization

**File Naming:**

- Unit tests: `ComponentName.test.ts` (adjacent to source)
- Integration tests: `descriptiveWorkflowName.integration.test.ts`
- Test utilities: `*TestUtils.ts` or `*TestSetup.ts`

**Test Structure:**

```typescript
describe('SystemName', () => {
  describe('Core Functionality', () => {
    // Happy path tests
  });

  describe('Edge Cases', () => {
    // Boundary and error conditions
  });

  describe('Integration', () => {
    // System interaction tests
  });
});
```

### Performance Testing

**Required Performance Considerations:**

- Test entity creation/destruction performance
- Validate system update loop efficiency
- Memory leak detection for long-running scenarios
- Component serialization performance

### Documentation Standards

**Test Documentation Requirements:**

- Each complex test scenario must have explanatory comments
- Integration tests must document the workflow being tested
- Edge cases must explain the specific condition being tested
- Performance tests must document expected benchmarks

## Migration Guidance

### Converting Legacy Tests

**From `__tests__/` directories:**

1. Move unit tests adjacent to source files
2. Update import paths to use centralized utilities
3. Add missing edge cases and component validation
4. Ensure proper mocking of external dependencies

**From informal testing:**

1. Create formal test files using standard patterns
2. Add comprehensive coverage for existing functionality
3. Include integration tests for multi-system workflows
4. Document testing rationale and scenarios

### Adding New Tests

**Checklist for New Test Files:**

- [ ] Use appropriate test type (unit vs integration)
- [ ] Follow naming conventions
- [ ] Import from centralized utilities
- [ ] Include all required coverage areas
- [ ] Add proper mocking for dependencies
- [ ] Validate component structure and behavior
- [ ] Include performance considerations
- [ ] Document complex scenarios

## Continuous Improvement

### Testing Metrics

**Track and Monitor:**

- Test execution time trends
- Coverage percentage by system
- Test flakiness rates
- Integration test reliability

**Regular Reviews:**

- Monthly test suite performance review
- Quarterly coverage gap analysis
- Semi-annual testing strategy evaluation

### Evolution Guidelines

**When to Update Standards:**

- New testing patterns prove more effective
- Performance requirements change
- Additional coverage areas identified
- Tool improvements enable better testing

**Documentation Maintenance:**

- Update examples when better patterns emerge
- Add new edge cases as they're discovered
- Refine utility functions based on usage patterns
- Expand integration test scenarios as game grows

---

This document serves as the definitive guide for testing quality in our ECS game architecture. All developers must follow these standards to ensure consistent, maintainable, and reliable test coverage.

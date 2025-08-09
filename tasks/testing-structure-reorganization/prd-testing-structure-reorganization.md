# PRD: Testing Structure Reorganization

## Introduction/Overview

The current testing structure in the ECS-based game is scattered and disorganized, making it difficult for developers to
locate, write, and maintain tests effectively. Tests are inconsistently organized across multiple `__tests__`
directories, with significant duplication (e.g., 5+ separate test files for `ItemInteractionSystem`) and mixed
unit/integration test concerns. This PRD outlines a comprehensive restructuring to implement a hybrid testing approach
that improves maintainability, discoverability, and testing effectiveness.

## Goals

### Primary Objectives

- **Organize tests using hybrid approach**: Adjacent unit tests for focused testing + dedicated integration directory
  for feature workflows
- **Eliminate test duplication**: Consolidate redundant test files and remove overlapping test logic
- **Establish clear testing standards**: Define quality criteria for both unit and integration tests
- **Improve test discoverability**: Make it immediately obvious where tests are located and what they cover
- **Enable effective integration testing**: Focus on complete feature flows that span multiple ECS systems

### Business Value

- **Reduced developer onboarding time**: Clear structure makes it easy to understand where tests belong
- **Faster bug detection**: Proper integration tests catch system interaction issues
- **Improved code quality**: Better test coverage leads to more robust game features
- **Enhanced maintainability**: Well-organized tests are easier to update as code evolves

## User Stories

### As a Developer Writing Tests

- **Story**: When I need to add a unit test for a component or system, I want to place it adjacent to the source file so
  I can easily find and maintain it
- **Acceptance Criteria**:
    - Unit test files are located next to their corresponding source files
    - File naming follows consistent pattern (`ComponentName.test.ts`)
    - Test focuses on single component/system in isolation

### As a Developer Writing Integration Tests

- **Story**: When I need to test a complete game feature (like picking up a key and using it on a chest), I want a
  dedicated integration test directory so I can write comprehensive workflow tests
- **Acceptance Criteria**:
    - Integration tests are located in `tests/integration/` directory
    - Tests cover complete feature workflows spanning multiple systems
    - Tests use realistic game scenarios with proper setup

### As a Developer Finding Existing Tests

- **Story**: When I want to understand how a system is tested or add test cases, I want to quickly locate all relevant
  tests without searching multiple directories
- **Acceptance Criteria**:
    - Unit tests are immediately visible next to source code
    - Integration tests are clearly categorized by feature
    - No duplicate or overlapping test coverage across files

### As a Developer Maintaining Tests

- **Story**: When code changes, I want to easily identify and update all related tests without missing any
- **Acceptance Criteria**:
    - Test location is predictable based on code structure
    - Integration tests clearly document which systems they cover
    - Test quality standards ensure maintainable test code

## Functional Requirements

### File Structure Requirements

#### New Hybrid Structure

```
src/
├── game/
│   ├── components/
│   │   ├── individualComponents/
│   │   │   ├── PositionComponent.ts
│   │   │   ├── PositionComponent.test.ts        # Adjacent unit tests
│   │   │   ├── VelocityComponent.ts
│   │   │   ├── VelocityComponent.test.ts        # Adjacent unit tests
│   │   │   └── ...
│   │   └── ComponentOperations.ts
│   │   └── ComponentOperations.test.ts          # Adjacent unit tests
│   ├── systems/
│   │   ├── MovementSystem.ts
│   │   ├── MovementSystem.test.ts               # Adjacent unit tests
│   │   ├── PickupSystem.ts
│   │   ├── PickupSystem.test.ts                 # Adjacent unit tests
│   │   └── ...
│   ├── utils/
│   │   ├── ecsUtils.ts
│   │   ├── ecsUtils.test.ts                     # Adjacent unit tests
│   │   └── ...
│   └── templates/
│       ├── EntityTemplates.ts
│       └── EntityTemplates.test.ts              # Adjacent unit tests
└── tests/
    ├── integration/                              # Dedicated integration tests
    │   ├── playerMovement.integration.test.ts
    │   ├── itemPickup.integration.test.ts
    │   ├── ItemUsage.integration.test.ts
    │   └── gameplayScenarios.integration.test.ts
    ├── mocks/                                    # Shared test utilities
    │   ├── componentMocks.ts
    │   ├── systemMocks.ts
    │   └── pixiMocks.ts
    └── helpers/
        ├── testUtils.ts
        └── ecsTestSetup.ts
```

### Migration Process Requirements

#### Phase 1: Structure Setup + Example Migrations

1. **Create new directory structure** (`tests/integration/`, `tests/mocks/`, `tests/helpers/`)
2. **Migrate one exemplary unit test**: Choose `MovementSystem.test.ts` as it's fundamental and well-defined
3. **Migrate one exemplary integration test**: Create `ItemUsage.integration.test.ts` demonstrating complete
   workflow testing
4. **Establish quality standards** based on these examples
5. **Integrate with rewritten test helpers**: Ensure migrated tests work with new test helper infrastructure

#### Phase 2: Full Migration with Quality Improvements

1. **Migrate all existing unit tests** to adjacent structure
2. **Consolidate duplicated tests**: Especially `ItemInteractionSystem` which has 5+ separate files
3. **Improve test quality during migration**: Rewrite tests to work with new helper infrastructure rather than copying
   problematic patterns
4. **Create comprehensive integration tests** for key game features

#### Phase 3: Documentation Updates

1. **Update all testing documentation** to reflect new hybrid structure
2. **Create migration guidelines** for future test additions
3. **Document testing standards** established during migration

### Priority Migration Order

#### Critical Systems (Phase 2 Priority 1)

1. **MovementSystem** - Fundamental to gameplay, clear unit test boundaries
2. **PickupSystem** - Core interaction mechanic mentioned by user
3. **KeyboardInputSystem** - Input handling, affects all player actions
4. **ItemInteractionSystem** - Currently has duplication issues, needs consolidation

#### Important Components (Phase 2 Priority 2)

1. **PositionComponent** - Used by movement and rendering systems
2. **VelocityComponent** - Works with MovementSystem
3. **PickableComponent** - Used in pickup mechanics
4. **InteractableComponent** - Used in key/chest interactions

#### Supporting Systems (Phase 2 Priority 3)

1. **GameRenderSystem** - Important for visual feedback but complex to test
2. **CleanUpSystem** - Utility system, simpler migration
3. **Utility functions** - ecsUtils, EntityFactory, etc.

### Integration Test Requirements

#### Core Feature Workflows

1. **Key-Chest Interaction Workflow**
    - Player picks up key → Player moves to chest → Player uses key on chest → Chest opens
    - Systems: PickupSystem, MovementSystem, ItemInteractionSystem
    - Components: PositionComponent, InventoryComponent, InteractableComponent, PickableComponent

2. **Player Movement Workflow**
    - Keyboard input received → Velocity updated → Position updated → Visual rendering updated
    - Systems: KeyboardInputSystem, MovementSystem, GameRenderSystem
    - Components: PositionComponent, VelocityComponent, RenderableComponent

3. **Item Collection Workflow**
    - Player approaches item → Item detected in range → Item picked up → Player inventory updated
    - Systems: MovementSystem, PickupSystem
    - Components: PositionComponent, PickableComponent, InventoryComponent

### Test Quality Standards

#### Unit Test Requirements

- **Single responsibility**: Test one component or system in isolation
- **Comprehensive edge cases**: Cover boundary conditions, invalid inputs, error states
- **Clear naming**: Follow pattern "should [expected behavior] when [condition]"
- **Proper testing approach**: Use store-based testing with real ComponentOperations instead of mocking
- **Entity creation**: Leverage existing EntityFactory for consistent entity creation
- **Adjacent location**: Placed next to corresponding source file
- **Test helper integration**: Must work with rewritten test helper infrastructure. (Do not recreate the old helpers)

#### ComponentOperations Mocking Issues (Anti-Pattern to Avoid)

- **Avoid mocking ComponentOperations**: The current approach of mocking `setComponent()` creates false test security
- **Architectural mismatch problem**: Real ComponentOperations work with global Jotai store, but mocks work with plain
  objects
- **Integration failure**: Mocked tests don't catch real bugs in ComponentOperations or store interactions
- **Maintenance burden**: Keeping mocks synchronized with real implementations is error-prone

#### Integration Test Requirements

- **Complete workflows**: Test feature flows spanning multiple systems
- **System interaction focus**: Verify data flow between systems
- **Realistic scenarios**: Use actual game situations, not contrived test cases
- **Store-based setup**: Use real store and EntityFactory for authentic test scenarios
- **Dedicated location**: Placed in `tests/integration/` directory
- **Clear documentation**: Comments explaining the workflow being tested
- **Helper compatibility**: Tests must be compatible with rewritten test helper infrastructure

#### Migration Quality Requirements

- **Migration success**: All migrated tests must pass with new test helper infrastructure
- **No legacy dependencies**: Migrated tests should not rely on old test patterns that don't work with new helpers
- **Quality improvement**: Migration is an opportunity to improve test quality, not just move files
- **Helper integration**: Tests should leverage the capabilities of the rewritten test helpers

#### General Quality Requirements

- **No duplication**: Eliminate redundant test logic across files
- **Deterministic**: Tests must be reliable and not flaky
- **Minimal setup**: Test arrangement should be clear and concise
- **Specific assertions**: Verify exact expected outcomes

## Non-Goals

### Explicitly Excluded Features

- **Automated tooling for test placement validation**: Manual review during migration is sufficient
- **Performance optimization of test execution**: Thoroughness is prioritized over speed
- **Backwards compatibility**: Old test structure will be completely replaced
- **Incremental migration**: This is an immediate, comprehensive restructure with all work paused

## Design Considerations

### New Testing Approach

#### Problem with Current Mocking Strategy

The previous tests extensively mocked ComponentOperations (e.g., `setComponent()`, `getComponentIfExists()`) as well as
the global Store, which creates several critical issues:

1. **Architectural Mismatch**: Real `setComponent()` updates the global Jotai store, but mocks directly modify plain
   entity objects
2. **False Security**: Tests pass but don't verify actual ComponentOperations behavior
3. **Integration Blind Spots**: Real bugs in store interactions go undetected
4. **Maintenance Overhead**: Mocks must be kept synchronized with evolving real implementations

#### Recommended Solution

Replace ComponentOperations mocking with ComponentOperations usage. The `ecsTestSetup.ts` has been rewritten to create
an authentic testing environment.

#### EntityFactory Integration Benefits

- **Consistency**: Test entity creation matches production entity creation patterns
- **Validation**: Leverages existing EntityFactory validation logic
- **Maintainability**: Single source of truth for entity creation reduces duplication
- **Type Safety**: EntityFactory templates provide better TypeScript support

### Naming Conventions

- **Unit tests**: `ComponentName.test.ts` or `SystemName.test.ts`
- **Integration tests**: `featureName.integration.test.ts`
- **Test suites**: `describe('SystemName', () => { ... })`
- **Test cases**: `it('should [action] when [condition]', () => { ... })`

### File Organization Principles

- **Proximity for unit tests**: Tests stay close to code they test
- **Separation for integration tests**: Complex tests get dedicated space
- **Shared utilities**: Common mocks and helpers centralized in `tests/` directory

### Test Isolation Strategy

- **Unit tests**: Mock external dependencies
- **Integration tests**: Mock only external services (not internal ECS systems)
- **Shared setup**: Use `tests/helpers/` for common test configuration

## Technical Considerations

### Integration with Existing Tools

- **Vitest configuration**: Update `vitest.config.ts` to recognize new file patterns
- **Coverage reporting**: Ensure coverage includes both adjacent and integration tests
- **CI/CD pipeline**: No changes needed, existing test commands will work with new structure

### Documentation Updates Required

- **Update `docs/testing/testing-guide.md`**: Reflect new hybrid structure
- **Update `docs/testing/ecs-testing-patterns.md`**: Include integration test patterns
- **Update `docs/testing/test-utilities-reference.md`**: Document shared helpers location
- **Create migration guide**: Document process for adding new tests

### Mock Management

- **Centralize external service mocks** in `tests/mocks/` (e.g., Pixi.js, browser APIs)
- **Maintain Pixi.js mocking infrastructure** for rendering tests

## Success Metrics

### Quantitative Measures

- **Test organization**: 100% of unit tests adjacent to source files
- **Integration coverage**: All major game features have dedicated integration tests
- **Tests Passing**: All tests have been migrated and are passing

### Coverage Targets

- **Unit test coverage**: Maintain existing coverage levels during migration
- **Integration coverage**: Achieve 100% coverage of core game workflows
- **Documentation coverage**: All testing docs updated to reflect new structure

### Migration Requirements

- **Previous test suite compatibility**: NOT REQUIRED - existing tests may not pass due to rewritten test helpers
- **Migrated test compatibility**: REQUIRED - any tests that are migrated to the new structure must pass

---

## Implementation Timeline

### Phase 1: Structure Setup (1-2 days)

- Create directory structure
- Migrate MovementSystem.test.ts as unit test example
- Create ItemUsage.integration.test.ts as integration example
- Establish quality standards documentation

### Phase 2: Full Migration (1-2 weeks)

- Migrate Priority 1 systems (MovementSystem, PickupSystem, KeyboardInputSystem, ItemInteractionSystem)
- Migrate Priority 2 components (PositionComponent, VelocityComponent, etc.)
- Migrate Priority 3 supporting systems and utilities
- Create comprehensive integration test suite

### Phase 3: Documentation & Finalization (2-3 days)

- Update all testing documentation
- Create migration guidelines for future development
- Validate all tests pass in new structure
- Remove old `__tests__` directories

---

## GitHub Issue Tracking

**📋 GitHub Issue:** [#46: PRD for Testing Structure Reorganization](https://github.com/cryosis7/UntitleGame/issues/46)

This issue tracks the implementation progress of this PRD and serves as the central coordination point for all testing
structure reorganization work.

---

_This PRD serves as the definitive specification for restructuring the testing architecture to support better
maintainability, discoverability, and comprehensive feature testing in the ECS-based game._

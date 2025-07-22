# Task List: Testing Structure Reorganization

**Generated from:** `prd-testing-structure-reorganization.md`
**Target:** Junior Developer
**Estimated Duration:** 120 hours (3 weeks)

## Task Categories

### Setup & Infrastructure

- [x] **T000: Prerequisite**
  - [x] Any failing tests are disabled
  - [x] Pre-merge checks run and pass.
  - [x] Changes are committed with conventional commit

- [ ] **T001: Create New Directory Structure**
  - [ ] Create `tests/integration/` directory
  - [ ] Create `tests/mocks/` directory
  - [ ] Create `tests/helpers/` directory
  - [ ] Verify directory structure matches PRD specification
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T002: Update Vitest Configuration**
  - [ ] Update `vitest.config.ts` to recognize new test file patterns (`.test.ts` adjacent files)
  - [ ] Update `vitest.config.ts` to include `tests/integration/*.integration.test.ts` pattern
  - [ ] Verify test discovery works for both adjacent and integration test locations
  - [ ] Run `npm test` to confirm configuration works
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T003: Migrate Shared Test Utilities**
  - [ ] Move `tests/helpers/ecsTestSetup.ts` to new location (if not already there)
  - [ ] Move `tests/helpers/testUtils.ts` to new location (if not already there)
  - [ ] Move `tests/mocks/pixiMocks.ts` to new location (if not already there)
  - [ ] Verify all shared utilities are accessible from new structure
  - [ ] Update import paths in any existing tests that reference these utilities
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

### Example Migration (Phase 1)

- [ ] **T004: Migrate MovementSystem Unit Test (Example)**
  - [ ] Locate existing MovementSystem test files in `__tests__` directories
  - [ ] Create `src/game/systems/MovementSystem.test.ts` adjacent to source file
  - [ ] Rewrite test to use new test helper infrastructure (avoid ComponentOperations mocking)
  - [ ] Use EntityFactory for entity creation in tests
  - [ ] Include comprehensive edge cases (boundary conditions, invalid inputs)
  - [ ] Follow naming pattern: "should [expected behavior] when [condition]"
  - [ ] Verify test passes with new structure
  - [ ] Document any quality improvements made during migration
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T005: Create Key-Chest Interaction Integration Test (Example)**
  - [ ] Create `tests/integration/keyChestInteraction.integration.test.ts`
  - [ ] Implement complete workflow: Player picks up key → Player moves to chest → Player uses key on chest → Chest opens
  - [ ] Test systems interaction: PickupSystem, MovementSystem, ItemInteractionSystem
  - [ ] Test components usage: PositionComponent, InventoryComponent, InteractableComponent, PickableComponent
  - [ ] Use realistic game scenarios with proper setup using ecsTestSetup
  - [ ] Add clear documentation comments explaining the workflow being tested
  - [ ] Verify test passes and demonstrates proper integration testing patterns
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

### Priority 1 System Migration

- [ ] **T006: Migrate PickupSystem Tests**
  - [ ] Locate all existing PickupSystem test files
  - [ ] Create `src/game/systems/PickupSystem.test.ts` adjacent to source file
  - [ ] Consolidate test logic from multiple files (eliminate duplication)
  - [ ] Rewrite to use real ComponentOperations instead of mocked versions
  - [ ] Test edge cases: item out of range, invalid items, inventory full scenarios
  - [ ] Verify integration with EntityFactory for test entity creation
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T007: Migrate KeyboardInputSystem Tests**
  - [ ] Locate existing KeyboardInputSystem test files
  - [ ] Create `src/game/systems/KeyboardInputSystem.test.ts` adjacent to source file
  - [ ] Test input handling for all supported key combinations
  - [ ] Test edge cases: multiple simultaneous inputs, invalid keys, disabled states
  - [ ] Ensure tests work with new test helper infrastructure
  - [ ] Verify no mocking of internal ECS components
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T008: Consolidate ItemInteractionSystem Tests**
  - [ ] Identify all 5+ existing ItemInteractionSystem test files
  - [ ] Analyze test coverage and identify overlapping/duplicate test logic
  - [ ] Create single `src/game/systems/ItemInteractionSystem.test.ts` with consolidated coverage
  - [ ] Eliminate redundant test cases while maintaining comprehensive coverage
  - [ ] Rewrite to use real ComponentOperations instead of mocks
  - [ ] Test all interaction types: key-chest, key-door, item-container, etc.
  - [ ] Include error cases: wrong key, locked interactions, invalid items
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T009: Migrate RenderSystem Tests**
  - [ ] Locate existing RenderSystem test files
  - [ ] Create `src/game/systems/RenderSystem.test.ts` adjacent to source file
  - [ ] Maintain Pixi.js mocking infrastructure for rendering tests
  - [ ] Test sprite positioning, visibility updates, z-order management
  - [ ] Test edge cases: off-screen entities, invalid sprites, missing textures
  - [ ] Ensure tests work with centralized Pixi mocks in `tests/mocks/`
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

### Priority 2 Component Migration

- [ ] **T010: Migrate PositionComponent Tests**
  - [ ] Locate existing PositionComponent test files
  - [ ] Create `src/game/components/individualComponents/PositionComponent.test.ts`
  - [ ] Test component creation, update, and deletion operations
  - [ ] Test coordinate validation and boundary conditions
  - [ ] Use real ComponentOperations instead of mocks
  - [ ] Test integration with EntityFactory component attachment
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T011: Migrate VelocityComponent Tests**
  - [ ] Locate existing VelocityComponent test files
  - [ ] Create `src/game/components/individualComponents/VelocityComponent.test.ts`
  - [ ] Test velocity calculation, direction vectors, speed limits
  - [ ] Test integration with MovementSystem through ComponentOperations
  - [ ] Test edge cases: zero velocity, negative values, extreme speeds
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T012: Migrate PickableComponent Tests**
  - [ ] Locate existing PickableComponent test files
  - [ ] Create `src/game/components/individualComponents/PickableComponent.test.ts`
  - [ ] Test component state management for pickup interactions
  - [ ] Test integration with PickupSystem workflows
  - [ ] Test edge cases: already picked up items, restricted pickups
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T013: Migrate InteractableComponent Tests**
  - [ ] Locate existing InteractableComponent test files
  - [ ] Create `src/game/components/individualComponents/InteractableComponent.test.ts`
  - [ ] Test interaction state management and requirements
  - [ ] Test integration with ItemInteractionSystem
  - [ ] Test various interaction types: keys, switches, containers
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

### Priority 3 Supporting Migration

- [ ] **T014: Migrate CleanUpSystem Tests**
  - [ ] Locate existing CleanUpSystem test files
  - [ ] Create `src/game/systems/CleanUpSystem.test.ts` adjacent to source file
  - [ ] Test entity cleanup logic and memory management
  - [ ] Test edge cases: cleanup of entities with multiple components
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T015: Migrate ECS Utilities Tests**
  - [ ] Locate existing ecsUtils test files
  - [ ] Create `src/game/utils/ecsUtils.test.ts` adjacent to source file
  - [ ] Test entity ID generation, component management utilities
  - [ ] Test edge cases and error conditions
  - [ ] Ensure compatibility with new test helper infrastructure
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T016: Migrate ComponentOperations Tests**
  - [ ] Locate existing ComponentOperations test files
  - [ ] Create `src/game/components/ComponentOperations.test.ts` adjacent to source file
  - [ ] Test core component CRUD operations with real store
  - [ ] Test edge cases: invalid components, non-existent entities
  - [ ] Ensure tests demonstrate proper ComponentOperations usage patterns
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

### Integration Test Creation

- [ ] **T017: Create Player Movement Integration Test**
  - [ ] Create `tests/integration/playerMovement.integration.test.ts`
  - [ ] Test workflow: Keyboard input received → Velocity updated → Position updated → Visual rendering updated
  - [ ] Test systems interaction: KeyboardInputSystem, MovementSystem, RenderSystem
  - [ ] Test components: PositionComponent, VelocityComponent, RenderableComponent
  - [ ] Include edge cases: diagonal movement, collision boundaries, input conflicts
  - [ ] Add workflow documentation comments
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T018: Create Item Collection Integration Test**
  - [ ] Create `tests/integration/itemCollection.integration.test.ts`
  - [ ] Test workflow: Player approaches item → Item detected in range → Item picked up → Player inventory updated
  - [ ] Test systems interaction: MovementSystem, PickupSystem
  - [ ] Test components: PositionComponent, PickableComponent, InventoryComponent
  - [ ] Include edge cases: multiple items, out of range, inventory full
  - [ ] Add workflow documentation comments
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T019: Create Comprehensive Gameplay Scenarios Test**
  - [ ] Create `tests/integration/gameplayScenarios.integration.test.ts`
  - [ ] Test complex multi-step scenarios combining multiple workflows
  - [ ] Test scenario: Collect key, navigate obstacles, unlock multiple chests
  - [ ] Test scenario: Multi-item collection with inventory management
  - [ ] Test edge cases: invalid sequences, interrupted workflows, error recovery
  - [ ] Document each scenario with clear workflow explanations
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

### Documentation Updates

**Guiding Prinicpals**

- Documentation updates should not mention changes in strategy
- Documentation should not mention previous behaviour
- Documentation should mention the current, recommended approach

- [ ] **T020: Update Testing Guide Documentation**
  - [ ] Update `docs/testing/testing-guide.md` to reflect new hybrid structure
  - [ ] Document when to write unit tests vs integration tests
  - [ ] Update file naming conventions and placement rules
  - [ ] Add examples of proper test structure using migrated tests
  - [ ] Update test execution instructions for new structure
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T021: Update ECS Testing Patterns Documentation**
  - [ ] Update `docs/testing/ecs-testing-patterns.md` to include integration test patterns
  - [ ] Document testing approach vs mocking anti-patterns
  - [ ] Add examples of proper EntityFactory usage in tests
  - [ ] Document ComponentOperations testing best practices
  - [ ] Include workflow testing patterns for multi-system features
  - [ ] Pre-merge checks have been run and pass
  - [ ] Documentation has been updated for ECS testing patterns
  - [ ] Changes are committed with conventional commit

- [ ] **T022: Update Test Utilities Reference**
  - [ ] Update `docs/testing/test-utilities-reference.md` to document new shared helpers location
  - [ ] Document ecsTestSetup usage and configuration options
  - [ ] Update references to mock locations in `tests/mocks/`
  - [ ] Add migration guidelines for future test additions
  - [ ] Document testing standards established during migration
  - [ ] Pre-merge checks have been run and pass
  - [ ] Documentation has been updated for test utilities
  - [ ] Changes are committed with conventional commit

### Cleanup & Validation

- [ ] **T023: Remove Old Test Directories**
  - [ ] Identify all existing `__tests__` directories that are now empty
  - [ ] Remove empty `__tests__` directories from `src/game/components/`
  - [ ] Remove empty `__tests__` directories from `src/game/systems/`
  - [ ] Remove empty `__tests__` directories from `src/game/utils/`
  - [ ] Remove any remaining old test files that were successfully migrated
  - [ ] Verify no test files are accidentally deleted (confirm all were migrated)
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

- [ ] **T024: Final Validation and Test Suite Verification**
  - [ ] Run complete test suite: `npm test`
  - [ ] Verify all migrated tests pass with new structure
  - [ ] Verify test coverage maintains or improves from before migration
  - [ ] Run integration tests specifically: `npm test tests/integration/`
  - [ ] Verify CI/CD pipeline works with new test structure
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit

## Task Dependencies

**Phase 1 (Setup & Examples):**

- T002 depends on T001 (directory structure created)
- T003 depends on T001 (directory structure created)
- T004 depends on T002, T003 (configuration and utilities ready)
- T005 depends on T002, T003 (configuration and utilities ready)

**Phase 2 (Full Migration):**

- T006, T007, T008, T009 depend on T004, T005 (examples established)
- T010, T011, T012, T013 depend on T004, T005 (examples established)
- T014, T015, T016 depend on T006, T007, T008, T009 (critical systems migrated)
- T017, T018, T019 depend on T006, T007, T008 (core systems available for integration testing)

**Phase 3 (Documentation & Cleanup):**

- T020, T021, T022 depend on T016 (all migrations complete)
- T023 depends on T020, T021, T022 (documentation updated before cleanup)
- T024 depends on T023 (final cleanup complete)

## Relevant Files

_To be updated during development:_

## Feature Completion Checklist

- [ ] Review codebase and ensure all tasks are complete
- [ ] Review PRD requirements to ensure all requirements are covered:
  - [ ] Hybrid testing structure implemented (adjacent unit tests + dedicated integration directory)
  - [ ] Test duplication eliminated (especially ItemInteractionSystem)
  - [ ] Clear testing standards established and documented
  - [ ] Integration testing enabled for complete feature workflows
  - [ ] Genuine store-based testing approach adopted (no ComponentOperations mocking)
- [ ] Run pre-merge checks and tests
- [ ] Commit remaining changes with conventional commit structured message
- [ ] Raise a PR for review with clear description
  - [ ] Mention all GitHub issues the PR closes in the body (PRD #46, task subtasks if they exist)
  - [ ] Request review from Copilot

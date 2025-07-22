# Task List: Testing Structure Reorganization

**Generated from:** `prd-testing-structure-reorganization.md`
**Target:** Junior Developer
**Estimated Duration:** 80-120 hours (1-2 weeks)

## Task Categories

### Infrastructure Setup

- [x] **T001: Create New Directory Structure**
  - [x] Create `tests/integration/` directory
  - [x] Create `tests/mocks/` directory for shared test utilities
  - [x] Create `tests/helpers/` directory for test setup utilities
  - [x] Ensure directory structure matches PRD specifications
  - [x] Pre-merge checks have been run and pass
  - [x] Documentation of directory structure has been updated
  - [x] Changes are committed with conventional commit structured message
  - **Estimated Time:** 1 hour

- [x] **T002: Update Vitest Configuration**
  - [x] Modify `vitest.config.ts` to recognize adjacent test pattern (`*.test.ts`)
  - [x] Update test file patterns to include `tests/integration/**/*.test.ts`
  - [x] Ensure coverage reporting includes both adjacent and integration tests
  - [x] Validate configuration works with existing test setup
  - [x] Pre-merge checks have been run and pass
  - [x] Documentation of vitest configuration has been updated
  - [x] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

- [x] **T003: Set Up Shared Test Utilities Infrastructure**
  - [x] Move existing shared mocks to `tests/mocks/` directory
  - [x] Create centralized `tests/helpers/ecsTestSetup.ts` for common ECS test configuration
  - [x] Update existing `tests/helpers/testUtils.ts` for new structure
  - [x] Ensure Pixi.js mocking infrastructure is properly centralized
  - [x] Tests written for new utility functions
  - [x] Pre-merge checks have been run and pass
  - [x] Documentation of shared utilities has been updated
  - [x] Changes are committed with conventional commit structured message
  - **Estimated Time:** 3 hours

- [ ] **T003a: Create Store-Based Testing Utilities**
  - [ ] Create store-based entity creation helpers that use real ComponentOperations
  - [ ] Integrate existing EntityFactory (`createEntityFromTemplate`) for consistent entity creation
  - [ ] Create store cleanup utilities to ensure test isolation
  - [ ] Document the anti-pattern of mocking ComponentOperations and provide store-based alternatives
  - [ ] Tests written for new store-based utilities
  - [ ] Pre-merge checks have been run and pass
  - [ ] Documentation of store-based testing approach has been created
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 4 hours

### Exemplary Migration (Phase 1)

- [ ] **T004: Migrate MovementSystem as Unit Test Example**
  - [ ] Move `MovementSystem.test.ts` adjacent to `MovementSystem.ts`
  - [ ] **CRITICAL**: Remove ComponentOperations mocking and implement store-based testing approach
  - [ ] Use EntityFactory (`createEntityFromTemplate`) instead of custom test entity creation
  - [ ] Ensure test uses real ComponentOperations with actual store interactions
  - [ ] Improve test quality to meet new standards (clear naming, comprehensive edge cases)
  - [ ] Document as exemplary store-based unit test following new patterns
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 4 hours (increased due to store-based refactoring)

- [ ] **T005: Create Key-Chest Interaction Integration Test Example**
  - [ ] Create `tests/integration/keyChestInteraction.integration.test.ts`
  - [ ] Implement complete workflow: pickup key → move to chest → use key → chest opens
  - [ ] Test system interactions: PickupSystem, MovementSystem, ItemInteractionSystem
  - [ ] **Use store-based testing**: Real entities in store, real ComponentOperations, no mocking of ECS internals
  - [ ] **Use EntityFactory**: Leverage `createEntityFromTemplate` for consistent entity creation
  - [ ] Use realistic game scenario with proper ECS component setup
  - [ ] Tests written for integration test scenarios
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 5 hours (increased due to store-based approach)

- [ ] **T006: Establish Testing Quality Standards Document**
  - [ ] Create comprehensive testing standards documentation
  - [ ] **Define store-based testing requirements**: No ComponentOperations mocking, real store usage
  - [ ] **Document EntityFactory integration**: How to use existing EntityFactory in tests
  - [ ] Define unit test requirements (store-based isolation, edge cases, naming conventions)
  - [ ] Define integration test requirements (workflows, system interactions, realistic scenarios)
  - [ ] Document file naming patterns and organization principles
  - [ ] **Document anti-patterns**: Explain why ComponentOperations mocking is problematic
  - [ ] Provide examples from T004 and T005 as reference implementations
  - [ ] Pre-merge checks have been run and pass
  - [ ] Documentation of testing standards has been created
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 4 hours (increased due to store-based documentation)

### Unit Test Migration - Priority 1 Systems

- [ ] **T007: Migrate Additional MovementSystem Tests**
  - [ ] Identify any additional MovementSystem test files beyond the example in T004
  - [ ] Migrate remaining tests to adjacent location with quality improvements
  - [ ] Ensure no duplication with T004 example
  - [ ] Apply established quality standards from T006
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

- [ ] **T008: Consolidate and Migrate PickupSystem Tests**
  - [ ] Identify all existing PickupSystem test files across `__tests__` directories
  - [ ] Consolidate duplicated test logic into single `PickupSystem.test.ts`
  - [ ] **Remove ComponentOperations mocking**: Implement store-based testing approach
  - [ ] **Use EntityFactory**: Leverage existing entity creation patterns
  - [ ] Place adjacent to `PickupSystem.ts` source file
  - [ ] Improve test quality during migration (better assertions, edge cases)
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 4 hours (increased due to store-based refactoring)

- [ ] **T009: Migrate KeyboardInputSystem Tests**
  - [ ] Locate existing KeyboardInputSystem test files
  - [ ] Migrate to adjacent location as `KeyboardInputSystem.test.ts`
  - [ ] Improve test coverage for input handling edge cases
  - [ ] Ensure proper mocking of keyboard events
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 3 hours

- [ ] **T010: Consolidate ItemInteractionSystem Tests (Major Consolidation)**
  - [ ] Identify all 5+ separate ItemInteractionSystem test files mentioned in PRD
  - [ ] Analyze overlapping test logic and eliminate duplication
  - [ ] **Remove ComponentOperations mocking**: Replace with store-based testing throughout
  - [ ] **Use EntityFactory**: Consistent entity creation for interaction tests
  - [ ] Create single comprehensive `ItemInteractionSystem.test.ts`
  - [ ] Place adjacent to `ItemInteractionSystem.ts` source file
  - [ ] Significantly improve test quality during consolidation
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 8 hours (increased due to complex consolidation + store-based refactoring)

### Unit Test Migration - Priority 2 Components

- [ ] **T011: Migrate PositionComponent Tests**
  - [ ] Locate existing PositionComponent test files
  - [ ] Migrate to adjacent location as `PositionComponent.test.ts`
  - [ ] Ensure comprehensive testing of component data operations
  - [ ] Apply established testing quality standards
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

- [ ] **T012: Migrate VelocityComponent Tests**
  - [ ] Locate existing VelocityComponent test files
  - [ ] Migrate to adjacent location as `VelocityComponent.test.ts`
  - [ ] Test component behavior with MovementSystem integration points
  - [ ] Ensure proper isolation from MovementSystem logic
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

- [ ] **T013: Migrate PickableComponent Tests**
  - [ ] Locate existing PickableComponent test files
  - [ ] Migrate to adjacent location as `PickableComponent.test.ts`
  - [ ] Test component behavior with PickupSystem integration points
  - [ ] Focus on component state management in isolation
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

- [ ] **T014: Migrate InteractableComponent Tests**
  - [ ] Locate existing InteractableComponent test files
  - [ ] Migrate to adjacent location as `InteractableComponent.test.ts`
  - [ ] Test component behavior with ItemInteractionSystem integration points
  - [ ] Ensure comprehensive coverage of interaction states
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

### Unit Test Migration - Priority 3 Systems

- [ ] **T015: Migrate RenderSystem Tests**
  - [ ] Locate existing RenderSystem test files
  - [ ] Migrate to adjacent location as `RenderSystem.test.ts`
  - [ ] Improve mocking strategy for Pixi.js rendering components
  - [ ] Focus on rendering logic rather than visual output verification
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 4 hours

- [ ] **T016: Migrate CleanUpSystem Tests**
  - [ ] Locate existing CleanUpSystem test files
  - [ ] Migrate to adjacent location as `CleanUpSystem.test.ts`
  - [ ] Test entity cleanup and memory management scenarios
  - [ ] Ensure proper testing of system lifecycle management
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

- [ ] **T017: Migrate Utility Function Tests**
  - [ ] Identify tests for `ecsUtils.ts`, `EntityFactory.ts`, and other utility functions
  - [ ] Migrate each to adjacent location (e.g., `ecsUtils.test.ts`)
  - [ ] Consolidate scattered utility tests into logical units
  - [ ] Improve test coverage for edge cases and error conditions
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 4 hours

### Integration Test Creation

- [ ] **T018: Create Player Movement Integration Test**
  - [ ] Create `tests/integration/playerMovement.integration.test.ts`
  - [ ] Test complete workflow: keyboard input → velocity update → position update → visual rendering
  - [ ] Cover KeyboardInputSystem, MovementSystem, RenderSystem interactions
  - [ ] Use realistic game scenarios with actual component setup
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 3 hours

- [ ] **T019: Create Item Pickup Workflow Integration Test**
  - [ ] Create `tests/integration/itemPickup.integration.test.ts`
  - [ ] Test workflow: player approaches item → item detected → item picked up → inventory updated
  - [ ] Cover MovementSystem and PickupSystem interactions
  - [ ] Include edge cases like pickup range and inventory capacity
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 3 hours

- [ ] **T020: Expand Key-Chest Interaction Integration Tests**
  - [ ] Expand on T005 example with additional key-chest scenarios
  - [ ] Test error cases: using wrong key, chest already open, no key in inventory
  - [ ] Test multiple key-chest pairs in single scenario
  - [ ] Ensure comprehensive coverage of ItemInteractionSystem edge cases
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 3 hours

- [ ] **T021: Create Comprehensive Gameplay Scenarios Integration Tests**
  - [ ] Create `tests/integration/gameplayScenarios.integration.test.ts`
  - [ ] Test complex multi-step scenarios combining multiple workflows
  - [ ] Include scenarios like: collect multiple items, use items in sequence, navigate obstacles
  - [ ] Focus on system interaction patterns and data flow validation
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 4 hours
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 4 hours

### Documentation Updates

- [ ] **T022: Update Testing Guide for Hybrid Structure**
  - [ ] Update `docs/testing/testing-guide.md` to reflect new hybrid approach
  - [ ] Document when to use unit vs integration tests
  - [ ] Provide examples of proper test placement and organization
  - [ ] Include migration guidelines for developers adding new tests
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

- [ ] **T023: Update ECS Testing Patterns Documentation**
  - [ ] Update `docs/testing/ecs-testing-patterns.md` with integration test patterns
  - [ ] Document best practices for testing system interactions
  - [ ] Provide templates for common ECS testing scenarios
  - [ ] Include examples from newly created integration tests
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 3 hours

- [ ] **T024: Update Test Utilities Reference**
  - [ ] Update `docs/testing/test-utilities-reference.md` for shared helpers location
  - [ ] Document new `tests/helpers/` and `tests/mocks/` utilities
  - [ ] Provide usage examples for centralized test setup functions
  - [ ] Reference new ECS test setup utilities
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

- [ ] **T025: Create Migration Guidelines Documentation**
  - [ ] Create new documentation for future test additions
  - [ ] Define decision tree for unit vs integration test placement
  - [ ] Provide checklist for developers adding new tests
  - [ ] Document quality standards and review criteria
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

### Quality Assurance & Cleanup

- [ ] **T026: Validate All Tests Pass in New Structure**
  - [ ] Run complete test suite to ensure all migrated tests pass
  - [ ] Verify coverage reporting works correctly with new structure
  - [ ] Test both unit and integration test execution
  - [ ] Fix any issues discovered during validation
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 3 hours

- [ ] **T027: Remove Old __tests__ Directories**
  - [ ] Identify all remaining `__tests__` directories after migration
  - [ ] Verify no tests remain in old structure before deletion
  - [ ] Remove empty `__tests__` directories throughout codebase
  - [ ] Update any remaining references to old test structure
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 1 hour

- [ ] **T028: Final Code Review and Validation**
  - [ ] Comprehensive review of entire testing structure migration
  - [ ] Ensure all PRD requirements have been met
  - [ ] Validate test discoverability and organization goals
  - [ ] Run final test suite and coverage validation
  - [ ] Pre-merge checks have been run and pass
  - [ ] Changes are committed with conventional commit structured message
  - **Estimated Time:** 2 hours

## Task Dependencies

### Phase 1 Dependencies (Infrastructure & Examples)
- T002 depends on T001 (directory structure must exist)
- T003 depends on T001 (shared utilities need directory structure)
- T003a depends on T003 (store-based utilities build on shared infrastructure)
- T004 depends on T001, T002, T003a (structure, config, and store-based utilities ready)
- T005 depends on T001, T002, T003a (needs infrastructure and store-based utilities)
- T006 depends on T004, T005 (examples needed to establish standards)

### Phase 2A Dependencies (Priority 1 Systems)
- T007-T010 depend on T004, T006 (exemplary migration and standards established)

### Phase 2B Dependencies (Priority 2 Components)  
- T011-T014 depend on T007-T010 (Priority 1 systems migration complete)

### Phase 2C Dependencies (Priority 3 Systems)
- T015-T017 depend on T011-T014 (Priority 2 components migration complete)

### Phase 2D Dependencies (Integration Tests)
- T018-T021 depend on T005, T006 (integration example and standards established)

### Phase 3A Dependencies (Documentation)
- T022-T025 depend on T006 (standards established) and can run parallel with migration tasks

### Phase 3B Dependencies (Final Cleanup)
- T026 depends on T007-T021 (all migration tasks complete)
- T027 depends on T026 (validation complete)
- T028 depends on T027 (cleanup complete)

## Relevant Files

_To be updated during development:_

### Source Files to be Migrated
- `src/game/systems/MovementSystem.ts` + tests (**Priority**: Remove ComponentOperations mocking)
- `src/game/systems/PickupSystem.ts` + tests  
- `src/game/systems/KeyboardInputSystem.ts` + tests
- `src/game/systems/ItemInteractionSystem.ts` + tests (5+ test files to consolidate)
- `src/game/components/individualComponents/PositionComponent.ts` + tests
- `src/game/components/individualComponents/VelocityComponent.ts` + tests
- `src/game/components/individualComponents/PickableComponent.ts` + tests
- `src/game/components/individualComponents/InteractableComponent.ts` + tests
- `src/game/systems/RenderSystem.ts` + tests
- `src/game/systems/CleanUpSystem.ts` + tests
- `src/game/utils/ecsUtils.ts` + tests
- `src/game/utils/EntityFactory.ts` + tests (**To leverage**: Use in test utilities)

### Configuration Files
- `vitest.config.ts`

### Documentation Files
- `docs/testing/testing-guide.md`
- `docs/testing/ecs-testing-patterns.md`
- `docs/testing/test-utilities-reference.md`

## Feature Completion Checklist
- [ ] Review codebase and ensure all tasks are complete
- [ ] Review PRD requirements to ensure all requirements are covered
- [ ] Run pre-merge checks and tests
- [ ] Commit remaining changes with conventional commit structured message
- [ ] Raise a PR for review with clear description
  - [ ] Mention all GitHub issues the PR closes in the body (PRD #46, tasks and subtasks if they exist)
  - [ ] Request review from Copilot

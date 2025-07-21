# Task List: Entity Interaction System

**Generated from:** `prd-item-unlock-system.md`
**Target:** Junior Developer
**Estimated Duration:** 32 hours

## Task Categories

### Core Infrastructure

- [x] **T001: Create InteractionBehaviorType Enum**
  - [x] Create `src/game/components/individualComponents/InteractionBehaviorType.ts`
  - [x] Define enum: `TRANSFORM`, `REMOVE`, `SPAWN_CONTENTS`
  - [x] Export enum for use in components and systems
  - [x] **Acceptance Criteria:**
    - Enum properly typed and exported
    - Follows existing code patterns
    - All three behavior types included
  - [x] Write unit tests for enum validation
  - [x] Run linting and formatting checks
  - [x] All tests passing
  - [x] Commit with conventional commit message

- [x] **T002: Create RequiresItemComponent**
  - [x] Create `src/game/components/individualComponents/RequiresItemComponent.ts`
  - [x] Implement component with `requiredCapabilities: string[]` and `isActive: boolean`
  - [x] Create proper TypeScript types and props interface
  - [x] Follow existing component patterns (constructor, type property)
  - [x] **Acceptance Criteria:**
    - Component follows established patterns from other components
    - Proper TypeScript typing with props interface
    - Constructor accepts and validates props
    - Default `isActive` to `true`
    - Supports multiple capabilities via array
  - [x] Write unit tests for component creation and validation
  - [x] Run linting and formatting checks
  - [x] All tests passing
  - [x] Commit with conventional commit message

- [x] **T003: Create UsableItemComponent**
  - [x] Create `src/game/components/individualComponents/UsableItemComponent.ts`
  - [x] Implement component with `capabilities: string[]` and `isConsumable: boolean`
  - [x] Create proper TypeScript types and props interface
  - [x] Follow existing component patterns (constructor, type property)
  - [x] **Acceptance Criteria:**
    - Component follows established patterns from other components
    - Proper TypeScript typing with props interface
    - Constructor accepts and validates props
    - Default `isConsumable` to `true`
    - Supports multiple capabilities via array
  - [x] Write unit tests for component creation and validation
  - [x] Run linting and formatting checks
  - [x] All tests passing
  - [x] Commit with conventional commit message

- [x] **T004: Create InteractionBehaviorComponent**
  - [x] Create `src/game/components/individualComponents/InteractionBehaviorComponent.ts`
  - [x] Implement component with `behaviorType: InteractionBehaviorType`, `newSpriteId?: string`, `isRepeatable: boolean`
  - [x] Create proper TypeScript types and props interface
  - [x] Follow existing component patterns (constructor, type property)
  - [x] **Acceptance Criteria:**
    - Component follows established patterns from other components
    - Uses InteractionBehaviorType enum from T001
    - Proper TypeScript typing with props interface
    - Constructor accepts and validates props
    - Default `isRepeatable` to `false`
    - `newSpriteId` optional and only used for TRANSFORM behavior
  - [x] Write unit tests for component creation and validation
  - [x] Run linting and formatting checks
  - [x] All tests passing
  - [x] Commit with conventional commit message

- [x] **T005: Create SpawnContentsComponent**
  - [x] Create `src/game/components/individualComponents/SpawnContentsComponent.ts`
  - [x] Implement component with `contents: EntityTemplate[]` and `spawnOffset?: { x: number; y: number }`
  - [x] Create proper TypeScript types and props interface
  - [x] Import EntityTemplate type from utils
  - [x] Follow existing component patterns (constructor, type property)
  - [x] **Acceptance Criteria:**
    - Component follows established patterns from other components
    - Uses EntityTemplate type properly
    - Proper TypeScript typing with props interface
    - Constructor accepts and validates props
    - `spawnOffset` defaults to `{ x: 0, y: 0 }`
    - Supports multiple entity templates in contents array
  - [x] Write unit tests for component creation and validation
  - [x] Run linting and formatting checks
  - [x] All tests passing
  - [x] Commit with conventional commit message

- [x] **T006: Update ComponentTypes Enum and Dictionary**
  - [x] Add 4 new ComponentType entries to enum: `RequiresItem`, `UsableItem`, `InteractionBehavior`, `SpawnContents`
  - [x] Add imports for all 4 new component classes
  - [x] Add entries to FullComponentDictionary type mapping
  - [x] Add entries to ComponentPropsMap (if it exists)
  - [x] **Acceptance Criteria:**
    - All 4 new components properly registered
    - TypeScript compilation successful
    - Follows existing naming conventions
    - Dictionary mapping includes all new components
  - [x] Write unit tests to verify component type registration
  - [x] Run linting and formatting checks
  - [x] All tests passing
  - [x] Commit with conventional commit message

### System Implementation

- [ ] **T007: Create ItemInteractionSystem Core Structure**
  - [ ] Create `src/game/systems/ItemInteractionSystem.ts`
  - [ ] Implement System interface with update method
  - [ ] Create private methods for: `processInteractions`, `findRequiredItemEntities`, `validateCapabilities`
  - [ ] Add proper imports and type definitions
  - [ ] **Acceptance Criteria:**
    - Implements System interface correctly
    - Has update method that accepts UpdateArgs
    - Follows existing system patterns
    - Proper TypeScript typing
    - Core structure ready for logic implementation
  - [ ] Write initial system tests (structure only)
  - [ ] Run linting and formatting checks
  - [ ] All tests passing
  - [ ] Commit with conventional commit message

- [ ] **T008: Implement Capability Matching Logic**
  - [ ] Implement `validateCapabilities` method to match UsableItem capabilities with RequiresItem requirements
  - [ ] Implement `findCompatibleItem` method to scan player CarriedItems for compatible capabilities
  - [ ] Use array intersection logic for capability matching
  - [ ] Handle edge cases (no carried items, no compatible items)
  - [ ] **Acceptance Criteria:**
    - Array intersection logic correctly matches capabilities
    - Returns first compatible item found
    - Handles empty inventories gracefully
    - Validates capability arrays properly
    - Logs appropriate debug information
  - [ ] Write comprehensive unit tests for capability matching scenarios
  - [ ] Run linting and formatting checks
  - [ ] All tests passing
  - [ ] Commit with conventional commit message

- [ ] **T009: Implement Interaction Behavior Processing**
  - [ ] Implement `processBehavior` method to handle TRANSFORM, REMOVE, SPAWN_CONTENTS behaviors
  - [ ] For TRANSFORM: update sprite component and set RequiresItem.isActive to false
  - [ ] For REMOVE: remove entity from game world
  - [ ] For SPAWN_CONTENTS: remove entity and create new entities from SpawnContentsComponent
  - [ ] Handle behavior validation and error cases
  - [ ] **Acceptance Criteria:**
    - All 3 behavior types implemented correctly
    - TRANSFORM updates sprites and disables further interactions
    - REMOVE completely removes entities
    - SPAWN_CONTENTS creates new entities at appropriate positions
    - Error handling for missing components or invalid data
  - [ ] Write unit tests for each behavior type
  - [ ] Run linting and formatting checks
  - [ ] All tests passing
  - [ ] Commit with conventional commit message

- [ ] **T010: Implement Item Consumption Logic**
  - [ ] Implement `handleItemConsumption` method to process consumable items after successful interaction
  - [ ] Remove consumable items from player CarriedItemComponent
  - [ ] Retain non-consumable items for repeated use
  - [ ] Handle multiple carried items correctly during consumption
  - [ ] **Acceptance Criteria:**
    - Consumable items properly removed after use
    - Non-consumable items remain in player inventory
    - Multiple item handling works correctly
    - Player inventory state updated properly
  - [ ] Write unit tests for consumption scenarios
  - [ ] Run linting and formatting checks
  - [ ] All tests passing
  - [ ] Commit with conventional commit message

- [ ] **T011: Complete ItemInteractionSystem Integration**
  - [ ] Connect all private methods in the main `update` method
  - [ ] Process InteractingComponent entities for interaction attempts
  - [ ] Find target entities with RequiresItemComponent at player position
  - [ ] Execute full interaction workflow: validate → process behavior → consume item
  - [ ] Handle system ordering and dependencies
  - [ ] **Acceptance Criteria:**
    - Full interaction workflow functions end-to-end
    - Processes InteractingComponent entities correctly
    - Integrates with existing ECS update cycle
    - Proper error handling and logging
    - System performance within acceptable limits
  - [ ] Write integration tests for complete interaction workflows
  - [ ] Run linting and formatting checks
  - [ ] All tests passing
  - [ ] Commit with conventional commit message

### Entity Templates & Integration

- [ ] **T012: Update ComponentOperations for New Components**
  - [ ] Add utility functions for new components if needed
  - [ ] Ensure getComponent/setComponent works with new component types
  - [ ] Update any component validation or helper functions
  - [ ] **Acceptance Criteria:**
    - All new components work with existing ComponentOperations utilities
    - No breaking changes to existing component operations
    - TypeScript compilation successful
  - [ ] Write tests for component operations with new components
  - [ ] Run linting and formatting checks
  - [ ] All tests passing
  - [ ] Commit with conventional commit message

- [ ] **T013: Create Example Entity Templates**
  - [ ] Create sample entity templates in `EntityTemplates.ts` demonstrating the interaction system
  - [ ] Create `Key` template (UsableItemComponent with "unlock" capability, consumable)
  - [ ] Create `Door` template (RequiresItemComponent requiring "unlock", InteractionBehaviorComponent with TRANSFORM)
  - [ ] Create `Chest` template (RequiresItemComponent, InteractionBehaviorComponent with SPAWN_CONTENTS, SpawnContentsComponent with treasure)
  - [ ] **Acceptance Criteria:**
    - Templates demonstrate all interaction behaviors
    - Follow existing EntityTemplate patterns
    - Proper component configuration
    - Templates can be instantiated successfully
  - [ ] Write tests for entity template creation and component validation
  - [ ] Run linting and formatting checks
  - [ ] All tests passing
  - [ ] Commit with conventional commit message

- [x] **T014: Register ItemInteractionSystem in Game**
  - [x] Import ItemInteractionSystem in `GameSystem.ts`
  - [x] Add system to game system registry
  - [x] Ensure proper system execution order (after KeyboardInputSystem, before CleanUpSystem)
  - [x] **Acceptance Criteria:**
    - System properly registered and running
    - Execution order maintains ECS data flow
    - No conflicts with existing systems
    - System receives proper UpdateArgs
  - [x] Write integration tests for system registration
  - [x] Run linting and formatting checks
  - [x] All tests passing
  - [x] Commit with conventional commit message

### Testing

- [ ] **T015: Create Comprehensive Component Tests**
  - [ ] Write unit tests for all 4 new components
  - [ ] Test component creation, prop validation, type checking
  - [ ] Test edge cases and error conditions
  - [ ] Ensure 90%+ test coverage for component code
  - [ ] **Acceptance Criteria:**
    - All components have comprehensive test coverage
    - Edge cases and validation scenarios tested
    - Test performance acceptable
    - All tests pass consistently
  - [ ] Run linting and formatting checks
  - [ ] All tests passing
  - [ ] Commit with conventional commit message

- [ ] **T016: Create ItemInteractionSystem Integration Tests**
  - [ ] Write integration tests for complete interaction workflows
  - [ ] Test successful interactions for all behavior types
  - [ ] Test failure scenarios (no compatible items, missing components)
  - [ ] Test item consumption and retention scenarios
  - [ ] **Acceptance Criteria:**
    - Full system functionality tested end-to-end
    - All interaction behaviors validated
    - Error conditions properly handled
    - Performance within acceptable limits
  - [ ] Run linting and formatting checks
  - [ ] All tests passing
  - [ ] Commit with conventional commit message

- [ ] **T017: Create ECS Integration Tests**
  - [ ] Test interaction system with existing ECS systems
  - [ ] Verify KeyboardInputSystem → ItemInteractionSystem → RenderSystem workflow
  - [ ] Test system execution order and data flow
  - [ ] Test multiplayer-safe state management
  - [ ] **Acceptance Criteria:**
    - System integrates properly with existing ECS architecture
    - No side effects on other systems
    - Proper component lifecycle management
    - State consistency maintained
  - [ ] Run linting and formatting checks
  - [ ] All tests passing
  - [ ] Commit with conventional commit message

### Documentation

- [ ] **T018: Update Architecture Documentation**
  - [ ] Update ECS architecture documentation with new components and system
  - [ ] Document interaction system workflow and design patterns
  - [ ] Add component and system reference documentation
  - [ ] Update existing component documentation if needed
  - [ ] **Acceptance Criteria:**
    - All new components documented with properties and usage
    - System workflow clearly explained
    - Integration points documented
    - Examples provided for common use cases
  - [ ] Documentation review and formatting
  - [ ] Commit with conventional commit message

## Final Tasks

- [ ] **T019: Review and Integration**
  - [ ] Review all changes and ensure tasks are complete
  - [ ] Review PRD requirements to ensure all are covered
  - [ ] Run full test suite and linting/formatting checks
  - [ ] Verify all functionality works end-to-end
  - [ ] **Acceptance Criteria:**
    - All PRD requirements implemented
    - Full test coverage achieved
    - No regressions in existing functionality
    - Code quality standards met

- [ ] **T020: Final Commit and PR**
  - [ ] Commit any remaining changes with conventional commit message
  - [ ] Create comprehensive pull request description
  - [ ] Link to PRD issue and all related task issues
  - [ ] Request review from Copilot
  - [ ] **Acceptance Criteria:**
    - PR clearly describes all changes and functionality
    - Links to all relevant issues (closes PRD, tasks)
    - Review requested from appropriate reviewers
    - CI/CD checks passing

## Task Dependencies

**Infrastructure Dependencies:**
- T002, T003, T004, T005 can be developed in parallel
- T006 depends on T002, T003, T004, T005 (all components must exist)
- T012 depends on T006 (ComponentTypes must be updated)

**System Dependencies:**
- T007 depends on T006 (component types registered)
- T008, T009, T010 depend on T007 (system structure exists)
- T011 depends on T008, T009, T010 (all logic implemented)
- T014 depends on T011 (complete system ready)

**Integration Dependencies:**
- T013 depends on T006, T012 (components available and operational)
- T015 depends on T002, T003, T004, T005 (components exist)
- T016 depends on T011 (system complete)
- T017 depends on T014 (system registered)

**Final Dependencies:**
- T018 can be developed in parallel with implementation
- T019 depends on all previous tasks
- T020 depends on T019

## Relevant Files

- `src/game/components/ComponentTypes.ts` - Component type registry
- `src/game/components/individualComponents/` - All component implementations
- `src/game/systems/ItemInteractionSystem.ts` - New interaction system
- `src/game/systems/KeyboardInputSystem.ts` - Existing E-key handling
- `src/game/templates/EntityTemplates.ts` - Example interaction entities
- `src/game/GameSystem.ts` - System registration
- `src/game/components/ComponentOperations.ts` - Component utilities

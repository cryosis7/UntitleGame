# Product Requirements Document: Entity Interaction System

## Introduction/Overview

The Entity Interaction System enables players to use carried items to interact with target entities through the existing interaction mechanism (E key). This system extends the current ECS-based interaction framework to support contextual item usage, creating relationships between actor entities (players), tool entities (carried items), and target entities (interactable objects).

The system is entity-agnostic and behavior-driven. It does not care whether the interaction is a key opening a door, a hammer hitting a nail, or a crowbar breaking a window - it only cares about the **capability relationships** between entities and the **behavioral outcomes** of successful interactions.

The system integrates seamlessly with the existing `CarriedItemComponent` system and `InteractingComponent` workflow, automatically selecting and using compatible items when the player interacts with target entities.

## Goals

**Primary Objectives:**

- Enable contextual item usage through capability-based entity relationships
- Support multiple interaction behaviors: transform entities, remove entities, spawn new entities
- Provide automatic item selection based on capability matching
- Create a generic, reusable interaction system independent of specific entity types
- Integrate seamlessly with existing ECS architecture and interaction systems

**Business Value:**

- Adds depth to gameplay through flexible puzzle mechanics and exploration
- Creates meaningful item collection and management gameplay loops
- Enables rich level design with diverse interaction possibilities
- Maintains intuitive controls using familiar interaction patterns
- Provides reusable system for unlimited interaction types

## User Stories

### Core Functionality

**US001: Generic Item-Target Interaction**

- **As a** player
- **I want** to use carried items on compatible target entities by pressing E
- **So that** I can interact with the environment using tools and items
- **Acceptance Criteria:**
  - Player approaches target entity while carrying compatible item
  - Player presses E key to interact
  - System automatically uses compatible item (no manual selection required)
  - Target entity responds according to its configured behavior
  - Used item behavior depends on item configuration (consumed or retained)

**US002: Capability-Based Matching**

- **As a** player
- **I want** items to work only on compatible targets
- **So that** interactions are logical and meaningful
- **Acceptance Criteria:**
  - Items with "unlock" capability work on targets requiring "unlock"
  - Items with "break" capability work on targets requiring "break"
  - Items with "activate" capability work on targets requiring "activate"
  - System shows appropriate feedback when item is incompatible

**US003: Flexible Entity Behaviors**

- **As a** player
- **I want** target entities to respond in different ways when interacted with
- **So that** the world feels dynamic and diverse
- **Acceptance Criteria:**
  - Some targets transform (change sprite/state) when interacted with
  - Some targets are removed from the world when interacted with
  - Some targets spawn new entities when interacted with
  - Behavior is determined by target entity configuration, not item type

**US004: Automatic Item Selection**

- **As a** player
- **I want** the system to automatically use compatible items from my inventory
- **So that** I don't need to manually select items for each interaction
- **Acceptance Criteria:**
  - System scans carried items for compatible capabilities
  - First compatible item found is automatically used
  - No UI required for item selection
  - Player receives feedback if no compatible item is available

### Advanced Behaviors

**US005: Consumable Items**

- **As a** player
- **I want** some items to be consumed when used
- **So that** item usage has meaningful consequences
- **Acceptance Criteria:**
  - Consumable items disappear from inventory after use
  - Target entity state change is permanent
  - System provides feedback when item is consumed

**US006: Reusable Items**

- **As a** player
- **I want** some items to remain in my inventory after use
- **So that** I can use them multiple times
- **Acceptance Criteria:**
  - Reusable items remain in player inventory
  - Target entities can potentially be interacted with multiple times
  - System tracks target state independently of item availability

**US007: Entity Spawning**

- **As a** player
- **I want** some interactions to create new entities in the world
- **So that** I can discover hidden items or trigger complex mechanisms
- **Acceptance Criteria:**
  - Target entity can spawn one or more new entities
  - Spawned entities appear at target location or nearby walkable tiles
  - Original target entity may be removed or transformed
  - Spawning behavior is configurable per target entity

## Functional Requirements

### Core Components

**FR001: RequiresItemComponent**

- Component marks entities as targets requiring specific item capabilities for interaction
- Properties: `requiredCapabilities` (array of strings), `isActive` (boolean)
- Capabilities are abstract strings (e.g., "unlock", "break", "activate", "green-access")
- Must support multiple valid capabilities per target (OR logic)

**FR002: UsableItemComponent**

- Component marks carried items as tools with specific capabilities
- Properties: `capabilities` (array of strings), `isConsumable` (boolean)
- Integrates with existing CarriedItemComponent system
- Single item can have multiple capabilities (multi-purpose tools)

**FR003: InteractionBehaviorComponent**

- Component defines how target entity responds to successful interaction
- Properties: `behaviorType` (enum), `newSpriteId` (string, optional), `isRepeatable` (boolean)
- Behavior options: TRANSFORM, REMOVE, SPAWN_CONTENTS
- Determines entity response regardless of which item triggered the interaction

**FR004: SpawnContentsComponent**

- Component defines what entities are created when SPAWN_CONTENTS behavior triggers
- Properties: `contents` (array of EntityTemplate references), `spawnOffset` (position offset)
- Only applies to entities with SPAWN_CONTENTS interaction behavior
- Supports spawning multiple entities from single interaction

### System Integration

**FR005: Enhanced Interaction Processing**

- Extends existing InteractingComponent workflow to check for item-based interactions
- Scans entities at player position for RequiresItemComponent
- Automatically matches player inventory items with target requirements
- Processes interaction behavior based on InteractionBehaviorComponent configuration

**FR006: Capability Matching System**

- Matches UsableItemComponent.capabilities with RequiresItemComponent.requiredCapabilities
- Uses array intersection logic (item must have at least one required capability)
- Supports complex capability strings for specificity (e.g., "green-key", "master-key")
- Prioritizes first compatible item found in player inventory

**FR007: Interaction Behavior Processing**

- TRANSFORM: Changes sprite component using newSpriteId, updates isActive state
- REMOVE: Removes target entity from game world completely
- SPAWN_CONTENTS: Removes target entity and creates new entities from SpawnContentsComponent
- Updates target entity state to reflect interaction completion

**FR008: Item Consumption Logic**

- Checks UsableItemComponent.isConsumable after successful interaction
- Removes consumable items from player CarriedItemComponent
- Retains non-consumable items for repeated use
- Handles multiple carried items correctly during consumption

### Integration Requirements

**FR009: ECS Architecture Compliance**

- All components follow existing ComponentType enum pattern
- Components integrate with ComponentOperations utilities
- Systems follow established System interface and UpdateArgs pattern
- Maintains existing entity-component relationships

**FR010: Existing System Integration**

- KeyboardInputSystem continues to handle E-key input via InteractingComponent
- PickupSystem remains unchanged for item collection mechanics
- New ItemInteractionSystem processes InteractingComponent entities for item-based interactions
- RenderSystem automatically displays updated sprites after interaction
- MovementSystem unaffected by interaction mechanics

**FR008: Existing System Integration**

- KeyboardInputSystem continues to handle E-key input via InteractingComponent
- PickupSystem remains unchanged for item collection mechanics
- New UnlockSystem processes InteractingComponent entities for unlock behavior
- RenderSystem automatically displays updated sprites after unlock

## Non-Goals

**Explicitly Excluded Features:**

- Audio feedback system (future consideration)
- Complex interaction animations or transitions
- Chained interactions (item A unlocks container with item B)
- Inventory UI for manual item selection
- Proximity-based automatic interactions
- Mini-games or skill systems for interactions
- Item durability or breaking mechanics
- Undo/restore functionality for transformed entities
- Specific entity type implementations (doors, keys, etc.)

## Design Considerations

### UI/UX Requirements

**Visual Feedback:**

- Transformed entities show clear visual state change (different sprite)
- No additional UI elements required for item selection
- Existing interaction prompt (E key) remains unchanged
- Player inventory shows usable items with existing CarriedItem display

**Interaction Flow:**

1. Player approaches target entity while carrying compatible item
2. Player presses E key (existing interaction)
3. System automatically selects and uses compatible item
4. Target entity responds according to its configured behavior
5. Item consumed or retained based on configuration

### Error Handling

**Invalid Interactions:**

- Interacting without compatible item shows appropriate feedback
- No usable items in inventory shows "cannot interact" feedback
- System gracefully handles missing components
- Malformed component data logged as warnings

## Technical Considerations

### Performance Requirements

- Interaction validation runs only during active E-key interactions (not continuous)
- Capability matching uses array intersection (O(n\*m) complexity acceptable for small inventories)
- Inventory scanning limited to single player entity
- Component updates batched within single system update cycle

### Security & Validation

- Key type validation prevents invalid unlock attempts
- Component existence checks prevent null reference errors
- Entity ID validation ensures spawned content references valid templates
- Unlock state persisted in component data for save/load compatibility

### Scalability Considerations

- System supports unlimited number of capability types via string matching
- RequiresItemComponent scales to any number of entities without performance impact
- Item inventory system compatible with future full inventory implementation
- Interaction behaviors extensible through enum addition
- Entity-agnostic design allows unlimited interaction types without code changes

### Integration Points

**Existing Systems:**

- KeyboardInputSystem: No changes required (continues E-key handling)
- PickupSystem: No changes required (handles item collection)
- RenderSystem: Automatic sprite updates when components change
- MovementSystem: No interaction with interaction mechanics

**Data Flow:**

1. KeyboardInputSystem adds InteractingComponent on E-key press
2. ItemInteractionSystem processes entities with InteractingComponent
3. ItemInteractionSystem scans for RequiresItemComponent on nearby entities
4. ItemInteractionSystem validates capabilities in player CarriedItemComponent
5. ItemInteractionSystem executes interaction behavior and updates components
6. RenderSystem displays updated sprites automatically

## Success Metrics

### Functional Metrics

- **Item Interaction Success Rate**: >95% of valid item-target interactions succeed
- **Invalid Interaction Handling**: 100% of invalid attempts provide appropriate feedback
- **Component Integration**: Zero breaking changes to existing systems
- **Performance**: Interaction processing adds <1ms to E-key interaction latency

### User Experience Metrics

- **Intuitive Interaction**: Players understand interaction mechanics within first use
- **Visual Clarity**: Entity states before/after interaction clearly distinguishable
- **Seamless Integration**: Interaction system feels native to existing gameplay

### Technical Metrics

- **Test Coverage**: >90% coverage for all new components and systems
- **Error Rate**: <1% of interaction attempts result in errors or invalid states
- **Memory Usage**: Interaction components add <10KB to typical level memory footprint

## Open Questions

**Technical Implementation:**

1. **Sprite Naming Convention**: Should transformed sprites follow naming pattern (e.g., "entity_state_a" → "entity_state_b")?
2. **Content Spawning Logic**: How should multiple spawned entities be positioned if spawn location is blocked?
3. **Item Priority**: If player carries multiple compatible items, which should be used first?

**Game Design:** 4. **Interaction Visual Indicators**: Should target entities display what capabilities they require? 5. **Feedback Messaging**: What text/visual feedback should show when interactions fail? 6. **Save State**: Should interaction state be preserved across game sessions?

**Future Integration:** 7. **Inventory System**: How should this system adapt when full inventory replaces single CarriedItem? 8. **Multiplayer**: Do interaction states sync across multiple players in shared game world?

---

## GitHub Issue Tracking

This PRD is tracked via GitHub issue: **[#44 - PRD for Entity Interaction System](https://github.com/cryosis7/UntitleGame/issues/44)**

**Issue Labels:** `prd`, `feature-request`, `ecs-system`, `interaction-system`
**Issue Status:** Updated with corrected requirements - ready for review
**Next Steps:** Stakeholder review and implementation planning

---

**Document Status:** Updated Draft for Review  
**Created:** July 21, 2025  
**Last Updated:** July 21, 2025 - Corrected to entity-agnostic interaction system  
**Next Review:** After stakeholder feedback incorporation

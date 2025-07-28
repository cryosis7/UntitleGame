# ItemInteractionSystem Test Cases Documentation

## File Purpose

The `ItemInteractionSystem` is a core system in the ECS (Entity Component System) architecture that handles interactions between entities carrying usable items and entities that require items to function. It processes capability matching, validates positioning and direction requirements, executes interaction behaviors, and manages item consumption.

This system is crucial for gameplay mechanics where players use tools or items to interact with objects in the game world (e.g., using a key on a chest, using a tool on a machine).

## Test Implementation Guiding Prinicipals

1. **Setup Comprehensive Test Fixtures**: Create reusable entity configurations for different scenarios
2. **Use Authentic Utilities**: use the authentic entity utilities, component operations, and mapping functions
3. **Clear store after every test**: Maintain test isolation by clearing the store
4. **Test Error Boundaries**: Ensure all error conditions are properly handled
5. **Validate State Changes**: Verify entity modifications, additions, and removals

## Critical Paths for Testing Priority

1. **High Priority**: Main interaction flow (Path 1.6), capability matching (Path 2.3), position validation (Path 3.4)
2. **Medium Priority**: Error handling paths, behavior processing, item consumption
3. **Low Priority**: Edge cases, performance scenarios, boundary conditions

## Public Methods

### `update({ entities }: UpdateArgs): void`

**Purpose**: Main entry point for the system that processes all item-based interactions in a single frame.

**When Executed**: Called every game frame by the main game loop when entities with interaction components are present.

## Logic Paths Analysis

### 1. Main Update Loop (`update` method)

#### Path 1.1: No Interacting Entities
- **Condition**: No entities have all three components: `Interacting`, `CarriedItem`, and `Position`
- **Behavior**: Method exits early, no processing occurs
- **Test Importance**: Ensures system doesn't crash when no relevant entities exist
- **Input Values**: Empty entities array or entities without required component combinations

#### Path 1.2: Carried Item Entity Not Found
- **Condition**: Entity has `CarriedItem` component but the referenced item entity doesn't exist
- **Behavior**: Logs error and continues to next entity
- **Test Importance**: Handles data integrity issues gracefully without system failure
- **Input Values**: `CarriedItem.item` with invalid entity ID

#### Path 1.3: Carried Item Not Usable
- **Condition**: Carried item entity exists but lacks `UsableItem` component
- **Behavior**: Skips to next interacting entity
- **Test Importance**: Prevents interactions with non-functional items
- **Input Values**: Valid item entity without `UsableItem` component

#### Path 1.4: No Compatible Entities
- **Condition**: No entities match the item's capabilities with their requirements
- **Behavior**: No interaction occurs for this item
- **Test Importance**: Ensures items only work with appropriate targets
- **Input Values**: Item capabilities that don't match any entity requirements

#### Path 1.5: Position/Direction Validation Failure
- **Condition**: Compatible entities exist but position/direction requirements not met
- **Behavior**: Skips interaction for that specific target
- **Test Importance**: Enforces spatial interaction rules
- **Input Values**: Entities in wrong positions or facing wrong directions

#### Path 1.6: Successful Interaction
- **Condition**: All validation passes - compatible entity, correct position/direction
- **Behavior**: Processes interaction behavior and handles item consumption
- **Test Importance**: Core functionality - successful interactions must work correctly
- **Input Values**: Properly positioned entities with matching capabilities

### 2. Capability Matching (`findCompatibleEntities` method)

#### Path 2.1: No Matching Capabilities
- **Condition**: Item capabilities don't satisfy any entity's required capabilities
- **Behavior**: Returns empty array
- **Test Importance**: Prevents inappropriate item usage
- **Input Values**: Mismatched capability strings

#### Path 2.2: Partial Capability Match
- **Condition**: Item has some but not all required capabilities for an entity
- **Behavior**: Entity filtered out, not included in results
- **Test Importance**: Ensures complete capability satisfaction
- **Input Values**: Item with subset of required capabilities

#### Path 2.3: Complete Capability Match
- **Condition**: Item capabilities include all required capabilities for entity
- **Behavior**: Entity included in compatible entities list
- **Test Importance**: Core matching logic must work correctly
- **Input Values**: Item capabilities that fully satisfy entity requirements

### 3. Position and Direction Validation (`approachingFromCorrectPositionAndDirection` method)

#### Path 3.1: Wrong Position
- **Condition**: Interacting entity not in any permitted interaction position
- **Behavior**: Returns false, interaction blocked
- **Test Importance**: Enforces spatial interaction rules
- **Input Values**: Entity positions outside allowed interaction zones

#### Path 3.2: Correct Position, No Direction Component
- **Condition**: Entity in permitted position but has no `Direction` component
- **Behavior**: Returns true, allows interaction from any direction
- **Test Importance**: Handles entities without directional constraints
- **Input Values**: Positioned entities without `Direction` component

#### Path 3.3: Correct Position, Wrong Direction
- **Condition**: Entity in permitted position but facing wrong direction
- **Behavior**: Returns false, interaction blocked
- **Test Importance**: Enforces directional interaction requirements
- **Input Values**: Correctly positioned entity facing away from target

#### Path 3.4: Correct Position and Direction
- **Condition**: Entity in permitted position and facing target entity
- **Behavior**: Returns true, allows interaction
- **Test Importance**: Core positioning logic must work correctly
- **Input Values**: Properly positioned and oriented entities

### 4. Interaction Behavior Processing (`processInteraction` method)

#### Path 4.1: Missing InteractionBehavior Component
- **Condition**: Target entity lacks `InteractionBehavior` component
- **Behavior**: Throws error
- **Test Importance**: Prevents system state corruption
- **Input Values**: Entity without `InteractionBehavior` component

#### Path 4.2: TRANSFORM Behavior
- **Condition**: `behaviorType` is `InteractionBehaviorType.TRANSFORM`
- **Behavior**: Calls `processBehaviorTransform`
- **Test Importance**: Entity transformation must work correctly
- **Input Values**: `InteractionBehavior` component with TRANSFORM type

#### Path 4.3: REMOVE Behavior
- **Condition**: `behaviorType` is `InteractionBehaviorType.REMOVE`
- **Behavior**: Calls `processBehaviorRemove`
- **Test Importance**: Entity removal must work correctly
- **Input Values**: `InteractionBehavior` component with REMOVE type

#### Path 4.4: SPAWN_CONTENTS Behavior
- **Condition**: `behaviorType` is `InteractionBehaviorType.SPAWN_CONTENTS`
- **Behavior**: Calls `processBehaviorSpawnContents`
- **Test Importance**: Content spawning must work correctly
- **Input Values**: `InteractionBehavior` component with SPAWN_CONTENTS type

#### Path 4.5: Unknown Behavior Type
- **Condition**: `behaviorType` not recognized
- **Behavior**: Throws error with behavior type info
- **Test Importance**: Handles invalid configuration gracefully
- **Input Values**: Invalid or undefined behavior type

### 5. Transform Behavior (`processBehaviorTransform` method)

#### Path 5.1: Missing newSpriteId
- **Condition**: `InteractionBehavior` component lacks `newSpriteId`
- **Behavior**: Throws error
- **Test Importance**: Prevents incomplete transformations
- **Input Values**: TRANSFORM behavior without `newSpriteId`

#### Path 5.2: Successful Transform
- **Condition**: All required data present for transformation
- **Behavior**: Creates new entity, updates sprite, removes interaction components, replaces original
- **Test Importance**: Core transformation logic must work correctly
- **Input Values**: Complete TRANSFORM behavior configuration

### 6. Spawn Contents Behavior (`processBehaviorSpawnContents` method)

#### Path 6.1: Missing SpawnContents Component
- **Condition**: Target entity lacks `SpawnContents` component
- **Behavior**: Throws error
- **Test Importance**: Prevents spawning without proper configuration
- **Input Values**: Entity without `SpawnContents` component

#### Path 6.2: Missing Position Component
- **Condition**: Target entity lacks `Position` component
- **Behavior**: Throws error
- **Test Importance**: Prevents spawning without location reference
- **Input Values**: Entity without `Position` component

#### Path 6.3: Successful Content Spawn (No Offset)
- **Condition**: All components present, no spawn offset specified
- **Behavior**: Spawns entities at target position, removes original entity
- **Test Importance**: Default spawning behavior must work correctly
- **Input Values**: Complete spawn configuration without offset

#### Path 6.4: Successful Content Spawn (With Offset)
- **Condition**: All components present, spawn offset specified
- **Behavior**: Spawns entities at offset position, removes original entity
- **Test Importance**: Offset spawning must calculate positions correctly
- **Input Values**: Complete spawn configuration with offset values

### 7. Item Consumption (`handleItemConsumption` method)

#### Path 7.1: Non-Consumable Item
- **Condition**: `UsableItem.isConsumable` is false
- **Behavior**: No consumption occurs, item remains
- **Test Importance**: Reusable items must persist after use
- **Input Values**: `UsableItem` with `isConsumable: false`

#### Path 7.2: Consumable Item, Invalid State
- **Condition**: Item is consumable but `CarriedItem` component missing or ID mismatch
- **Behavior**: Logs error, no consumption occurs
- **Test Importance**: Handles data inconsistency gracefully
- **Input Values**: Mismatched or missing carried item data

#### Path 7.3: Successful Consumption
- **Condition**: Item is consumable and all data consistent
- **Behavior**: Removes `CarriedItem` component and item entity
- **Test Importance**: Core consumption logic must work correctly
- **Input Values**: Consumable item with matching carried item data

## Edge Cases and Error Conditions

### Data Integrity Issues
- Invalid entity references in components
- Missing required components on entities
- Mismatched component data

### Spatial Validation Edge Cases
- Entities at map boundaries
- Multiple entities in same position
- Diagonal vs cardinal direction positioning

### Behavior Configuration Edge Cases
- Empty or null capability arrays
- Invalid sprite IDs for transformations
- Empty spawn contents arrays
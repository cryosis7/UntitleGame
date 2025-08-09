# Item Interaction System

## Feature Overview

The Item Interaction System enables players to use items they are carrying to interact with objects in the game world.
This system powers key gameplay mechanics like unlocking doors with keys, opening chests with tools, and consuming items
to transform or activate environmental objects. The system provides a flexible capability-based matching mechanism that
allows for complex item-object relationships while maintaining clear rules for player behavior and object responses.

At its core, the system creates meaningful gameplay loops where players must collect the right items to progress through
environmental puzzles, unlock new areas, and discover hidden content. The system supports both immediate interactions
(like using a key on a door) and strategic resource management (like deciding whether to use consumable items).

## Key Concepts

### Item Capabilities

Items in the game world are defined by their capabilities - specific actions they can perform when used by players.
These capabilities serve as the foundation for all item-object interactions.

- **Capability Matching**: Items possess specific capabilities (like "unlock", "cut", "activate", "break", "restore") that determine what they can interact with
- **Multi-Capability Items**: A single item can have multiple capabilities, making it useful for various interactions (e.g., a master key with both "unlock" and "activate" capabilities)
- **Capability Requirements**: Interactive objects define which capabilities they need from items to be activated
- **Complete Matching**: ALL required capabilities must be present on a single carried item for the interaction to succeed
- **Capability Validation**: The system performs exact string matching on capability names, ensuring precise control over item-object compatibility

### Interaction Requirements

Interactive objects in the game world have specific requirements that must be met before players can successfully
interact with them. These requirements ensure logical and intuitive gameplay interactions.

- **Item Dependencies**: Objects require specific item capabilities to be interacted with (e.g., doors need "unlock", obstacles need "cut")
- **Directional Constraints**: Interactions can be restricted to specific approach directions (up, down, left, right) - objects can specify which sides they can be approached from
- **Positional Validation**: Players must be positioned adjacent to objects (not diagonally) from an allowed direction to interact
- **Facing Requirements**: If the player has directional facing, they must face toward the target object to interact
- **Flexible Positioning**: Players without directional facing can interact from any valid adjacent position, providing more fluid gameplay for non-directional entities

### Item Consumption

The system provides flexible item consumption mechanics that allow for both one-time-use items and permanent tools,
creating opportunities for different gameplay strategies and resource management decisions.

- **Consumable Items**: Items are consumed (destroyed) after use by default, making them valuable single-use resources
- **Reusable Items**: Items can be configured as reusable (isConsumable: false) to be preserved after interaction, creating permanent tools
- **Automatic Management**: The system automatically removes consumed items from the player's carried item slot and cleans up their entities
- **Strategic Considerations**: Players must decide when to use consumable items versus preserving them for more critical situations

### Interaction Behaviors

When a successful interaction occurs, the target object responds according to its configured behavior. These behaviors
determine how the game world changes in response to player actions, creating visible consequences for interactions.

- **Transform**: Objects change their sprite and become non-interactive while remaining in the world (e.g., doors opening, switches activating)
- **Remove**: Objects are completely removed from the game world (e.g., obstacles being destroyed, barriers being cleared)
- **Spawn Contents**: Objects are replaced with new entities created from predefined templates (e.g., chests opening to reveal items, containers breaking open)

Each behavior serves different gameplay purposes: Transform provides permanent environmental changes, Remove clears
obstacles and creates new paths, and Spawn Contents enables discovery and rewards systems.

## How To Implement It

### Creating Interactive Objects

To create objects that require items to interact with, engineers need to add specific components to entities:

**Basic Interactive Object**:
- Add a `RequiresItemComponent` with the required capabilities (e.g., `['unlock']`)
- Add an `InteractionBehaviorComponent` specifying the behavior type (TRANSFORM, REMOVE, or SPAWN_CONTENTS)
- Optionally specify allowed interaction directions (defaults to all four directions)

**Items That Can Be Used**:
- Add a `UsableItemComponent` with the item's capabilities (e.g., `['unlock', 'activate']`)
- Set `isConsumable` to control whether the item is destroyed after use (defaults to true)

**Advanced Configurations**:
- For TRANSFORM behavior: specify `newSpriteId` to change the object's appearance
- For SPAWN_CONTENTS behavior: add a `SpawnContentsComponent` with entity templates and optional spawn offset
- Use `interactionDirections` to restrict which sides players can approach from

### Level Design Considerations

Engineers should consider these factors when placing interactive objects and items:

- **Capability Matching**: Ensure items with required capabilities are available to players before they encounter objects that need them
- **Spatial Design**: Position objects considering their interaction direction restrictions - doors might only open from the front
- **Item Placement**: Balance consumable vs. reusable items based on the puzzle complexity and player progression
- **Content Spawning**: For containers, define meaningful rewards that match the effort required to obtain the necessary items

## How It Works

### Basic Interaction Flow

1. Player approaches an interactive object while carrying a compatible item
2. Player presses the interaction key (triggering the Interacting component)
3. System identifies entities that are interacting and carrying items
4. System finds all nearby interactive objects that require items
5. System matches carried item capabilities against object requirements
6. System validates positional and directional requirements
7. If all conditions are met, the interaction behavior is executed
8. The item is consumed if marked as consumable
9. The Interacting component is removed from the player

### Capability Matching Process

The system compares the capabilities of the currently carried item against the requirements of nearby objects:

- **Complete Match Required**: ALL required capabilities must be present on the single carried item
- **String-Based Matching**: Capabilities are matched as exact string comparisons (case-sensitive)
- **Multiple Objects**: If multiple compatible objects are in range, ALL valid interactions are processed simultaneously in the same update cycle
- **Single Item Limitation**: Only the currently carried item is considered (players can only carry one item at a time)
- **Superset Matching**: Items with more capabilities than required will successfully match (e.g., a master key with "unlock" and "activate" can open a door that only needs "unlock")

### Positional Requirements

- **Adjacent Positioning**: Player must be positioned adjacent to the target object
- **Allowed Directions**: Objects specify which directions they can be approached from (up, down, left, right)
- **Directional Facing**: If the player has a Direction component, they must face toward the target object
- **Flexible Facing**: Players without directional facing can interact from any allowed adjacent position

### Behavior Execution

#### Transform Behavior

- Object's sprite is changed to the specified new sprite
- RequiresItem and InteractionBehavior components are removed, making the object non-interactive
- Object remains in the game world at the same position
- All other components (like Position) are preserved
- Commonly used for doors that open or switches that activate

#### Remove Behavior

- Object is completely removed from the game world
- All components and references are cleaned up
- Used for destructible barriers or temporary obstacles
- Creates clear paths or reveals hidden areas

#### Spawn Contents Behavior

- Original object is completely removed from the game world
- New entities are created from predefined entity templates
- Contents are positioned at the original object's location with optional offset
- Multiple spawned entities are arranged in a grid pattern (2 columns): first item at base position, second item at base+1 Y, third item at base+1 X, fourth item at base+1 X and base+1 Y
- Supports empty contents arrays for objects that simply disappear without spawning anything
- Commonly used for chests, containers, and breakable objects with rewards
- All spawned entities retain their original components from templates while receiving new position components

### System Robustness

The Item Interaction System includes several safety mechanisms to handle edge cases and maintain game stability:

**Error Handling**:
- Invalid item references are logged as errors and processing continues with other entities
- Missing components are handled gracefully without crashing the system
- Objects with missing required components for their behavior type are validated at creation time

**Data Validation**:
- TRANSFORM behavior requires a `newSpriteId` to be specified
- SPAWN_CONTENTS behavior validates that entity templates are properly formatted
- Empty spawn contents arrays are supported and handled correctly

**State Management**:
- Entities are properly cleaned up when removed or transformed
- Component references are safely updated after successful interactions
- The system maintains consistency even when multiple interactions occur simultaneously

## Usage Examples

### Key and Door Mechanics

**Scenario**: Player has a key and approaches a locked door

1. Door requires "unlock" capability and allows interaction from specific directions
2. Key provides "unlock" capability and is consumable (isConsumable: true)
3. Player stands adjacent to door in an allowed direction while carrying the key
4. Player activates interaction (adds Interacting component)
5. System processes interaction: door transforms to "open" sprite and removes interaction components
6. Key is consumed and removed from the carried item slot
7. Door becomes non-interactive and remains in the world as an open door

### Chest Opening

**Scenario**: Player uses a lockpick on a treasure chest

1. Chest requires "unlock" capability and allows interaction from all directions (up, down, left, right)
2. Lockpick provides "unlock" capability and is reusable (isConsumable: false)
3. Player approaches chest from any adjacent position while carrying lockpick
4. System processes interaction: chest is removed and spawns its contents from entity templates
5. Lockpick remains in the carried item slot for future use
6. Spawned items are arranged in a grid pattern at the chest's former location

### Tool-Based Destruction

**Scenario**: Player uses an axe to clear a fallen tree

1. Fallen tree blocks a path and requires "cut" capability
2. Axe provides "cut" capability and is reusable (isConsumable: false)
3. Player positions adjacent to tree while carrying the axe
4. If player has directional facing, they must face toward the tree
5. System processes interaction: tree is completely removed from the game world
6. Axe remains in the carried item slot for other cutting tasks
7. Path is now clear for movement

### Multi-Capability Interactions

**Scenario**: Player has a magic orb that can both unlock and activate

1. Magic orb provides both "unlock" and "activate" capabilities in a single item
2. Can be used on doors (requiring "unlock") or magical altars (requiring "activate")
3. Player can interact with either type of object using the same carried item
4. All required capabilities must be present on the single carried item
5. Demonstrates how single items can satisfy multiple capability requirements

### Container Discovery

**Scenario**: Player breaks open a supply crate

1. Crate requires "break" capability and restricts interaction to specific directions
2. Hammer provides "break" capability and is reusable (isConsumable: false)
3. Player positions adjacent to crate from an allowed direction while carrying hammer
4. System processes interaction: crate is removed and spawns medical supplies from templates
5. Spawned items are positioned at the crate's location with potential offset
6. Hammer remains available for breaking other containers

### Consumable Item Usage

**Scenario**: Player uses a growth potion on a withered plant

1. Withered plant requires "restore" capability
2. Growth potion provides "restore" capability and is consumable (isConsumable: true)
3. Player approaches plant from an adjacent position while carrying potion
4. System processes interaction: plant transforms to healthy sprite and loses interaction components
5. Potion is consumed and removed from the carried item slot
6. Plant becomes decorative (no longer interactive) but remains in the world

### Complex Multi-Step Interactions

**Scenario**: Player encounters multiple compatible objects simultaneously

1. Player carries a master key with capabilities ["unlock", "activate"]
2. Player stands adjacent to both a locked door (requires "unlock") and a magical seal (requires "activate")
3. When interaction is triggered, the system processes ALL compatible interactions
4. Both the door transforms and the seal transforms in the same action
5. The master key is consumed (if consumable) after all interactions complete
6. Demonstrates how the system handles multiple simultaneous valid interactions

### Partial Capability Matching Failure

**Scenario**: Player attempts to use an item that doesn't have all required capabilities

1. Player has a simple key that only provides "unlock" capability
2. Player approaches a complex lock that requires both "unlock" and "decrypt" capabilities
3. Player activates interaction while adjacent to the lock
4. System checks item capabilities against requirements and finds "decrypt" is missing
5. Interaction fails and no changes occur to either the lock or the key
6. Player must find an additional item with "decrypt" capability or a different item that has both required capabilities
7. Demonstrates the system's strict requirement for complete capability matching

### Error Recovery and Robustness

**Scenario**: System handles missing or invalid data gracefully

1. Player is carrying an item but the item entity has been accidentally removed from the game
2. Player attempts to interact with a compatible object
3. System detects the missing item reference and logs an error message
4. Processing continues with other valid entities, preventing system crashes
5. Player's interaction state is preserved, allowing them to try again with a valid item
6. Demonstrates how the system maintains stability even when data inconsistencies occur

The Item Interaction System creates rich gameplay possibilities by combining item management with environmental
puzzle-solving, enabling complex interactions through simple capability-based matching while maintaining clear rules for
player behavior and object responses. The system's robust error handling and flexible configuration options make it
suitable for a wide variety of game mechanics, from simple key-and-lock puzzles to complex multi-step environmental
interactions.
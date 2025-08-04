# Item Interaction System

## Feature Overview

The Item Interaction System enables players to use items in their inventory to interact with objects in the game world. This system powers key gameplay mechanics like unlocking doors with keys, opening chests with tools, and consuming items to transform or activate environmental objects. The system matches item capabilities with object requirements to determine valid interactions and handles the consequences of those interactions.

## Key Concepts

### Item Capabilities
- **Capability Matching**: Items possess specific capabilities (like "unlock", "cut", "activate") that determine what they can interact with
- **Multi-Capability Items**: A single item can have multiple capabilities, making it useful for various interactions
- **Capability Requirements**: Interactive objects define which capabilities they need from items to be activated

### Interaction Requirements
- **Item Dependencies**: Objects require specific item capabilities to be interacted with
- **Directional Constraints**: Interactions can be restricted to specific approach directions (north, south, east, west)
- **Positional Validation**: Players must be adjacent to objects and facing the correct direction to interact

### Item Consumption
- **Consumable Items**: Items can be configured to be consumed (destroyed) after use
- **Reusable Items**: Items can be preserved after interaction for repeated use
- **Inventory Management**: The system automatically removes consumed items from the player's inventory

### Interaction Behaviors
- **Transform**: Objects change their appearance and properties after interaction
- **Remove**: Objects are completely removed from the game world
- **Spawn Contents**: Objects are replaced with new items or entities at their location

## How It Works

### Basic Interaction Flow
1. Player approaches an interactive object while carrying a compatible item
2. System checks if the carried item has the required capabilities
3. System validates the player's position and facing direction
4. If all conditions are met, the interaction is processed
5. The object's behavior is executed (transform, remove, or spawn contents)
6. The item is consumed if configured as consumable

### Capability Matching Process
The system compares the capabilities of carried items against the requirements of nearby objects:
- **Full Match Required**: All required capabilities must be present on the carried item
- **Capability Inheritance**: Items with multiple capabilities can satisfy complex requirements
- **Priority System**: If multiple compatible objects are nearby, all valid interactions are processed

### Positional Requirements
- **Adjacent Positioning**: Player must be directly adjacent to the target object
- **Direction Validation**: If specified, player must face the object from an allowed direction
- **Flexible Interactions**: Objects can allow interaction from multiple directions or any direction

### Behavior Execution

#### Transform Behavior
- Object changes to a new visual state (sprite change)
- Interaction components are removed, making the object non-interactive
- Object remains in the game world with new properties
- Commonly used for doors that open or switches that activate

#### Remove Behavior
- Object is completely removed from the game world
- Used for destructible barriers or temporary obstacles
- Creates clear paths or reveals hidden areas

#### Spawn Contents Behavior
- Original object is removed from the game world
- New entities are created at the object's location
- Contents can include items, enemies, or environmental objects
- Commonly used for chests, containers, and breakable objects

## Usage Examples

### Key and Door Mechanics
**Scenario**: Player has a key and approaches a locked door
1. Door requires "unlock" capability from an adjacent position
2. Key provides "unlock" capability and is consumable
3. Player stands next to door while carrying the key
4. System processes interaction: door transforms to "open" sprite
5. Key is consumed and removed from inventory
6. Door becomes non-interactive (no longer requires items)

### Chest Opening
**Scenario**: Player uses a lockpick on a treasure chest
1. Chest requires "unlock" capability and allows interaction from any direction
2. Lockpick provides "unlock" capability but is reusable
3. Player approaches chest from any side while carrying lockpick
4. System processes interaction: chest spawns its contents (coins, potions, etc.)
5. Lockpick remains in inventory for future use
6. Original chest is removed and replaced with spawned items

### Tool-Based Destruction
**Scenario**: Player uses an axe to clear a fallen tree
1. Fallen tree blocks a path and requires "cut" capability
2. Axe provides "cut" capability and is reusable
3. Player faces the tree while carrying the axe
4. System processes interaction: tree is completely removed
5. Axe remains in inventory for other cutting tasks
6. Path is now clear for movement

### Multi-Capability Interactions
**Scenario**: Player has a magic orb that can both unlock and activate
1. Magic orb provides both "unlock" and "activate" capabilities
2. Can be used on doors (requiring "unlock") or magical altars (requiring "activate")
3. Player can interact with either type of object using the same item
4. Demonstrates how single items can enable multiple interaction types

### Container Discovery
**Scenario**: Player breaks open a supply crate
1. Crate requires "break" capability and allows interaction from front only
2. Hammer provides "break" capability and is reusable
3. Player faces crate from the front while carrying hammer
4. System processes interaction: crate spawns medical supplies and rations
5. Crate is removed and replaced with useful items
6. Hammer remains available for breaking other containers

### Consumable Item Usage
**Scenario**: Player uses a potion on a withered plant
1. Withered plant requires "restore" capability
2. Growth potion provides "restore" capability and is consumable
3. Player approaches plant while carrying potion
4. System processes interaction: plant transforms to healthy state
5. Potion is consumed and removed from inventory
6. Plant becomes decorative (no longer interactive)

The Item Interaction System creates rich gameplay possibilities by combining item management with environmental puzzle-solving, enabling complex interactions through simple capability-based matching while maintaining clear rules for player behavior and object responses.
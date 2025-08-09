# Entity System Overview

## Feature Overview

The Entity System is the foundational architecture that powers all game objects and their behaviors in this React TypeScript ECS game. It provides a flexible, modular way to create and manage game entities - from the player character and items to interactive objects like doors and chests. The system enables developers to build complex gameplay mechanics by combining simple, reusable building blocks called components.

## Key Concepts

### Entities
Entities are the core game objects that represent everything visible and interactive in the game world. Think of entities as containers that hold various properties and behaviors. Every game object - whether it's the player, a key, a door, or a treasure chest - is an entity.

### Components  
Components are the building blocks that define what an entity can do and what properties it has. Each component represents a specific aspect or capability:
- **Position**: Where the entity is located in the game world
- **Sprite**: What the entity looks like visually
- **Pickable**: Whether players can collect the entity
- **Movable**: Whether the entity can be pushed or moved
- **Player**: Marks an entity as the player character

### Templates
Templates are pre-configured blueprints that define standard entity types. Instead of manually creating each entity, developers use templates to quickly spawn common objects like keys, doors, or chests with their appropriate components already configured.

## How It Works

### Entity Creation Process
When creating game objects, the system follows a template-based approach:

1. **Template Definition**: Developers define what components an entity should have
2. **Entity Generation**: The system creates a unique entity with those components
3. **World Integration**: The entity is added to the game world and becomes interactive

### Component Management
The system provides tools to dynamically modify entities during gameplay:
- **Adding Components**: Give entities new capabilities (like making an item pickable)
- **Removing Components**: Take away capabilities (like making a door non-interactive after use)
- **Querying Components**: Find entities with specific capabilities (like all pickable items)

### Entity Interaction
Entities interact with each other through their components. For example:
- A player entity can pick up entities with the Pickable component
- Items with unlock capabilities can interact with doors that require unlocking
- Chests can spawn new entities when opened

## Usage Examples

### Basic Game Objects

**Player Character**
The player entity combines movement, visual representation, and input handling:
- Position component for location tracking
- Sprite component for visual appearance  
- Velocity component for movement
- Direction component for facing orientation

**Collectible Items**
Simple items that players can pick up:
- Sprite component for appearance
- Pickable component to enable collection
- Position component for world placement

**Interactive Objects**
Complex entities like doors or chests that respond to player actions:
- Sprite component for current appearance
- Requirement components that specify what's needed to interact
- Behavior components that define what happens during interaction

### Dynamic Entity Modification

**Item Collection**
When a player picks up an item, the system:
- Removes the item's Position component (taking it off the map)
- Adds a CarriedItem component (putting it in inventory)
- Maintains the item's other properties for later use

**State Changes**
Entities can transform based on interactions:
- A closed door can become an open door by changing its sprite
- A locked chest can become unlocked by modifying its requirements
- Temporary entities can be created for effects and animations

### Template-Based Creation

**Standard Entity Types**
The system includes pre-built templates for common objects:
- **Keys**: Items that can unlock doors and chests
- **Doors**: Barriers that require specific items to open
- **Chests**: Containers that spawn items when opened
- **Boulders**: Movable obstacles that block pathways

**Custom Entity Types**  
Developers can create new templates by combining existing components in novel ways:
- A magical key that never gets consumed
- A door that requires multiple different keys
- A chest that transforms into a different object when opened

### Entity Queries and Management

**Finding Entities**
The system provides tools to locate entities based on their properties:
- Find all entities at a specific map location
- Get all entities that can be picked up
- Locate entities with specific capabilities or requirements

**World State Management**
Entities can be dynamically added, removed, and modified:
- Spawn new entities during gameplay (like treasure from chests)
- Remove entities when they're no longer needed
- Update entity properties in response to game events

## Value to Game Experience

### Flexibility and Modularity
The component-based approach allows for:
- **Easy Experimentation**: Try new combinations of components to create unique behaviors
- **Rapid Prototyping**: Quickly build new entity types without complex coding
- **Maintainable Code**: Changes to one component don't affect others

### Rich Interactions
The system enables complex gameplay mechanics:
- **Context-Sensitive Actions**: Different items work with different objects
- **Progressive Gameplay**: Entities can change behavior based on game state
- **Emergent Complexity**: Simple components combine to create sophisticated interactions

### Developer Experience
The template system provides:
- **Consistent Patterns**: All entities follow the same creation and management approach
- **Reusable Assets**: Templates can be shared and modified across different game areas
- **Clear Organization**: Components group related functionality logically

The Entity System serves as the foundation that makes the game world feel alive and interactive, providing the building blocks for all the engaging gameplay mechanics players experience.
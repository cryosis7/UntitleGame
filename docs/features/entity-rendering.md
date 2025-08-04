# Game Entity Rendering System

## Feature Overview

The Game Entity Rendering System is responsible for visually displaying all game entities on screen. This system transforms data representations of game objects (entities with Position and Sprite components) into visual sprites that players can see and interact with. The system handles sprite creation, positioning, lifecycle management, and ensures optimal performance by only rendering entities that have the necessary visual components.

## Key Concepts

### Entity Visual Requirements
- **Sprite Component**: Defines what image/texture an entity should display
- **Position Component**: Defines where on the game grid the entity should appear
- **Render Eligibility**: Only entities with both Sprite and Position components are rendered

### Grid-Based Positioning
- All entities are positioned on a grid system with configurable tile sizes
- Grid coordinates are automatically converted to screen pixel coordinates
- Consistent spacing and alignment across all rendered entities

### Sprite Management
- Sprites are created from texture assets using specified sprite names
- Each entity gets a unique visual representation that persists until the entity is removed
- Automatic cleanup of sprites when entities are destroyed or lose rendering components

### Render Sections
- The system supports multiple render sections (game world, sidebar, etc.)
- Game entities are filtered to exclude items meant for UI display
- Clean separation between gameplay visuals and interface elements

## How It Works

### Rendering Pipeline

#### 1. Entity Filtering
The system first identifies which entities should be rendered in the game world:
- Filters out entities marked for sidebar rendering 
- Only processes entities that exist in the current game state
- Maintains separation between game world and UI elements

#### 2. Sprite Lifecycle Management
For each eligible entity, the system:
- **Creates New Sprites**: When an entity gains both Position and Sprite components
- **Maintains Existing Sprites**: Preserves sprites for entities that continue to meet rendering requirements
- **Removes Obsolete Sprites**: Cleans up sprites when entities lose required components or are destroyed

#### 3. Position Updates
Every render cycle, the system:
- Reads the current Position component of each rendered entity
- Converts grid coordinates to screen pixel coordinates using the tile size
- Updates the visual sprite position to match the entity's logical position

#### 4. Visual Creation Process
When creating a new sprite:
- Retrieves the texture asset based on the sprite name from the Sprite component
- Creates a new Pixi.js Sprite object with the correct texture
- Resizes the sprite to match the current tile size
- Adds the sprite to the appropriate render container

### Coordinate System
- **Grid Coordinates**: Logical game positions (e.g., x: 5, y: 3)
- **Screen Coordinates**: Visual pixel positions calculated from grid coordinates
- **Conversion Formula**: `screenPosition = gridPosition × tileSize`
- **Tile Size**: Configurable size that determines how large each grid cell appears on screen

### Performance Optimization
- **Efficient Tracking**: Maintains a registry of which entities currently have rendered sprites
- **Minimal Operations**: Only creates/destroys sprites when entity states actually change
- **Batch Updates**: Processes all position updates together for optimal performance
- **Memory Management**: Automatically removes unused sprites to prevent memory leaks

## Usage Examples

### Basic Entity Rendering
When a new game entity is created with the required components:
```
Entity: Player
- Position Component: { x: 10, y: 5 }
- Sprite Component: { spriteName: "player" }
```
The system automatically:
1. Detects the entity has both required components
2. Creates a sprite using the "player" texture
3. Positions it at screen coordinates (10 × tileSize, 5 × tileSize)
4. Adds it to the game world display

### Dynamic Position Updates
As entities move through the game world:
1. The MovementSystem updates the entity's Position component
2. The Rendering System detects the position change
3. The visual sprite is immediately moved to the new screen location
4. The player sees smooth, real-time movement of the game object

### Entity Removal and Cleanup
When an entity is destroyed or loses its visual components:
1. The system detects the entity no longer meets rendering requirements
2. Removes the associated sprite from the screen display
3. Cleans up memory resources to prevent accumulation
4. The visual representation disappears from the player's view

### Multi-Entity Scenes
In complex game scenes with many entities:
- Each entity (players, items, obstacles, decorations) gets its own sprite
- All sprites are positioned accurately according to their grid coordinates
- The system maintains consistent visual scale and alignment
- Performance remains optimal regardless of entity count

### Sprite Asset Management
The system works with predefined sprite assets:
- **Character Sprites**: Player, enemies, NPCs with unique visual designs
- **Item Sprites**: Keys, potions, tools with recognizable icons
- **Environment Sprites**: Trees, rocks, walls, decorative elements
- **Interactive Objects**: Doors, chests, switches with appropriate visual states

## Integration with Game Systems

### Entity Component System (ECS) Integration
- Works seamlessly with other game systems through shared entity data
- Responds automatically to component changes made by other systems
- Maintains visual consistency with logical game state

### Level Editor Support
- Renders entities placed through the level editor in real-time
- Provides immediate visual feedback for level construction
- Supports rapid iteration and level design workflows

### State Management
- Integrates with the game's state management system for configuration
- Respects global settings like tile size and render preferences
- Maintains consistency across different game modes and screens

The Game Entity Rendering System provides the essential visual foundation that transforms abstract game data into the rich, interactive visual experience that players see and engage with during gameplay.
# Level Editor System

## Feature Overview

The Level Editor System provides an interactive tool for placing and removing game entities within the game world. This system enables real-time level construction by allowing users to click on the game canvas to add objects, create entity paths using line drawing, and toggle entity presence at specific locations.

## Key Concepts

### Entity Placement
- **Single Click Placement**: Click anywhere on the game canvas to place the currently selected entity type at that grid position
- **Line Drawing**: Hold Shift while clicking to draw continuous lines of entities between two points
- **Toggle Mode**: Clicking on an existing entity of the same type will remove it instead of placing a duplicate

### Grid-Based Positioning
- All entity placement is automatically snapped to the game's grid system
- Screen coordinates are converted to grid positions for precise placement
- Each grid cell can contain multiple different entity types but only one of each specific type

### Entity Selection
- The system maintains a currently selected entity type for placement
- Default selection is set to 'yellow-tree-tall-bottom'
- The selected entity type determines what gets placed when clicking

## How It Works

### Basic Placement
1. Click anywhere on the game canvas
2. The selected entity type is placed at the clicked grid position
3. If an entity of the same type already exists at that position, it is removed instead

### Line Drawing Mode
1. Click at a starting position to place the first entity
2. Hold Shift and click at a different position
3. A continuous line of entities is drawn between the two points using Bresenham's line algorithm
4. Existing entities of the same type along the path are preserved (not duplicated)
5. The end position becomes the new starting point for additional line segments

### Entity Management
- **Duplicate Prevention**: The system automatically prevents placing duplicate entity types at the same grid position
- **Smart Removal**: Single clicks on existing entities remove them, while Shift+click operations preserve existing entities along the path
- **Batch Operations**: Multiple entities can be placed or removed in a single operation for optimal performance

## Available Entities

The level editor can place any entity type that has been defined in the game's entity template system. Common entity types include:

### Interactive Objects
- **Player**: The main character entity with movement and direction capabilities
- **Key**: Collectible item that can unlock doors and chests
- **Door**: Barrier that requires a key to open, transforms when unlocked
- **Chest**: Container that requires a key to open and spawns items when unlocked

### Movable Objects
- **Boulder**: Pushable obstacle that can be moved by the player

### Collectible Items
- **Beaker**: Collectible potion bottles (blue and red variants available)

### Environmental Elements
- **Trees**: Various tree sprites for level decoration and obstacles
- **Terrain Elements**: Ground tiles, walls, and other environmental features

## Usage Examples

### Creating a Simple Room
1. Select wall entities and click around the perimeter to create room boundaries
2. Switch to floor tile entities and fill the interior space
3. Add interactive elements like doors, chests, or keys as needed

### Drawing Paths and Walls
1. Click at the starting position of your wall or path
2. Hold Shift and click at the end position to create a straight line
3. Continue holding Shift and clicking to extend the path in new directions
4. Release Shift to start a new separate path

### Placing Interactive Puzzles
1. Place a chest that requires a key to open
2. Place the corresponding key elsewhere in the level
3. Add environmental obstacles and decorations to create engaging puzzle layouts
4. Test the interaction by switching to play mode

### Editing Existing Areas
1. Click on any existing entity to remove it
2. Place new entities in the cleared spaces
3. Use line drawing to quickly replace sections of walls or paths
4. Toggle between different entity types to build complex level layouts

The Level Editor System provides a powerful and intuitive way to construct game levels in real-time, enabling rapid prototyping and iterative level design without requiring external tools or level file editing.
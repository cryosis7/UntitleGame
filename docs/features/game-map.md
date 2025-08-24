# Game Map System

The `GameMap` class in `src/game/map/GameMap.ts` is a core component that manages the game's tile-based map system within the ECS architecture.

## Class Overview

The `GameMap` class handles:

- **2D tile grid management** using Entity arrays
- **Map initialization** from configuration
- **Position validation** and tile access
- **Walkability checks** for movement systems

## Key Properties

- `tiles: Entity[][]` - 2D array storing map tile entities (TODO: convert to single array)
- `id: string` - Unique map identifier using crypto.randomUUID()
- `hasChanged: boolean` - Tracks if map needs re-rendering

## Core Methods

- `init()` - Generates map from `mapConfigAtom` configuration (src/game/map/GameMap.ts:24)
- `getAllEntities()` - Returns flattened array of all tile entities
- `getTile({x, y})` - Retrieves entity at specific position
- `isPositionInMap({x, y})` - Validates coordinates within bounds
- `isTileWalkable({x, y})` - Checks if tile has Scenery component
- `isValidPosition({x, y})` - Combines bounds and walkability checks

## Usage in the Codebase

**Initialization**: Map is created in `Atoms.ts:250` and initialized in `Game.tsx:31` via `map.init()`

**Game Loop**: Passed to all systems via `GameSystem.ts:117-121` in the main game loop

**Systems Integration**: Used by movement, rendering, and level editor systems through the `UpdateArgs` interface

**Position Utilities**: `ecsUtils.ts:24` uses map for finding empty positions for entity placement

## Map Generation

The `init()` method creates a procedural map where:

- Each tile is an Entity with Position, Sprite, and Render components
- All tiles are currently dirt tiles (isDirtTile = true)
- Dirt tiles include a Scenery component for movement
- Tiles are rendered in the 'map' section

The class serves as the foundational spatial system that other ECS systems rely on for position validation, collision detection, and rendering.

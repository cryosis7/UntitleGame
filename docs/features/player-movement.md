# Player Movement System

## Feature Overview

The Player Movement System provides responsive character control in the game world, allowing players to navigate through levels using keyboard input. This system handles movement input, character facing direction, and collision interactions with the environment and movable objects like boulders. The movement operates on a grid-based system where each keypress moves the player one tile in the corresponding direction.

## Key Concepts

### Grid-Based Movement

- **Discrete Movement**: Players move exactly one grid tile per keypress, not continuously
- **Instant Movement**: Character position updates immediately when movement keys are pressed
- **Grid Alignment**: All movement is automatically aligned to the game's grid system

### Directional Facing

- **Dynamic Direction**: Character automatically faces the direction of movement
- **Priority System**: When moving diagonally, horizontal movement takes priority over vertical for determining facing direction
- **Persistent Facing**: Character retains their last facing direction when stationary

### Collision System

- **Boundary Collision**: Movement is blocked by map boundaries and invalid positions
- **Object Interaction**: Different collision behaviors based on object type:
  - **Solid Objects**: Block movement entirely
  - **Movable Objects**: Can be pushed if space allows
  - **Pickable Objects**: Can be walked over without obstruction

### Object Pushing

- **Boulder Mechanics**: Movable objects like boulders can be pushed by walking into them
- **Chain Reaction Prevention**: Boulders cannot push other boulders or solid objects
- **Space Validation**: Boulders can only be pushed into empty, valid grid positions

## How It Works

### Basic Movement

1. Player presses an arrow key (Up, Down, Left, Right)
2. System checks if the target position is valid and unobstructed
3. If valid, player moves to the new position
4. Character automatically faces the direction of movement
5. Movement input is reset, requiring a new keypress for continued movement

### Direction Updates

- **Horizontal Priority**: When moving diagonally, character faces left or right rather than up or down
- **Movement-Based**: Direction only updates when the character is actually moving
- **Visual Feedback**: Character sprite orientation reflects the current facing direction

### Collision Handling

#### Wall and Boundary Collisions

- Movement is completely blocked by map edges and solid walls
- No movement occurs and character remains in current position
- No feedback or animation for blocked movement attempts

#### Movable Object Interactions

1. Player attempts to move into a space occupied by a movable object (like a boulder)
2. System checks if the space beyond the object is available
3. If available, both player and object move simultaneously
4. If blocked, neither player nor object moves

#### Pickable Object Interactions

- Player can move freely over items that can be picked up
- These objects don't obstruct movement but remain available for collection
- Multiple pickable objects can occupy the same space as the player

### Multi-Object Collisions

- When multiple objects occupy the target position, movement is only blocked if at least one object is non-movable and non-pickable
- All movable objects in the target space are pushed together if movement is allowed
- System prevents chain reactions where pushed objects would collide with other entities

## Controls

### Movement Controls

- **Arrow Up**: Move one tile up
- **Arrow Down**: Move one tile down
- **Arrow Left**: Move one tile left
- **Arrow Right**: Move one tile right

### Additional Controls

- **E Key**: Interact with objects (doors, chests, etc.)
- **Spacebar**: Pick up items in the current position

### Input Behavior

- **Single Press Response**: Each keypress results in exactly one tile of movement
- **No Key Repeat**: Holding a key does not cause continuous movement
- **Simultaneous Input**: Multiple arrow keys can be pressed simultaneously for diagonal movement intent
- **Input Prioritization**: System processes all pressed keys each frame, with diagonal movement resolved by direction priority

## Usage Examples

### Basic Navigation

1. Use arrow keys to move your character around the level
2. Character will automatically face the direction you're moving
3. Navigate around obstacles and through open spaces
4. Movement stops at walls, map boundaries, and solid objects

### Pushing Boulders

1. Walk into a boulder using any arrow key
2. If there's empty space behind the boulder, both you and the boulder move
3. If the boulder is against a wall or another object, neither moves
4. Use this mechanic to solve puzzles by positioning boulders strategically

### Interacting with Objects

1. Move adjacent to interactive objects like doors or chests
2. Press 'E' to interact with the object
3. Use movement to position yourself optimally for interactions
4. Some interactions may change the environment, opening new paths

### Collecting Items

1. Walk over items on the ground - they won't block your movement
2. Press Spacebar while standing on items to pick them up
3. Multiple items can be collected from the same position
4. Collected items are added to your inventory for later use

### Puzzle Solving

1. Use boulder pushing to create paths or block enemy movement
2. Navigate to keys and use them to unlock doors and chests
3. Plan movement routes to efficiently collect items and solve challenges
4. Combine movement with interactions to progress through levels

The Player Movement System provides the fundamental interaction layer for the game, enabling exploration, puzzle-solving, and environmental interaction through intuitive keyboard controls and responsive character movement.

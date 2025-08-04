# Entity Cleanup System

## Feature Overview

The Entity Cleanup System manages temporary game states by automatically removing short-lived components that mark entities for single-frame interactions. This system ensures that interaction markers are properly cleared after each game update cycle, preventing state corruption and maintaining clean entity data. The system runs as the final step in each game loop to clean up temporary flags created during player actions.

## Key Concepts

### Temporary Component Management
- **Single-Frame Components**: Components that are added during one frame and must be removed before the next
- **Automatic Removal**: System automatically identifies and removes temporary components without manual intervention
- **State Cleanup**: Prevents temporary states from persisting across multiple game frames
- **Memory Efficiency**: Reduces component overhead by removing unused temporary data

### Interaction State Clearing
- **Interaction Flags**: Temporary markers that indicate an entity is currently performing an interaction
- **Frame-Based Cleanup**: Components are removed at the end of each update cycle
- **Reset Mechanism**: Ensures entities return to their base state after completing actions
- **Conflict Prevention**: Prevents old interaction states from interfering with new actions

### System Execution Order
- **Final Cleanup Step**: Runs as the last system in each game loop update
- **Post-Processing**: Executes after all other systems have completed their operations
- **Dependency Management**: Allows other systems to read temporary components before cleanup
- **Consistent State**: Ensures game state is clean at the start of each new frame

## How It Works

### Cleanup Process Flow
1. System activates at the end of each game update cycle
2. Scans all entities for temporary components that need removal
3. Identifies entities marked with interaction flags
4. Removes temporary components from each flagged entity
5. Ensures clean state for the next game loop iteration

### Component Identification
The system targets specific temporary components for removal:
- **Interacting Component**: Marks entities that performed interactions during the current frame
- **Single-Use Flags**: Components designed to exist for only one update cycle
- **Temporary States**: Any component flagged as requiring automatic cleanup

### Automatic Detection
- **Component Scanning**: System automatically finds all entities with cleanup-eligible components
- **Batch Processing**: Processes all eligible entities in a single operation
- **Efficient Removal**: Uses optimized component removal operations
- **No Manual Tracking**: Requires no external lists or manual management

### State Management
- **Clean Slate Preparation**: Ensures entities start each frame without residual temporary states
- **Interaction Reset**: Clears interaction markers to allow new interactions
- **Component Hygiene**: Maintains optimal component data by removing unnecessary elements
- **System Reliability**: Prevents state-related bugs caused by persistent temporary data

## Usage Examples

### Player Interaction Cleanup
**Scenario**: Player presses interaction key to use an item
1. KeyboardInputSystem detects interaction key press and adds InteractingComponent to player
2. ItemInteractionSystem processes the interaction using the InteractingComponent flag
3. Item interaction completes (door opens, chest spawns contents, etc.)
4. CleanupSystem removes InteractingComponent from player entity
5. Player is ready for next interaction without state conflicts

### Multi-Entity Interaction Processing
**Scenario**: Multiple entities have temporary interaction states
1. Various systems add InteractingComponents to different entities during the frame
2. Game logic systems process interactions based on these temporary flags
3. All interaction behaviors complete (transformations, removals, spawning)
4. CleanupSystem scans all entities and removes all InteractingComponents
5. Next frame begins with clean entity states across the entire game world

### Preventing State Persistence
**Scenario**: Interaction component accidentally persists across frames
1. Without cleanup system: InteractingComponent remains on entity
2. Next frame: Systems detect persistent interaction flag
3. Problem: Duplicate or unintended interactions occur
4. With cleanup system: Component is automatically removed each frame
5. Result: Each interaction is processed exactly once, preventing state bugs

### System Execution Coordination
**Scenario**: Complex multi-system interaction processing
1. KeyboardInputSystem adds InteractingComponent (frame start)
2. ItemInteractionSystem reads InteractingComponent and processes interaction
3. Other systems may also read the component for related logic
4. All game logic systems complete their operations
5. CleanupSystem removes InteractingComponent (frame end)
6. Next frame starts with clean state for new interactions

### Memory Management
**Scenario**: Long-running game session with many interactions
1. Player performs hundreds of interactions over game session
2. Each interaction temporarily adds components to entities
3. Without cleanup: Memory usage grows as temporary components accumulate
4. With cleanup system: Temporary components are removed each frame
5. Result: Consistent memory usage regardless of interaction frequency

### Debugging and Development
**Scenario**: Developer troubleshooting interaction issues
1. Interaction appears to trigger multiple times unexpectedly
2. Developer checks if CleanupSystem is running in correct order
3. System should execute after all interaction processing systems
4. Proper cleanup prevents debugging artifacts from temporary components
5. Clean state each frame makes interaction behavior predictable and testable

The Entity Cleanup System provides essential housekeeping functionality that ensures game state reliability and prevents temporal component data from causing unexpected behaviors. By automatically managing temporary interaction states, it creates a stable foundation for complex interaction systems while maintaining optimal performance and memory usage.
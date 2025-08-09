# Render Systems

## Feature Overview

The Render Systems feature provides a powerful and flexible visual rendering pipeline for the game, built on a base render system architecture that integrates seamlessly with Pixi.js and the ECS framework. This system manages how all visual elements - from player characters and environment objects to UI elements - are displayed on screen. The rendering system automatically handles sprite creation, positioning, lifecycle management, and screen updates, ensuring that the visual representation always accurately reflects the current game state.

## Key Concepts

### Base Render System Architecture
- **Unified Foundation**: All render systems extend a common BaseRenderSystem that provides consistent rendering behavior
- **Container Management**: Each render system manages its own Pixi.js Container, allowing for organized visual layering
- **Automatic Lifecycle**: Sprites are automatically created, updated, and removed based on entity state changes
- **State Synchronization**: Visual representation stays synchronized with ECS entity components

### Render Sections
- **Game Section**: Main game world rendering for player, objects, and interactive elements
- **Sidebar Section**: UI elements displayed in a dedicated sidebar area
- **Map Section**: Background terrain and static environmental elements
- **Section Isolation**: Each section operates independently, preventing visual conflicts

### Component-Driven Rendering
- **Sprite and Position Component Requirement**: Entities must have both Sprite and Position components to be rendered
- **Automatic Detection**: System automatically detects when entities gain or lose renderable components
- **Dynamic Updates**: Visual changes occur on next update when entity components are modified
- **Smart Filtering**: Different render systems can filter entities based on specific component combinations

### Sprite Management
- **Texture Integration**: Seamless integration with Pixi.js texture and spritesheet systems
- **Grid-Based Positioning**: Automatic conversion from game grid coordinates to screen pixel coordinates
- **Performance Optimization**: Efficient sprite reuse and cleanup to maintain smooth performance
- **Error Handling**: Graceful handling of missing textures with informative error messages

## How It Works

### Rendering Pipeline
1. **Entity Collection**: Each render system collects relevant entities from the game state
2. **Component Validation**: System checks that entities have required Sprite and Position components
3. **Sprite Creation**: New sprites are created for entities that don't have existing visual representations
4. **Cleanup Process**: Sprites for removed or invalid entities are automatically cleaned up
5. **Position Updates**: All visible sprites have their positions updated to match entity positions

### Sprite Lifecycle Management
1. **Creation Phase**: When an entity gains required components, a new sprite is automatically created
2. **Active Phase**: Sprite position is continuously updated to match entity position
3. **Removal Phase**: When entity is deleted or loses required components, sprite is removed and cleaned up

### Sprite Storage

Sprites are maintained in their own Jotai atom; separate from the entities array. Each render section has it's own list of sprites.

## Usage Examples

### Basic Entity Rendering
1. Create an entity with Sprite and Position components
2. Entity automatically appears in the main game view via GameRenderSystem
3. Move the entity by updating its Position component - visual representation updates immediately
4. Remove the entity or its components - sprite is automatically cleaned up

### Sidebar Interface Elements
1. Create a UI entity with Sprite, Position, and RenderInSidebar components
2. Entity appears in the sidebar area instead of the main game view
3. Sidebar provides consistent UI space separate from game content
4. UI elements can be added, removed, or repositioned independently of game entities

### Map and Environment Setup
1. Map system provides terrain and static environmental data
2. MapRenderSystem automatically renders background elements
3. Changes to map data trigger visual updates only when necessary
4. Provides visual foundation for all other game elements

### Dynamic Visual Updates
1. Add or remove components from entities during gameplay
2. Visual representation updates automatically to reflect component changes
3. No manual sprite management required - system handles all visual synchronization
4. Performance optimized through automatic sprite reuse and cleanup

### Multi-Layer Visual Composition
1. Map layer provides terrain and background elements
2. Game layer displays interactive entities like player and objects
3. Sidebar layer shows UI elements and interface components
4. All layers compose together to create the complete visual experience

### Asset and Texture Management
1. Sprites reference texture names from loaded spritesheets
2. System automatically retrieves correct textures for sprite creation
3. Missing texture errors provide clear feedback for asset issues
4. Texture loading and management handled transparently by the rendering pipeline

The Render Systems feature provides a robust, automatic, and performance-optimized approach to game visualization, allowing developers to focus on gameplay logic while ensuring that visual representation stays perfectly synchronized with game state. The modular architecture supports easy extension for new rendering needs while maintaining consistent behavior across all visual elements.

## How To Implement It

### Creating a New Render System

1. **Extend BaseRenderSystem**: Create a new class that extends the BaseRenderSystem abstract class
   ```typescript
   import { BaseRenderSystem } from './BaseRenderSystem';
   
   export class CustomRenderSystem extends BaseRenderSystem {
     constructor() {
       // Get or create a Pixi.js Container for your render section
       const container = new Container();
       // Define render section key ('game', 'sidebar', 'map', or custom)
       super(container, 'custom', [x, y]); // x, y are screen position coordinates
     }
   }
   ```

2. **Override the Update Method**: Implement entity filtering logic specific to your render system
   ```typescript
   update({ entities }: UpdateArgs) {
     // Filter entities based on your rendering criteria
     const filteredEntities = entities.filter(entity => 
       // Add your filtering logic here (e.g., component checks)
       hasComponent(entity, ComponentType.YourCustomComponent)
     );
     
     // Call the base class method to handle rendering
     this.updateStageAndPositions(filteredEntities);
   }
   ```

3. **Register Your System**: Add your render system to the game systems in GameSystem.ts
   ```typescript
   // In GameSystem.ts
   import { CustomRenderSystem } from './systems/RenderSystems/CustomRenderSystem';
   
   // Add to the systems array
   new CustomRenderSystem(),
   ```

### Setting Up Entity Rendering

1. **Create Entities with Required Components**: Entities need both Sprite and Position components to be rendered
   ```typescript
   // Using EntityFactory
   const renderableEntity = EntityFactory.createEntity({
     components: {
       [ComponentType.Position]: { x: 5, y: 3 },
       [ComponentType.Sprite]: { sprite: 'player' }, // Texture name from spritesheet
       // Add other components as needed
     }
   });
   ```

2. **Add Render Section Targeting**: Use specific components to control which render system handles the entity
   ```typescript
   // For sidebar rendering
   const sidebarEntity = EntityFactory.createEntity({
     components: {
       [ComponentType.Position]: { x: 0, y: 0 },
       [ComponentType.Sprite]: { sprite: 'ui-icon' },
       [ComponentType.RenderInSidebar]: {}, // Routes to sidebar render system
     }
   });
   ```

3. **Dynamic Component Addition**: Add rendering components to existing entities at runtime
   ```typescript
   // Make an entity visible by adding required components
   addComponent(entity, ComponentType.Sprite, { sprite: 'item-texture' });
   addComponent(entity, ComponentType.Position, { x: 10, y: 5 });
   
   // Entity will automatically appear in the next render update
   ```

### Integrating with Existing Render Pipeline

1. **Understand Render Sections**: Each render system operates on a specific section
   - `'game'`: Main game world entities (GameRenderSystem)
   - `'map'`: Background terrain and static elements (MapRenderSystem)  
   - `'sidebar'`: UI elements and interface components (filtered by RenderInSidebar component)

2. **Sprite Atom Management**: Sprites are stored separately from entities in Jotai atoms
   ```typescript
   // Sprites are automatically managed, but you can access them if needed
   const gameSprites = store.get(renderedEntities)['game'];
   const sprite = getSprite('game', entityId);
   ```

3. **Container Hierarchy**: Position your render system container appropriately
   ```typescript
   // Containers are automatically added to pixiApp.stage
   // Position determines layer order and screen location
   super(container, 'custom', [offsetX, offsetY]);
   ```

### Common Implementation Scenarios

#### Custom Entity Filtering
```typescript
export class FilteredRenderSystem extends BaseRenderSystem {
  update({ entities }: UpdateArgs) {
    // Only render entities with specific component combinations
    const filteredEntities = entities.filter(entity => 
      hasAllComponents(entity, ComponentType.Sprite, ComponentType.Position) &&
      hasComponent(entity, ComponentType.YourFilterComponent) &&
      !hasComponent(entity, ComponentType.ExcludeFromCustomRender)
    );
    
    this.updateStageAndPositions(filteredEntities);
  }
}
```

#### Map-Based Render System
```typescript
export class EnvironmentRenderSystem extends BaseRenderSystem {
  update({ map }: UpdateArgs) {
    // Only update when map changes to optimize performance
    if (!map.hasChanged) {
      return;
    }
    
    // Get entities from map data instead of main entity list
    const environmentEntities = map.getAllEntities().filter(entity =>
      hasComponent(entity, ComponentType.EnvironmentalObject)
    );
    
    this.updateStageAndPositions(environmentEntities);
    map.hasChanged = false;
  }
}
```

#### Performance-Optimized Render System
```typescript
export class OptimizedRenderSystem extends BaseRenderSystem {
  private lastUpdateTime = 0;
  private updateInterval = 16; // ~60 FPS
  
  update(updateArgs: UpdateArgs) {
    const now = Date.now();
    
    // Throttle updates for performance-critical sections
    if (now - this.lastUpdateTime < this.updateInterval) {
      return;
    }
    
    // Your rendering logic here
    super.update(updateArgs);
    this.lastUpdateTime = now;
  }
}
```

#### UI-Specific Render System
```typescript
export class UIRenderSystem extends BaseRenderSystem {
  constructor() {
    // Create UI container with fixed positioning
    const uiContainer = new Container();
    super(uiContainer, 'ui', [screenWidth - 200, 0]); // Right side of screen
  }
  
  update({ entities }: UpdateArgs) {
    // Filter for UI-specific entities
    const uiEntities = entities.filter(entity =>
      hasComponent(entity, ComponentType.UIElement) &&
      hasAllComponents(entity, ComponentType.Sprite, ComponentType.Position)
    );
    
    this.updateStageAndPositions(uiEntities);
  }
}
```

### Integration Checklist

- [ ] Create render system class extending BaseRenderSystem
- [ ] Implement entity filtering logic in update method
- [ ] Define appropriate render section key
- [ ] Set container position for proper layering
- [ ] Register system in GameSystem.ts systems array
- [ ] Test with entities that have required Sprite and Position components
- [ ] Verify sprite creation, positioning, and cleanup behavior
- [ ] Ensure proper integration with existing render pipeline

The render system architecture handles sprite lifecycle management, texture loading, positioning, and cleanup automatically. Your implementation only needs to focus on entity filtering and any custom rendering behavior specific to your use case.
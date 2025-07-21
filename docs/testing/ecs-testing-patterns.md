# ECS Testing Patterns and Examples

## Overview
This document provides specific testing patterns and real-world examples for Entity-Component-System (ECS) architecture testing. Each pattern includes complete, runnable test examples based on the actual codebase.

## Table of Contents
1. [Component Testing Patterns](#component-testing-patterns)
2. [System Testing Patterns](#system-testing-patterns)
3. [Entity Lifecycle Testing](#entity-lifecycle-testing)
4. [Integration Testing Patterns](#integration-testing-patterns)
5. [Mock Testing Strategies](#mock-testing-strategies)
6. [Performance Testing](#performance-testing)
7. [Edge Case Testing](#edge-case-testing)

---

## Component Testing Patterns

### Pattern 1: Data Validation Components
Components that validate and store data should test both valid and invalid inputs.

```typescript
// PositionComponent.test.ts
import { PositionComponent } from '../PositionComponent';

describe('PositionComponent', () => {
  describe('valid input handling', () => {
    it('should accept integer coordinates', () => {
      const component = new PositionComponent({ x: 10, y: 20 });
      expect(component.x).toBe(10);
      expect(component.y).toBe(20);
    });

    it('should accept floating point coordinates', () => {
      const component = new PositionComponent({ x: 10.5, y: 20.7 });
      expect(component.x).toBe(10.5);
      expect(component.y).toBe(20.7);
    });

    it('should accept negative coordinates', () => {
      const component = new PositionComponent({ x: -5, y: -10 });
      expect(component.x).toBe(-5);
      expect(component.y).toBe(-10);
    });

    it('should accept zero coordinates', () => {
      const component = new PositionComponent({ x: 0, y: 0 });
      expect(component.x).toBe(0);
      expect(component.y).toBe(0);
    });
  });

  describe('invalid input handling', () => {
    it('should reject NaN coordinates', () => {
      expect(() => new PositionComponent({ x: NaN, y: 0 })).toThrow('Invalid x coordinate: NaN');
      expect(() => new PositionComponent({ x: 0, y: NaN })).toThrow('Invalid y coordinate: NaN');
    });

    it('should reject infinite coordinates', () => {
      expect(() => new PositionComponent({ x: Infinity, y: 0 })).toThrow('Invalid x coordinate: Infinity');
      expect(() => new PositionComponent({ x: 0, y: -Infinity })).toThrow('Invalid y coordinate: -Infinity');
    });

    it('should reject non-numeric coordinates', () => {
      expect(() => new PositionComponent({ x: 'invalid', y: 0 })).toThrow();
      expect(() => new PositionComponent({ x: 0, y: null })).toThrow();
    });
  });

  describe('property updates', () => {
    let component: PositionComponent;

    beforeEach(() => {
      component = new PositionComponent({ x: 0, y: 0 });
    });

    it('should update x coordinate', () => {
      component.x = 15;
      expect(component.x).toBe(15);
    });

    it('should update y coordinate', () => {
      component.y = 25;
      expect(component.y).toBe(25);
    });

    it('should validate updates', () => {
      expect(() => component.x = NaN).toThrow();
      expect(() => component.y = Infinity).toThrow();
    });
  });
});
```

### Pattern 2: State Management Components
Components that track state and transitions need comprehensive state testing.

```typescript
// MovableComponent.test.ts
import { MovableComponent } from '../MovableComponent';

describe('MovableComponent', () => {
  describe('initialization', () => {
    it('should initialize as movable by default', () => {
      const component = new MovableComponent();
      expect(component.canMove).toBe(true);
      expect(component.isBlocked).toBe(false);
    });

    it('should accept custom initial state', () => {
      const component = new MovableComponent({ canMove: false, isBlocked: true });
      expect(component.canMove).toBe(false);
      expect(component.isBlocked).toBe(true);
    });
  });

  describe('state transitions', () => {
    let component: MovableComponent;

    beforeEach(() => {
      component = new MovableComponent();
    });

    it('should block movement when requested', () => {
      component.setBlocked(true);
      expect(component.isBlocked).toBe(true);
      expect(component.canMove).toBe(false);
    });

    it('should unblock movement when requested', () => {
      component.setBlocked(true);
      component.setBlocked(false);
      expect(component.isBlocked).toBe(false);
      expect(component.canMove).toBe(true);
    });

    it('should disable movement entirely', () => {
      component.setMovable(false);
      expect(component.canMove).toBe(false);
      
      // Should not be unblockable when disabled
      component.setBlocked(false);
      expect(component.canMove).toBe(false);
    });

    it('should re-enable movement', () => {
      component.setMovable(false);
      component.setMovable(true);
      expect(component.canMove).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid state changes', () => {
      const component = new MovableComponent();
      
      for (let i = 0; i < 100; i++) {
        component.setBlocked(i % 2 === 0);
      }
      
      expect(component.isBlocked).toBe(true); // Even number (100)
    });
  });
});
```

---

## System Testing Patterns

### Pattern 1: Entity Filtering Systems
Systems that filter entities by components need thorough filtering tests.

```typescript
// MovementSystem.test.ts
import { MovementSystem } from '../MovementSystem';
import { PositionComponent, VelocityComponent, MovableComponent } from '../components';
import { createTestEntity, createTestUpdateArgs, addComponent } from '../../__tests__/testUtils';

describe('MovementSystem', () => {
  let mockUpdateArgs: UpdateArgs;

  beforeEach(() => {
    mockUpdateArgs = createTestUpdateArgs();
    vi.clearAllMocks();
  });

  describe('entity filtering', () => {
    it('should only process entities with Position and Velocity components', () => {
      const validEntity = createTestEntity();
      addComponent(validEntity, PositionComponent, { x: 0, y: 0 });
      addComponent(validEntity, VelocityComponent, { dx: 5, dy: 3 });

      const missingPosition = createTestEntity();
      addComponent(missingPosition, VelocityComponent, { dx: 2, dy: 1 });

      const missingVelocity = createTestEntity();
      addComponent(missingVelocity, PositionComponent, { x: 10, y: 20 });

      const noComponents = createTestEntity();

      const entities = [validEntity, missingPosition, missingVelocity, noComponents];
      
      const processEntitySpy = vi.spyOn(MovementSystem, 'processEntity');
      MovementSystem.update(entities, mockUpdateArgs);

      expect(processEntitySpy).toHaveBeenCalledTimes(1);
      expect(processEntitySpy).toHaveBeenCalledWith(validEntity, mockUpdateArgs);
    });

    it('should respect MovableComponent restrictions', () => {
      const movableEntity = createTestEntity();
      addComponent(movableEntity, PositionComponent, { x: 0, y: 0 });
      addComponent(movableEntity, VelocityComponent, { dx: 5, dy: 3 });
      addComponent(movableEntity, MovableComponent, { canMove: true });

      const blockedEntity = createTestEntity();
      addComponent(blockedEntity, PositionComponent, { x: 10, y: 10 });
      addComponent(blockedEntity, VelocityComponent, { dx: 5, dy: 3 });
      addComponent(blockedEntity, MovableComponent, { canMove: false });

      const entities = [movableEntity, blockedEntity];
      
      const processEntitySpy = vi.spyOn(MovementSystem, 'processEntity');
      MovementSystem.update(entities, mockUpdateArgs);

      expect(processEntitySpy).toHaveBeenCalledTimes(1);
      expect(processEntitySpy).toHaveBeenCalledWith(movableEntity, mockUpdateArgs);
    });
  });

  describe('movement processing', () => {
    it('should update position based on velocity and delta time', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 0, y: 0 });
      addComponent(entity, VelocityComponent, { dx: 60, dy: -30 }); // 60 pixels per second
      
      const mockArgs = createTestUpdateArgs({ deltaTime: 16.67 }); // ~60 FPS
      MovementSystem.update([entity], mockArgs);

      const position = getComponent(entity, PositionComponent);
      expect(position.x).toBeCloseTo(1, 1); // 60 * (16.67/1000) ≈ 1
      expect(position.y).toBeCloseTo(-0.5, 1); // -30 * (16.67/1000) ≈ -0.5
    });

    it('should handle zero velocity', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 10, y: 20 });
      addComponent(entity, VelocityComponent, { dx: 0, dy: 0 });
      
      MovementSystem.update([entity], mockUpdateArgs);

      const position = getComponent(entity, PositionComponent);
      expect(position.x).toBe(10); // No change
      expect(position.y).toBe(20); // No change
    });

    it('should handle negative velocity', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 100, y: 100 });
      addComponent(entity, VelocityComponent, { dx: -50, dy: -25 });
      
      const mockArgs = createTestUpdateArgs({ deltaTime: 20 }); // 0.02 seconds
      MovementSystem.update([entity], mockArgs);

      const position = getComponent(entity, PositionComponent);
      expect(position.x).toBe(99); // 100 + (-50 * 0.02) = 99
      expect(position.y).toBe(99.5); // 100 + (-25 * 0.02) = 99.5
    });
  });

  describe('collision detection', () => {
    it('should prevent movement into walls', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 95, y: 50 });
      addComponent(entity, VelocityComponent, { dx: 100, dy: 0 });
      
      // Mock game map with wall at x=100
      const mockArgs = createTestUpdateArgs({
        gameMap: createMockGameMap({
          isWalkable: vi.fn().mockImplementation((x, y) => x < 100)
        })
      });
      
      MovementSystem.update([entity], mockArgs);

      const position = getComponent(entity, PositionComponent);
      expect(position.x).toBeLessThan(100); // Stopped by wall
    });

    it('should prevent movement out of bounds', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 5, y: 5 });
      addComponent(entity, VelocityComponent, { dx: -100, dy: -100 });
      
      const mockArgs = createTestUpdateArgs({
        gameMap: createMockGameMap({
          width: 800,
          height: 600,
          isWalkable: vi.fn().mockReturnValue(true)
        })
      });
      
      MovementSystem.update([entity], mockArgs);

      const position = getComponent(entity, PositionComponent);
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty entity array', () => {
      expect(() => MovementSystem.update([], mockUpdateArgs)).not.toThrow();
    });

    it('should handle null/undefined entities', () => {
      const entities = [null, undefined, createTestEntity()];
      expect(() => MovementSystem.update(entities, mockUpdateArgs)).not.toThrow();
    });

    it('should handle zero delta time', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 10, y: 20 });
      addComponent(entity, VelocityComponent, { dx: 100, dy: 200 });
      
      const mockArgs = createTestUpdateArgs({ deltaTime: 0 });
      MovementSystem.update([entity], mockArgs);

      const position = getComponent(entity, PositionComponent);
      expect(position.x).toBe(10); // No movement with zero delta time
      expect(position.y).toBe(20);
    });

    it('should handle very large delta times', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 0, y: 0 });
      addComponent(entity, VelocityComponent, { dx: 10, dy: 10 });
      
      const mockArgs = createTestUpdateArgs({ deltaTime: 1000000 }); // 1000 seconds!
      MovementSystem.update([entity], mockArgs);

      const position = getComponent(entity, PositionComponent);
      // System should cap movement or handle gracefully
      expect(position.x).toBeLessThan(1000000); // Some reasonable maximum
      expect(position.y).toBeLessThan(1000000);
    });
  });
});
```

### Pattern 2: Interaction Systems
Systems that handle entity interactions need complex state testing.

```typescript
// PickupSystem.test.ts
import { PickupSystem } from '../PickupSystem';
import { PositionComponent, PlayerComponent, PickableComponent, CarriedItemComponent } from '../components';
import { createTestEntity, createPlayerEntity, createPickableItem } from '../../__tests__/testUtils';

describe('PickupSystem', () => {
  let mockUpdateArgs: UpdateArgs;

  beforeEach(() => {
    mockUpdateArgs = createTestUpdateArgs();
  });

  describe('pickup detection', () => {
    it('should detect when player is near pickable item', () => {
      const player = createPlayerEntity();
      addComponent(player, PositionComponent, { x: 100, y: 100 });

      const item = createPickableItem('sword');
      addComponent(item, PositionComponent, { x: 102, y: 101 }); // Close to player

      const entities = [player, item];
      PickupSystem.update(entities, mockUpdateArgs);

      expect(hasComponent(player, CarriedItemComponent)).toBe(true);
      expect(hasComponent(item, PickableComponent)).toBe(false); // Item consumed
    });

    it('should not pickup distant items', () => {
      const player = createPlayerEntity();
      addComponent(player, PositionComponent, { x: 100, y: 100 });

      const item = createPickableItem('sword');
      addComponent(item, PositionComponent, { x: 200, y: 200 }); // Far from player

      const entities = [player, item];
      PickupSystem.update(entities, mockUpdateArgs);

      expect(hasComponent(player, CarriedItemComponent)).toBe(false);
      expect(hasComponent(item, PickableComponent)).toBe(true); // Item remains
    });

    it('should respect pickup radius configuration', () => {
      const player = createPlayerEntity();
      addComponent(player, PositionComponent, { x: 100, y: 100 });

      const item = createPickableItem('sword');
      addComponent(item, PositionComponent, { x: 115, y: 100 }); // Exactly at radius

      const entities = [player, item];
      const mockArgs = createTestUpdateArgs({ 
        gameConfig: { pickupRadius: 15 } 
      });
      
      PickupSystem.update(entities, mockArgs);

      expect(hasComponent(player, CarriedItemComponent)).toBe(true);
    });
  });

  describe('inventory management', () => {
    it('should add item to player inventory', () => {
      const player = createPlayerEntity();
      const item = createPickableItem('health_potion');
      
      positionEntitiesTogether(player, item);
      PickupSystem.update([player, item], mockUpdateArgs);

      const carried = getComponent(player, CarriedItemComponent);
      expect(carried.itemType).toBe('health_potion');
      expect(carried.count).toBe(1);
    });

    it('should stack identical items', () => {
      const player = createPlayerEntity();
      addComponent(player, CarriedItemComponent, { itemType: 'arrow', count: 5 });

      const newArrows = createPickableItem('arrow');
      getComponent(newArrows, PickableComponent).count = 3;

      positionEntitiesTogether(player, newArrows);
      PickupSystem.update([player, newArrows], mockUpdateArgs);

      const carried = getComponent(player, CarriedItemComponent);
      expect(carried.count).toBe(8); // 5 + 3
    });

    it('should reject pickup when inventory full', () => {
      const player = createPlayerEntity();
      addComponent(player, CarriedItemComponent, { itemType: 'various', count: 100 });
      
      const item = createPickableItem('sword');
      positionEntitiesTogether(player, item);

      const mockArgs = createTestUpdateArgs({ 
        gameConfig: { maxInventorySize: 100 } 
      });
      
      PickupSystem.update([player, item], mockArgs);

      expect(hasComponent(item, PickableComponent)).toBe(true); // Item not picked up
    });
  });

  describe('multiple players', () => {
    it('should handle multiple players attempting pickup', () => {
      const player1 = createPlayerEntity();
      const player2 = createPlayerEntity();
      const item = createPickableItem('sword');

      // Both players near item
      positionEntitiesTogether(player1, item);
      positionEntitiesTogether(player2, item);

      const entities = [player1, player2, item];
      PickupSystem.update(entities, mockUpdateArgs);

      // Only one player should get the item
      const player1HasItem = hasComponent(player1, CarriedItemComponent);
      const player2HasItem = hasComponent(player2, CarriedItemComponent);
      
      expect(player1HasItem || player2HasItem).toBe(true);
      expect(player1HasItem && player2HasItem).toBe(false); // But not both
      expect(hasComponent(item, PickableComponent)).toBe(false); // Item consumed
    });
  });
});
```

---

## Entity Lifecycle Testing

### Pattern 1: Entity Creation and Destruction
```typescript
// EntityLifecycle.test.ts
describe('Entity Lifecycle', () => {
  describe('entity creation', () => {
    it('should create entity with components', () => {
      const entity = EntityFactory.createPlayer({ x: 10, y: 20 });
      
      expectEntityHasComponent(entity, PositionComponent);
      expectEntityHasComponent(entity, PlayerComponent);
      expectEntityHasComponent(entity, MovableComponent);
      
      expectComponentProps(entity, PositionComponent, { x: 10, y: 20 });
    });

    it('should create entities from templates', () => {
      const template = {
        components: [
          { type: 'Position', props: { x: 0, y: 0 } },
          { type: 'Sprite', props: { texture: 'player.png' } }
        ]
      };

      const entity = EntityFactory.createFromTemplate(template);

      expectEntityHasComponent(entity, PositionComponent);
      expectEntityHasComponent(entity, SpriteComponent);
    });
  });

  describe('component lifecycle', () => {
    it('should handle component addition during gameplay', () => {
      const entity = createTestEntity();
      
      // Entity starts without velocity
      expect(hasComponent(entity, VelocityComponent)).toBe(false);
      
      // Player input should add velocity
      KeyboardInputSystem.processEntity(entity, mockUpdateArgs);
      
      expect(hasComponent(entity, VelocityComponent)).toBe(true);
    });

    it('should handle component removal during gameplay', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 0, y: 0 });
      addComponent(entity, VelocityComponent, { dx: 5, dy: 0 });
      
      // Movement into wall should remove velocity
      const mockArgs = createTestUpdateArgs({
        gameMap: createMockGameMap({ isWalkable: () => false })
      });
      
      MovementSystem.update([entity], mockArgs);
      
      expect(hasComponent(entity, VelocityComponent)).toBe(false);
    });
  });

  describe('entity cleanup', () => {
    it('should remove entities marked for deletion', () => {
      const entities = [
        createTestEntity(),
        createTestEntity(),
        createTestEntity()
      ];

      // Mark second entity for deletion
      entities[1].markedForDeletion = true;

      CleanUpSystem.update(entities, mockUpdateArgs);

      expect(entities).toHaveLength(2);
      expect(entities[0].markedForDeletion).toBeFalsy();
      expect(entities[1].markedForDeletion).toBeFalsy();
    });
  });
});
```

---

## Integration Testing Patterns

### Pattern 1: Full Gameplay Scenarios
```typescript
// GameplayScenarios.test.ts
describe('Complete Gameplay Scenarios', () => {
  let gameState: GameState;
  let entities: Entity[];

  beforeEach(() => {
    gameState = createTestGameState();
    entities = createTestLevel();
  });

  describe('player movement workflow', () => {
    it('should handle complete movement from input to rendering', () => {
      const player = entities.find(e => hasComponent(e, PlayerComponent));
      const initialPosition = getComponent(player, PositionComponent);
      
      // Simulate key press
      const inputArgs = createTestUpdateArgs({
        inputState: { keys: { 'ArrowRight': true } }
      });
      
      // 1. Input System processes key press
      KeyboardInputSystem.update(entities, inputArgs);
      
      // Verify velocity was set
      const velocity = getComponent(player, VelocityComponent);
      expect(velocity.dx).toBeGreaterThan(0);
      expect(velocity.dy).toBe(0);
      
      // 2. Movement System processes movement
      MovementSystem.update(entities, inputArgs);
      
      // Verify position changed
      const newPosition = getComponent(player, PositionComponent);
      expect(newPosition.x).toBeGreaterThan(initialPosition.x);
      expect(newPosition.y).toBe(initialPosition.y);
      
      // 3. Render System updates sprites
      RenderSystem.update(entities, inputArgs);
      
      // Verify sprite position matches entity position
      const sprite = getComponent(player, SpriteComponent);
      expect(sprite.x).toBe(newPosition.x);
      expect(sprite.y).toBe(newPosition.y);
      
      // 4. Clean up velocity for next frame
      CleanUpSystem.update(entities, inputArgs);
      
      // Verify velocity reset (if that's the design)
      const finalVelocity = getComponent(player, VelocityComponent);
      expect(finalVelocity.dx).toBe(0);
    });
  });

  describe('item collection workflow', () => {
    it('should handle complete pickup sequence', () => {
      const player = entities.find(e => hasComponent(e, PlayerComponent));
      const item = entities.find(e => hasComponent(e, PickableComponent));
      
      // Position player near item
      const itemPos = getComponent(item, PositionComponent);
      const playerPos = getComponent(player, PositionComponent);
      playerPos.x = itemPos.x + 1; // Very close
      playerPos.y = itemPos.y;
      
      const initialEntityCount = entities.length;
      
      // Run pickup system
      PickupSystem.update(entities, mockUpdateArgs);
      
      // Verify item was picked up
      expect(hasComponent(player, CarriedItemComponent)).toBe(true);
      const carried = getComponent(player, CarriedItemComponent);
      expect(carried.itemType).toBe('sword'); // Or whatever item type
      
      // Verify item component removed
      expect(hasComponent(item, PickableComponent)).toBe(false);
      
      // Run cleanup system
      CleanUpSystem.update(entities, mockUpdateArgs);
      
      // Verify item entity removed from world
      expect(entities.length).toBeLessThan(initialEntityCount);
      expect(entities).not.toContain(item);
      
      // Run render system to update UI
      RenderSidebarSystem.update(entities, mockUpdateArgs);
      
      // Verify inventory UI updated (check UI component)
      expect(hasComponent(player, RenderInSidebarComponent)).toBe(true);
    });
  });

  describe('collision and boundaries', () => {
    it('should handle movement collision workflow', () => {
      const player = entities.find(e => hasComponent(e, PlayerComponent));
      
      // Position player near wall
      addComponent(player, PositionComponent, { x: 95, y: 100 });
      addComponent(player, VelocityComponent, { dx: 10, dy: 0 });
      
      // Mock game map with wall at x=100
      const mockArgs = createTestUpdateArgs({
        gameMap: createMockGameMap({
          width: 200,
          height: 200,
          isWalkable: (x, y) => x < 100 // Wall at x=100
        })
      });
      
      // Run movement system
      MovementSystem.update(entities, mockArgs);
      
      // Verify player stopped at wall
      const position = getComponent(player, PositionComponent);
      expect(position.x).toBeLessThan(100);
      
      // Verify velocity cleared (hit wall)
      const velocity = getComponent(player, VelocityComponent);
      expect(velocity.dx).toBe(0);
    });
  });
});
```

### Pattern 2: System Interaction Testing
```typescript
// SystemInteraction.test.ts
describe('System Interactions', () => {
  describe('system execution order', () => {
    it('should execute systems in correct order', () => {
      const executionOrder = [];
      
      // Spy on system updates
      vi.spyOn(KeyboardInputSystem, 'update').mockImplementation(() => {
        executionOrder.push('Input');
      });
      vi.spyOn(MovementSystem, 'update').mockImplementation(() => {
        executionOrder.push('Movement');
      });
      vi.spyOn(PickupSystem, 'update').mockImplementation(() => {
        executionOrder.push('Pickup');
      });
      vi.spyOn(RenderSystem, 'update').mockImplementation(() => {
        executionOrder.push('Render');
      });
      vi.spyOn(CleanUpSystem, 'update').mockImplementation(() => {
        executionOrder.push('Cleanup');
      });
      
      // Execute game loop
      GameLoop.update(entities, mockUpdateArgs);
      
      // Verify correct execution order
      expect(executionOrder).toEqual([
        'Input',
        'Movement', 
        'Pickup',
        'Render',
        'Cleanup'
      ]);
    });
  });

  describe('data flow between systems', () => {
    it('should pass data correctly between systems', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 0, y: 0 });
      
      // Input system adds velocity
      const inputArgs = createTestUpdateArgs({
        inputState: { keys: { 'ArrowRight': true } }
      });
      KeyboardInputSystem.processEntity(entity, inputArgs);
      
      expect(hasComponent(entity, VelocityComponent)).toBe(true);
      const velocity = getComponent(entity, VelocityComponent);
      expect(velocity.dx).toBeGreaterThan(0);
      
      // Movement system consumes velocity and updates position
      MovementSystem.processEntity(entity, inputArgs);
      
      const position = getComponent(entity, PositionComponent);
      expect(position.x).toBeGreaterThan(0);
      
      // Render system reads position and updates sprite
      addComponent(entity, SpriteComponent, { x: -999, y: -999 });
      RenderSystem.processEntity(entity, inputArgs);
      
      const sprite = getComponent(entity, SpriteComponent);
      expect(sprite.x).toBe(position.x);
      expect(sprite.y).toBe(position.y);
    });
  });
});
```

---

## Mock Testing Strategies

### Pattern 1: PIXI.js Rendering Mocks
```typescript
// RenderSystem.test.ts with PIXI mocks
import { RenderSystem } from '../RenderSystem';
import { createMockSprite, createMockApplication } from '../../__tests__/mocks/pixiMocks';

describe('RenderSystem with PIXI mocks', () => {
  let mockApp: any;
  let mockStage: any;

  beforeEach(() => {
    mockApp = createMockApplication();
    mockStage = mockApp.stage;
    
    // Mock global PIXI application
    vi.stubGlobal('pixiApp', mockApp);
  });

  it('should create and position sprites correctly', () => {
    const entity = createTestEntity();
    addComponent(entity, PositionComponent, { x: 100, y: 200 });
    addComponent(entity, SpriteComponent, { texture: 'player.png' });
    
    RenderSystem.update([entity], mockUpdateArgs);
    
    // Verify sprite was created and added to stage
    expect(mockStage.addChild).toHaveBeenCalled();
    
    // Get the sprite that was added
    const addChildCall = mockStage.addChild.mock.calls[0];
    const sprite = addChildCall[0];
    
    expect(sprite.x).toBe(100);
    expect(sprite.y).toBe(200);
    expect(sprite.texture).toBe('player.png');
  });

  it('should handle sprite updates efficiently', () => {
    const entity = createTestEntity();
    const existingSprite = createMockSprite({ x: 50, y: 50 });
    
    addComponent(entity, PositionComponent, { x: 100, y: 200 });
    addComponent(entity, SpriteComponent, { 
      texture: 'player.png',
      pixiSprite: existingSprite 
    });
    
    RenderSystem.update([entity], mockUpdateArgs);
    
    // Should update existing sprite, not create new one
    expect(mockStage.addChild).not.toHaveBeenCalled();
    expect(existingSprite.x).toBe(100);
    expect(existingSprite.y).toBe(200);
  });

  it('should clean up sprites when entities are removed', () => {
    const entity = createTestEntity();
    const sprite = createMockSprite();
    
    addComponent(entity, SpriteComponent, { pixiSprite: sprite });
    entity.markedForDeletion = true;
    
    RenderSystem.update([entity], mockUpdateArgs);
    
    expect(mockStage.removeChild).toHaveBeenCalledWith(sprite);
  });
});
```

### Pattern 2: State Management Mocks
```typescript
// GameState.test.ts with Jotai mocks
describe('Game State Management', () => {
  let mockStore: any;
  let mockAtoms: any;

  beforeEach(() => {
    mockStore = createMockJotaiStore();
    mockAtoms = {
      entitiesAtom: createMockAtom([]),
      gameMapAtom: createMockAtom(null),
      playerAtom: createMockAtom(null)
    };
    
    vi.mocked(useStore).mockReturnValue(mockStore);
  });

  it('should update entity state correctly', () => {
    const entities = [createPlayerEntity(), createPickableItem('sword')];
    
    // Mock store operations
    mockStore.set = vi.fn();
    mockStore.get = vi.fn().mockReturnValue(entities);
    
    GameStateManager.updateEntities(entities);
    
    expect(mockStore.set).toHaveBeenCalledWith(mockAtoms.entitiesAtom, entities);
  });

  it('should handle state persistence', () => {
    const gameState = {
      entities: [createPlayerEntity()],
      level: 1,
      score: 100
    };
    
    GameStateManager.saveState(gameState);
    const loadedState = GameStateManager.loadState();
    
    expect(loadedState).toEqual(gameState);
  });
});
```

---

## Performance Testing

### Pattern 1: Large Entity Set Testing
```typescript
// Performance.test.ts
describe('System Performance', () => {
  describe('large entity sets', () => {
    it('should handle 1000 entities efficiently', () => {
      const entities = [];
      
      // Create 1000 entities with position and velocity
      for (let i = 0; i < 1000; i++) {
        const entity = createTestEntity();
        addComponent(entity, PositionComponent, { x: i % 100, y: Math.floor(i / 100) });
        addComponent(entity, VelocityComponent, { dx: 1, dy: 1 });
        entities.push(entity);
      }
      
      const startTime = performance.now();
      
      MovementSystem.update(entities, mockUpdateArgs);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete in reasonable time (adjust threshold as needed)
      expect(executionTime).toBeLessThan(100); // 100ms
      
      // Verify all entities were processed
      entities.forEach(entity => {
        const position = getComponent(entity, PositionComponent);
        expect(position.x).toBeGreaterThanOrEqual(0);
        expect(position.y).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('memory usage', () => {
    it('should not leak memory during entity creation/destruction', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create and destroy entities many times
      for (let cycle = 0; cycle < 100; cycle++) {
        const entities = [];
        
        // Create 100 entities
        for (let i = 0; i < 100; i++) {
          entities.push(createComplexEntity());
        }
        
        // Process with all systems
        GameLoop.update(entities, mockUpdateArgs);
        
        // Mark all for deletion
        entities.forEach(entity => entity.markedForDeletion = true);
        
        // Clean up
        CleanUpSystem.update(entities, mockUpdateArgs);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory should not increase significantly
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB increase
    });
  });
});
```

---

## Edge Case Testing

### Pattern 1: Boundary Conditions
```typescript
// EdgeCases.test.ts
describe('Edge Case Handling', () => {
  describe('boundary values', () => {
    it('should handle maximum coordinate values', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER });
      addComponent(entity, VelocityComponent, { dx: 1, dy: 1 });
      
      expect(() => MovementSystem.update([entity], mockUpdateArgs)).not.toThrow();
      
      const position = getComponent(entity, PositionComponent);
      expect(Number.isFinite(position.x)).toBe(true);
      expect(Number.isFinite(position.y)).toBe(true);
    });

    it('should handle minimum coordinate values', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER });
      addComponent(entity, VelocityComponent, { dx: -1, dy: -1 });
      
      expect(() => MovementSystem.update([entity], mockUpdateArgs)).not.toThrow();
      
      const position = getComponent(entity, PositionComponent);
      expect(Number.isFinite(position.x)).toBe(true);
      expect(Number.isFinite(position.y)).toBe(true);
    });

    it('should handle zero-sized entities', () => {
      const entity = createTestEntity();
      addComponent(entity, PositionComponent, { x: 0, y: 0 });
      addComponent(entity, SpriteComponent, { width: 0, height: 0 });
      
      expect(() => RenderSystem.update([entity], mockUpdateArgs)).not.toThrow();
    });
  });

  describe('null and undefined handling', () => {
    it('should handle null components gracefully', () => {
      const entity = createTestEntity();
      entity.components[PositionComponent.name] = null;
      
      expect(() => MovementSystem.update([entity], mockUpdateArgs)).not.toThrow();
    });

    it('should handle undefined update arguments', () => {
      const entities = [createTestEntity()];
      
      expect(() => MovementSystem.update(entities, undefined)).not.toThrow();
      expect(() => MovementSystem.update(entities, null)).not.toThrow();
    });

    it('should handle corrupted entity data', () => {
      const corruptedEntity = { 
        id: 'test',
        components: 'not an object' // Intentionally wrong type
      };
      
      expect(() => MovementSystem.update([corruptedEntity], mockUpdateArgs)).not.toThrow();
    });
  });

  describe('rapid state changes', () => {
    it('should handle rapid component addition/removal', () => {
      const entity = createTestEntity();
      
      for (let i = 0; i < 1000; i++) {
        addComponent(entity, PositionComponent, { x: i, y: i });
        expect(hasComponent(entity, PositionComponent)).toBe(true);
        
        removeComponent(entity, PositionComponent);
        expect(hasComponent(entity, PositionComponent)).toBe(false);
      }
    });

    it('should handle simultaneous system processing', () => {
      const entities = createTestLevel();
      
      // Simulate multiple systems running concurrently
      const promises = [
        Promise.resolve(MovementSystem.update(entities, mockUpdateArgs)),
        Promise.resolve(RenderSystem.update(entities, mockUpdateArgs)),
        Promise.resolve(PickupSystem.update(entities, mockUpdateArgs))
      ];
      
      expect(() => Promise.all(promises)).not.toThrow();
    });
  });
});
```

This document provides concrete, runnable examples of ECS testing patterns. Each pattern addresses specific challenges in testing Entity-Component-System architectures and provides practical implementations that can be adapted to different game development scenarios.

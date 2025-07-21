# PRD: Item Unlock System

## Introduction/Overview

This PRD defines the design and implementation of an Item Unlock System for the untitled ECS-based game. The system allows players to use key items (tools/keys) to unlock, open, or interact with target objects through the existing interaction mechanism (E key). This feature enhances gameplay by introducing puzzle elements and tool-based progression.

## Goals

### Primary Objectives
- Enable items to unlock/interact with other items using the existing interaction system
- Support configurable key consumption (consumable vs reusable keys)
- Provide multiple unlock behaviors (transform, remove, spawn contents)
- Integrate seamlessly with the current ECS architecture and interaction patterns
- Enhance player engagement through tool-based puzzle mechanics

### Business Value
- Adds depth to gameplay through puzzle-solving mechanics
- Creates opportunities for progression gating and level design
- Establishes foundation for inventory and tool-based gameplay
- Improves player retention through varied interaction types

## User Stories

### US-001: Basic Key-Target Interaction
**As a** player  
**I want to** use a key item to unlock a target object  
**So that** I can access new content or progress through the game  

**Acceptance Criteria:**
- When I carry a valid key item and press E near a compatible target, the unlock action occurs
- The system automatically selects the correct key from my inventory if I have multiple items
- Visual/audio feedback confirms successful unlock attempts
- Invalid key attempts play error sound and show no visual change

### US-002: Configurable Key Consumption
**As a** game designer  
**I want to** configure whether keys are consumed on use  
**So that** I can balance gameplay and create different key types  

**Acceptance Criteria:**
- Reusable keys (like drawer keys) remain in inventory after use
- Consumable keys (like crowbars) are removed from inventory after successful use
- Key consumption behavior is defined per key-target pair
- Player receives appropriate feedback when keys are consumed

### US-003: Multiple Unlock Behaviors
**As a** player  
**I want** different types of unlock behaviors  
**So that** the game world feels varied and realistic  

**Acceptance Criteria:**
- Transform behavior: Target changes sprite/state (door closes/opens, chest opens/closes)
- Destroy behavior: Target is permanently changed and cannot revert
- Content behavior: Target spawns items at its location when unlocked
- State persistence: Some targets remember their state, others reset

### US-004: Automatic Key Selection
**As a** player  
**I want** the game to automatically use the correct key  
**So that** I don't need to manually manage which key to use  

**Acceptance Criteria:**
- System scans player's carried items for valid keys
- First matching key is automatically selected and used
- Player doesn't need to manually select keys from inventory
- System prioritizes keys based on defined order if multiple match

### US-005: Audio Feedback System
**As a** player  
**I want** audio feedback for unlock attempts  
**So that** I understand the result of my interactions  

**Acceptance Criteria:**
- Success sound plays when unlock succeeds
- Error sound plays when no valid key is available
- Different sound effects for different unlock types (open, break, etc.)
- Sound volume respects game audio settings

## Functional Requirements

### FR-001: Component Architecture
- **UnlockableComponent**: Defines what keys can unlock this entity and unlock behavior
- **KeyItemComponent**: Marks items as keys with unlock capabilities
- **UnlockedStateComponent**: Tracks current unlock state of entities

### FR-002: Unlock System Integration
- New **UnlockSystem** processes interaction attempts between players and unlockable entities
- System integrates with existing **InteractingComponent** from KeyboardInputSystem
- System runs after PickupSystem but before CleanUpSystem in game loop

### FR-003: Key-Target Relationships
- Simple component-based approach: UnlockableComponent lists accepted key types
- Key types identified by string identifiers (e.g., "house_key", "crowbar", "swipecard")
- One-to-many relationship: single key can unlock multiple target types
- Many-to-one relationship: multiple keys can unlock same target type

### FR-004: Unlock Behaviors
- **Transform**: Changes entity sprite, can be reversible or permanent
- **Remove**: Removes target entity from game world
- **SpawnContents**: Creates new entities at target location
- **Composite**: Combines multiple behaviors (transform + spawn contents)

### FR-005: State Management
- Unlockable entities track their current state (locked/unlocked)
- Some entities support state toggling (doors, drawers)
- Others are permanent state changes (broken locks, destroyed barriers)
- State persistence handled through component data

### FR-006: Audio Integration
- Success sound: "unlock_success.wav" 
- Error sound: "unlock_failed.wav"
- Specific sounds per behavior type: "door_open.wav", "chest_open.wav", "break_wood.wav"
- Audio system integration through existing game audio framework

## Non-Goals
- Complex key combination requirements (multiple keys for single target)
- Inventory management UI (keys managed through existing CarriedItem system)
- Lock-picking mini-games or skill checks
- Durability system for keys (separate from consumption)
- Real-time multiplayer unlock synchronization

## Design Considerations

### UI/UX Requirements
- No new UI elements required - uses existing interaction patterns
- Visual indicators through sprite changes and animation
- Audio feedback provides primary user feedback
- Consistent with existing game's minimalist interface approach

### Visual Feedback
- Unlockable items may have visual indicators (keyhole sprites, padlock overlays)
- Successful unlocks trigger sprite transitions
- Failed attempts have brief visual feedback (shake animation, color flash)
- State changes are persistent and visually clear

## Technical Considerations

### Performance Requirements
- System processes only entities with InteractingComponent (minimal performance impact)
- Key lookup algorithms optimized for small inventory sizes (1-5 items typical)
- Audio loading/caching handled efficiently for responsive feedback
- No frame rate impact during unlock operations

### Security Considerations
- Not applicable - single player game with local state

### Scalability Needs
- Component system scales linearly with entity count
- Key-target definitions support unlimited combinations
- Audio system handles concurrent sound playback
- Entity state changes integrate with existing save/load systems

### Integration Points
- **KeyboardInputSystem**: Triggers InteractingComponent
- **PickupSystem**: Manages key item inventory
- **RenderSystem**: Handles sprite changes for visual feedback
- **Audio System**: Plays feedback sounds (to be implemented/integrated)

## Success Metrics

### Measurable Outcomes
- **Functionality**: 100% of defined key-target pairs work correctly
- **Performance**: No measurable frame rate impact during unlock operations  
- **User Experience**: Audio feedback plays within 100ms of interaction
- **Code Quality**: All components follow existing ECS patterns and conventions

### Key Performance Indicators
- Zero critical bugs related to unlock system in testing
- Successful integration with existing systems without breaking changes
- Code review approval from team members
- Performance benchmarks within acceptable ranges

## Open Questions

### Technical Implementation
1. **Audio System Architecture**: How should audio be integrated with the existing Pixi.js setup?
   - Should we use Web Audio API directly or add an audio library?
   - How do we handle audio asset loading and management?

2. **Save/Load Integration**: How should unlock states persist across game sessions?
   - Should UnlockedStateComponent data be included in save files?
   - How do we handle version compatibility for save data?

3. **Animation System**: Should unlock actions trigger animations?
   - Do we need an animation component system for smooth transitions?
   - How complex should the visual feedback be?

### Design Decisions
1. **Key Identification**: Should keys use display names or internal IDs?
   - Example: "House Key" vs "house_key_001"
   - Impact on localization and content management

2. **Multiple Key Types**: How should priority be handled when multiple keys work?
   - FIFO from inventory order?
   - Predefined priority system?
   - Most recently acquired?

3. **Error Handling**: What happens with edge cases?
   - Player has key but target is already unlocked?
   - Key becomes invalid due to game state changes?
   - Target entity is removed while player has compatible key?

## Implementation Examples

### Component Definitions

```typescript
// UnlockableComponent: Attached to entities that can be unlocked
export interface UnlockableComponentProps {
  acceptedKeys: string[];          // Keys that can unlock this entity
  unlockBehavior: UnlockBehavior;  // What happens when unlocked
  isReversible: boolean;           // Can this be locked again?
  isUnlocked: boolean;             // Current state
  consumeKeyOnUse: boolean;        // Whether to remove key after use
}

// KeyItemComponent: Attached to items that can unlock things
export interface KeyItemComponentProps {
  keyType: string;                 // Identifier for this key type
  canUnlock: string[];             // Optional: specific targets this key works on
}

// UnlockBehavior: Defines what happens during unlock
export interface UnlockBehavior {
  type: 'transform' | 'remove' | 'spawnContents' | 'composite';
  transformSprite?: string;        // New sprite for transform behavior
  spawnItems?: EntityTemplate[];   // Items to spawn for spawnContents behavior
  permanentChange?: boolean;       // Whether this change can be reverted
}
```

### Entity Template Examples

```typescript
// Drawer that can be opened with a key
export const LockedDrawer: EntityTemplate = {
  components: {
    sprite: { sprite: 'drawer_closed' },
    unlockable: {
      acceptedKeys: ['drawer_key'],
      unlockBehavior: {
        type: 'transform',
        transformSprite: 'drawer_open',
        permanentChange: false
      },
      isReversible: true,
      isUnlocked: false,
      consumeKeyOnUse: false
    }
  }
};

// Door that breaks when opened with crowbar
export const WoodenDoor: EntityTemplate = {
  components: {
    sprite: { sprite: 'door_closed' },
    unlockable: {
      acceptedKeys: ['crowbar'],
      unlockBehavior: {
        type: 'transform',
        transformSprite: 'door_broken',
        permanentChange: true
      },
      isReversible: false,
      isUnlocked: false,
      consumeKeyOnUse: true
    }
  }
};

// Chest that contains items
export const TreasureChest: EntityTemplate = {
  components: {
    sprite: { sprite: 'chest_closed' },
    unlockable: {
      acceptedKeys: ['chest_key', 'master_key'],
      unlockBehavior: {
        type: 'composite',
        transformSprite: 'chest_open',
        spawnItems: [
          { components: { sprite: { sprite: 'gold_coin' }, pickable: {} } },
          { components: { sprite: { sprite: 'potion' }, pickable: {} } }
        ],
        permanentChange: false
      },
      isReversible: true,
      isUnlocked: false,
      consumeKeyOnUse: false
    }
  }
};

// Key items
export const DrawerKey: EntityTemplate = {
  components: {
    sprite: { sprite: 'key_bronze' },
    pickable: {},
    keyItem: {
      keyType: 'drawer_key',
      canUnlock: ['drawer', 'cabinet']
    }
  }
};

export const Crowbar: EntityTemplate = {
  components: {
    sprite: { sprite: 'crowbar' },
    pickable: {},
    keyItem: {
      keyType: 'crowbar',
      canUnlock: ['door', 'crate', 'barrier']
    }
  }
};
```

### System Implementation Outline

```typescript
export class UnlockSystem implements System {
  update({ entities }: UpdateArgs) {
    // 1. Find all players with InteractingComponent
    // 2. For each interacting player:
    //    a. Get player's position and carried items
    //    b. Find unlockable entities at player's position
    //    c. Check player's inventory for valid keys
    //    d. If valid key found:
    //       - Execute unlock behavior
    //       - Play success sound
    //       - Consume key if required
    //    e. If no valid key:
    //       - Play error sound
    //       - No other changes
  }
  
  private findValidKey(carriedItems: Entity[], acceptedKeys: string[]): Entity | null {
    // Search through carried items for first matching key
  }
  
  private executeUnlockBehavior(target: Entity, behavior: UnlockBehavior): void {
    // Handle transform, remove, spawnContents, and composite behaviors
  }
  
  private playUnlockSound(success: boolean, behaviorType?: string): void {
    // Play appropriate audio feedback
  }
}
```

This PRD provides a comprehensive specification that can be implemented by a junior developer familiar with the existing ECS architecture while maintaining compatibility with current systems and following established patterns.

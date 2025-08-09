# Item Pickup System

## Feature Overview

The Item Pickup System allows players to collect and carry items found throughout the game world. Players can pick up
various objects, carry them in their inventory, and place them back down when needed. The system provides visual
feedback by displaying carried items in a sidebar interface.

## Key Concepts

### Pickable Items

Items marked as pickable can be collected by the player. These items include:

- **Beakers** (blue bottles) - Collectible consumables found in the world
- **Keys** (gold keys) - Special items used to unlock doors and chests
- **Bottles** (red and blue) - Various collectible items that can spawn from chests

### Inventory Management

The player can carry **one item at a time**. When carrying an item:

- The item disappears from the game world
- The item appears in the sidebar inventory display
- The player can place the item back into the world

### Sidebar Display

Carried items are visually represented in a dedicated sidebar area that:

- Shows the sprite/image of the currently carried item
- Provides immediate visual feedback about what the player is holding
- Updates in real-time as items are picked up and placed

## How It Works

### Picking Up Items

1. **Navigate** to an item that can be picked up (items with a pickable indicator)
2. **Press the Spacebar** while standing on or next to the item
3. The item will disappear from the world and appear in your sidebar inventory
4. You can now move around while carrying the item

### Placing Items

1. **Navigate** to where you want to place your carried item
2. **Press the Spacebar** while carrying an item
3. The item will be placed at your current position
4. The item disappears from your sidebar and reappears in the world

### Visual Feedback

- **Sidebar Inventory**: Shows the sprite of your currently carried item
- **Console Logging**: Provides confirmation messages when items are picked up
- **Real-time Updates**: The sidebar immediately reflects inventory changes

## Usage Examples

### Basic Item Collection

```
Player walks to a beaker → Presses Spacebar → Beaker appears in sidebar
```

### Using Keys

```
Player picks up key → Walks to locked door → Uses key through interaction system
```

### Inventory Management

```
Player carrying beaker → Walks to new location → Presses Spacebar → Beaker placed at new location
```

### Chest Exploration

```
Player unlocks chest → Multiple bottles spawn → Player picks up bottles one at a time
```

## Important Notes

- **Single Item Limit**: You can only carry one item at a time
- **Automatic Placement**: Items are automatically placed at your current position
- **Visual Confirmation**: The sidebar provides immediate visual feedback
- **World Integration**: Placed items become part of the game world again and can be picked up by walking over them

The Item Pickup System seamlessly integrates with other game systems like the Item Interaction System, allowing
picked-up items to be used for unlocking doors, opening chests, and other interactive behaviors.
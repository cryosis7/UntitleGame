# Sidebar Rendering System

## Feature Overview

The Sidebar Rendering System provides a dedicated UI area for displaying carried items and other important game elements. This system creates a visual inventory interface that shows items the player has picked up, helping players track their possessions and manage their inventory during gameplay.

## Key Concepts

### Inventory Display
The sidebar acts as a visual inventory panel that displays items carried by the player. Items appear as sprites within the sidebar area, providing immediate visual feedback about what the player currently possesses.

### Component-Based Rendering
The system uses two primary components to control what appears in the sidebar:
- **Carried Items**: Items that the player has picked up and is currently carrying
- **Sidebar Markers**: Special indicators that determine which entities should be displayed in the sidebar UI

### UI Layout
The sidebar appears as a fixed-width panel (150 pixels) positioned on the right side of the game screen. It features a light gray background and automatically scales to match the game canvas height, providing a consistent visual separation from the main game area.

## How It Works

### Item Collection and Display
When players interact with pickable items in the game world:

1. **Item Pickup**: The pickup system removes items from the game map and converts them to carried items
2. **Inventory Tracking**: Items become part of the player's inventory through the CarriedItem component
3. **Visual Representation**: Items marked for sidebar display appear as sprites within the sidebar interface
4. **Real-Time Updates**: The sidebar updates automatically whenever the player's inventory changes

### Rendering Process
The sidebar rendering follows a structured process:

1. **Entity Filtering**: The system identifies all entities that should appear in the sidebar
2. **Sprite Management**: Creates and manages sprite representations for each sidebar item
3. **Position Calculation**: Arranges items within the sidebar layout using grid-based positioning
4. **Visual Updates**: Continuously updates the display as items are added or removed

### Integration with Game Systems
The sidebar rendering integrates seamlessly with other game systems:

- **Pickup System**: Automatically receives items when they're collected from the game world
- **Interaction System**: May display items that can be used for interactions with game objects
- **Rendering Pipeline**: Operates alongside main game rendering without performance conflicts

## Usage Examples

### Basic Inventory Display
When a player picks up a key from the game world:
- The key disappears from its original map location
- The key sprite appears in the sidebar inventory area
- The sidebar maintains the key's visual representation for easy identification
- Players can see at a glance that they possess the key for future use

### Multiple Item Management
As players collect various items:
- Each item appears as a separate sprite in the sidebar
- Items are arranged systematically within the sidebar space
- The visual layout helps players quickly identify different item types
- The sidebar provides a centralized view of all carried possessions

### Interactive Inventory
The sidebar serves as more than just a display:
- Items shown in the sidebar represent usable inventory
- Players can reference the sidebar to understand what items they have available
- The visual feedback helps inform decisions about item usage and interaction
- The sidebar maintains consistent item representation across different game states

## Current Implementation Notes

The Sidebar Rendering System is designed to work with items that have specific component markers for sidebar display. The system architecture supports automatic inventory management, though the complete integration between item pickup and sidebar display may require additional configuration to ensure all carried items appear in the sidebar interface.

The system provides a solid foundation for inventory management and can be extended to support additional features like item sorting, quantity display, or interactive inventory manipulation as the game evolves.

---

**Feature Type**: UI System  
**Dependencies**: Pickup System, Rendering Pipeline  
**Last Updated**: August 2025
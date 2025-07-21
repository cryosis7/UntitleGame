import type { System, UpdateArgs } from './Systems';
import type { Entity } from '../utils/ecsUtils';
import { ComponentType } from '../components/ComponentTypes';
import { getEntitiesWithComponents, removeEntities, addEntities } from '../utils/EntityUtils';
import { getComponentIfExists, setComponent, removeComponent } from '../components/ComponentOperations';
import type { RequiresItemComponent } from '../components/individualComponents/RequiresItemComponent';
import type { UsableItemComponent } from '../components/individualComponents/UsableItemComponent';
import type { CarriedItemComponent } from '../components/individualComponents/CarriedItemComponent';
import type { InteractionBehaviorComponent } from '../components/individualComponents/InteractionBehaviorComponent';
import type { SpawnContentsComponent } from '../components/individualComponents/SpawnContentsComponent';
import type { SpriteComponent } from '../components/individualComponents/SpriteComponent';
import { InteractionBehaviorType } from '../components/individualComponents/InteractionBehaviorType';
import { createEntitiesFromTemplates } from '../utils/EntityFactory';
import { PositionComponent } from '../components/individualComponents/PositionComponent';

/**
 * ItemInteractionSystem handles interactions between entities that require items
 * and entities that provide usable items. It processes capability matching,
 * item consumption, and interaction behaviors.
 */
export class ItemInteractionSystem implements System {
  /**
   * Updates the item interaction system, processing all active interactions
   * between entities that require items and entities that provide items.
   * 
   * @param args - Update arguments containing entities array
   */
  update(args: UpdateArgs): void {
    const { entities } = args;
    
    // Process all current interactions
    this.processInteractions(entities);
  }

  /**
   * Processes all active interactions between entities.
   * Finds entities that are currently interacting and validates their capabilities.
   * 
   * @param entities - Array of all entities to process
   * @private
   */
  private processInteractions(entities: Entity[]): void {
    // Get all entities that are currently in an interacting state
    const interactingEntities = getEntitiesWithComponents([ComponentType.Interacting], entities);
    
    for (const entity of interactingEntities) {
      // Find entities that require items and are currently interacting
      const requiresItemEntities = this.findRequiredItemEntities(entities, entity);
      
      // Process each requirement
      for (const requiredEntity of requiresItemEntities) {
        this.validateCapabilities(entity, requiredEntity, entities);
      }
    }
  }

  /**
   * Finds entities that require items and are associated with the current interaction.
   * This method will be expanded to handle proximity-based or direct interaction logic.
   * 
   * @param entities - Array of all entities
   * @param interactingEntity - The entity currently interacting
   * @returns Array of entities that require items for interaction
   * @private
   */
  private findRequiredItemEntities(entities: Entity[], interactingEntity: Entity): Entity[] {
    // For now, return entities with RequiresItem component that are nearby or associated
    // This will be expanded with proximity logic and interaction targeting
    return getEntitiesWithComponents([ComponentType.RequiresItem], entities)
      .filter(entity => {
        const requiresComponent = getComponentIfExists(entity, ComponentType.RequiresItem) as RequiresItemComponent;
        return requiresComponent?.isActive;
      });
  }

  /**
   * Validates that the interacting entity has items with capabilities that match
   * the requirements of the target entity.
   * 
   * @param interactingEntity - The entity performing the interaction
   * @param requiredEntity - The entity that requires items
   * @param entities - Array of all entities (for finding carried items)
   * @private
   */
  private validateCapabilities(interactingEntity: Entity, requiredEntity: Entity, entities: Entity[]): void {
    // Get the requirements from the target entity
    const requiresComponent = getComponentIfExists(requiredEntity, ComponentType.RequiresItem) as RequiresItemComponent;
    if (!requiresComponent?.isActive) return;

    // Find a compatible item carried by the interacting entity
    const compatibleItem = this.findCompatibleItem(interactingEntity, requiresComponent.requiredCapabilities, entities);
    
    if (compatibleItem) {
      // Capability match found - interaction can proceed
      console.log(`Compatible item found for interaction: ${compatibleItem.id} with capabilities matching ${requiresComponent.requiredCapabilities.join(', ')}`);
      
      // Process the interaction behavior
      this.processBehavior(requiredEntity, compatibleItem, entities);
      
      // Handle item consumption after successful interaction
      this.handleItemConsumption(interactingEntity, compatibleItem);
    }
  }

  /**
   * Finds a compatible item in the player's inventory that has the required capabilities.
   * Uses array intersection logic to match UsableItem capabilities with RequiresItem requirements.
   * 
   * @param interactingEntity - The entity that is interacting (should have CarriedItemComponent if carrying items)
   * @param requiredCapabilities - Array of capabilities that are required for the interaction
   * @param entities - Array of all entities to search through
   * @returns The first compatible item entity found, or null if none found
   * @private
   */
  private findCompatibleItem(interactingEntity: Entity, requiredCapabilities: string[], entities: Entity[]): Entity | null {
    // Get the carried item component from the interacting entity
    const carriedItemComponent = getComponentIfExists(interactingEntity, ComponentType.CarriedItem) as CarriedItemComponent;
    
    // Handle edge case: no carried items
    if (!carriedItemComponent) {
      console.log('No carried items found for interaction');
      return null;
    }

    // Find the actual item entity that is being carried
    const carriedItemEntity = entities.find(entity => entity.id === carriedItemComponent.item);
    
    // Handle edge case: carried item entity not found
    if (!carriedItemEntity) {
      console.log('Carried item entity not found in entities array');
      return null;
    }

    // Check if the carried item has the UsableItem component
    const usableComponent = getComponentIfExists(carriedItemEntity, ComponentType.UsableItem) as UsableItemComponent;
    
    // Handle edge case: carried item is not usable
    if (!usableComponent) {
      console.log('Carried item does not have UsableItem component');
      return null;
    }

    // Check if any of the item's capabilities match the required capabilities (array intersection)
    const hasMatchingCapability = usableComponent.capabilities.some(capability => 
      requiredCapabilities.includes(capability)
    );

    if (hasMatchingCapability) {
      console.log(`Found compatible item with matching capabilities: ${usableComponent.capabilities.filter(cap => requiredCapabilities.includes(cap)).join(', ')}`);
      return carriedItemEntity;
    }

    // Handle edge case: no compatible capabilities
    console.log('No compatible capabilities found between carried item and requirements');
    return null;
  }

  /**
   * Processes the interaction behavior for a target entity based on its InteractionBehaviorComponent.
   * Handles TRANSFORM, REMOVE, and SPAWN_CONTENTS behavior types.
   * 
   * @param targetEntity - The entity that will be affected by the interaction behavior
   * @param compatibleItem - The item entity that enabled this interaction
   * @param entities - Array of all entities (needed for spawn operations)
   * @private
   */
  private processBehavior(targetEntity: Entity, compatibleItem: Entity, entities: Entity[]): void {
    // Get the interaction behavior component from the target entity
    const behaviorComponent = getComponentIfExists(targetEntity, ComponentType.InteractionBehavior) as InteractionBehaviorComponent;
    
    if (!behaviorComponent) {
      console.log('Target entity does not have InteractionBehavior component');
      return;
    }

    console.log(`Processing behavior: ${behaviorComponent.behaviorType} for entity ${targetEntity.id}`);

    switch (behaviorComponent.behaviorType) {
      case InteractionBehaviorType.TRANSFORM:
        this.processBehaviorTransform(targetEntity, behaviorComponent);
        break;
      
      case InteractionBehaviorType.REMOVE:
        this.processBehaviorRemove(targetEntity);
        break;
      
      case InteractionBehaviorType.SPAWN_CONTENTS:
        this.processBehaviorSpawnContents(targetEntity, entities);
        break;
      
      default:
        console.log(`Unknown behavior type: ${behaviorComponent.behaviorType}`);
    }
  }

  /**
   * Handles TRANSFORM behavior - updates sprite and deactivates RequiresItem component.
   * 
   * @param targetEntity - The entity to transform
   * @param behaviorComponent - The behavior component with transformation details
   * @private
   */
  private processBehaviorTransform(targetEntity: Entity, behaviorComponent: InteractionBehaviorComponent): void {
    // Update sprite component if newSpriteId is provided
    if (behaviorComponent.newSpriteId) {
      const spriteComponent = getComponentIfExists(targetEntity, ComponentType.Sprite) as SpriteComponent;
      if (spriteComponent) {
        // Update the sprite's texture/label to the new sprite
        (spriteComponent.sprite as any).texture = { label: behaviorComponent.newSpriteId };
        console.log(`Transformed entity sprite to: ${behaviorComponent.newSpriteId}`);
      } else {
        console.log('Warning: Entity does not have Sprite component for TRANSFORM behavior');
      }
    }

    // Deactivate the RequiresItem component to prevent further interactions
    const requiresComponent = getComponentIfExists(targetEntity, ComponentType.RequiresItem) as RequiresItemComponent;
    if (requiresComponent) {
      requiresComponent.isActive = false;
      console.log('Deactivated RequiresItem component after transformation');
    }
  }

  /**
   * Handles REMOVE behavior - removes entity from game world.
   * 
   * @param targetEntity - The entity to remove
   * @private
   */
  private processBehaviorRemove(targetEntity: Entity): void {
    console.log(`Removing entity ${targetEntity.id} from game world`);
    removeEntities([targetEntity.id]);
  }

  /**
   * Handles SPAWN_CONTENTS behavior - removes entity and creates new entities from SpawnContentsComponent.
   * 
   * @param targetEntity - The entity to remove and replace with contents
   * @param entities - Array of all entities for position calculations
   * @private  
   */
  private processBehaviorSpawnContents(targetEntity: Entity, entities: Entity[]): void {
    const spawnComponent = getComponentIfExists(targetEntity, ComponentType.SpawnContents) as SpawnContentsComponent;
    
    if (!spawnComponent) {
      console.log('Warning: Entity has SPAWN_CONTENTS behavior but no SpawnContentsComponent');
      return;
    }

    // Get the position of the target entity for spawning new entities
    const targetPosition = getComponentIfExists(targetEntity, ComponentType.Position) as PositionComponent;
    if (!targetPosition) {
      console.log('Warning: Cannot spawn contents - target entity has no Position component');
      return;
    }

    // Calculate spawn positions with offset
    const spawnOffset = spawnComponent.spawnOffset || { x: 0, y: 0 };
    const spawnPosition = {
      x: targetPosition.x + spawnOffset.x,
      y: targetPosition.y + spawnOffset.y
    };

    console.log(`Spawning ${spawnComponent.contents.length} entities at position (${spawnPosition.x}, ${spawnPosition.y})`);

    // Create new entities from templates
    const newEntities = createEntitiesFromTemplates(...spawnComponent.contents);
    
    // Set position for each new entity
    newEntities.forEach((entity, index) => {
      // For multiple entities, spawn them in a line or pattern
      const offsetIndex = Math.floor(index / 2); // Every 2 entities move to next position
      const position = new PositionComponent({
        x: spawnPosition.x + offsetIndex,
        y: spawnPosition.y + (index % 2) // Alternate y position for visual separation
      });
      setComponent(entity, position);
    });

    // Add the new entities to the game
    addEntities(newEntities);

    // Remove the original entity
    console.log(`Removing original entity ${targetEntity.id} after spawning contents`);
    removeEntities([targetEntity.id]);
  }

  /**
   * Handles item consumption logic after successful interaction.
   * Removes consumable items from player CarriedItemComponent and retains non-consumable items.
   * 
   * @param interactingEntity - The entity that performed the interaction (should have CarriedItemComponent)
   * @param usedItem - The item entity that was used in the interaction
   * @private
   */
  private handleItemConsumption(interactingEntity: Entity, usedItem: Entity): void {
    // Check if the used item is consumable
    const usableComponent = getComponentIfExists(usedItem, ComponentType.UsableItem) as UsableItemComponent;
    
    if (!usableComponent) {
      console.log('Warning: Used item does not have UsableItem component');
      return;
    }

    console.log(`Processing item consumption for ${usedItem.id}, consumable: ${usableComponent.isConsumable}`);

    if (usableComponent.isConsumable) {
      // Remove the consumable item from player's inventory
      const carriedItemComponent = getComponentIfExists(interactingEntity, ComponentType.CarriedItem) as CarriedItemComponent;
      
      if (carriedItemComponent && carriedItemComponent.item === usedItem.id) {
        console.log(`Removing consumable item ${usedItem.id} from player inventory`);
        
        // Remove the CarriedItemComponent from the player
        removeComponent(interactingEntity, ComponentType.CarriedItem);
        
        // Remove the item entity from the game world (it was consumed)
        removeEntities([usedItem.id]);
        
        console.log(`Consumable item ${usedItem.id} has been consumed and removed from game`);
      } else {
        console.log('Warning: Carried item component not found or item ID mismatch during consumption');
      }
    } else {
      // Non-consumable item - retain in inventory for future use
      console.log(`Retaining non-consumable item ${usedItem.id} in player inventory for future use`);
    }
  }
}

import type { System, UpdateArgs } from './Systems';
import type { Entity } from '../utils/ecsUtils';
import { ComponentType } from '../components/ComponentTypes';
import { getEntitiesWithComponents } from '../utils/EntityUtils';
import { getComponentIfExists } from '../components/ComponentOperations';
import type { RequiresItemComponent } from '../components/individualComponents/RequiresItemComponent';
import type { UsableItemComponent } from '../components/individualComponents/UsableItemComponent';
import type { CarriedItemComponent } from '../components/individualComponents/CarriedItemComponent';

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
      // This will be expanded with behavior processing and item consumption in later tasks
      console.log(`Compatible item found for interaction: ${compatibleItem.id} with capabilities matching ${requiresComponent.requiredCapabilities.join(', ')}`);
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
}

import type { System, UpdateArgs } from './Systems';
import type { Entity } from '../utils/ecsUtils';
import { ComponentType } from '../components/ComponentTypes';
import { getEntitiesWithComponents } from '../utils/EntityUtils';
import { getComponentIfExists, hasComponent } from '../components/ComponentOperations';
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
    if (!requiresComponent) return;

    // For now, we'll find carried items by checking all entities for CarriedItemComponent
    // that reference items carried by this interacting entity
    // This is a placeholder - actual implementation may use different patterns
    const carriedItemEntities = entities.filter(entity => {
      const carriedComponent = getComponentIfExists(entity, ComponentType.CarriedItem) as CarriedItemComponent;
      return carriedComponent && hasComponent(interactingEntity, ComponentType.Player);
    });

    // Find usable item entities that match the carried item references
    const usableItems = entities.filter(entity => {
      const hasUsableComponent = hasComponent(entity, ComponentType.UsableItem);
      const isCarried = carriedItemEntities.some(carried => {
        const carriedComponent = getComponentIfExists(carried, ComponentType.CarriedItem) as CarriedItemComponent;
        return carriedComponent?.item === entity.id;
      });
      return hasUsableComponent && isCarried;
    });

    // Check if any carried items meet the requirements
    // This will be expanded with actual capability matching logic
    for (const usableItemEntity of usableItems) {
      const usableComponent = getComponentIfExists(usableItemEntity, ComponentType.UsableItem) as UsableItemComponent;
      if (!usableComponent) continue;

      // Basic capability matching - will be expanded
      const hasMatchingCapability = usableComponent.capabilities.some(capability => 
        requiresComponent.requiredCapabilities.includes(capability)
      );

      if (hasMatchingCapability) {
        // Capability match found - interaction can proceed
        // This will be expanded with behavior processing and item consumption
        break;
      }
    }
  }
}

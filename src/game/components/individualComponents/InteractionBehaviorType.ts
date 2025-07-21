/**
 * Enum defining the types of interaction behaviors that can occur when an entity interaction is triggered.
 * These behaviors determine what happens to the target entity after a successful item-based interaction.
 */
export enum InteractionBehaviorType {
  /**
   * Transform the entity's appearance by changing its sprite component.
   * Used for scenarios like opening doors, activating switches, etc.
   */
  TRANSFORM = 'transform',

  /**
   * Remove the entity completely from the game world.
   * Used for scenarios like destroying barriers, consuming items, etc.
   */
  REMOVE = 'remove',

  /**
   * Remove the entity and spawn new entities in its place based on SpawnContentsComponent.
   * Used for scenarios like opening chests, breaking containers, etc.
   */
  SPAWN_CONTENTS = 'spawn_contents',
}

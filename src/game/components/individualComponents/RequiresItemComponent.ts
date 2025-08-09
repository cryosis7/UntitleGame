import { ComponentType } from '../ComponentTypes';
import type { Direction } from './DirectionComponent';

export type RequiresItemComponentProps = {
  requiredCapabilities: string[];
  isActive?: boolean;
  interactionDirections: Direction[];
};

/**
 * Component that marks an entity as requiring specific item capabilities to interact with.
 * Entities with this component can only be interacted with when the player has
 * compatible items in their inventory.
 */
export class RequiresItemComponent {
  type = ComponentType.RequiresItem;
  requiredCapabilities: string[];
  isActive: boolean;
  interactionDirections: Direction[];

  constructor({
    requiredCapabilities,
    isActive = true,
    interactionDirections = ['up', 'down', 'left', 'right'],
  }: RequiresItemComponentProps) {
    this.requiredCapabilities = requiredCapabilities;
    this.isActive = isActive;
    this.interactionDirections = interactionDirections;
  }
}

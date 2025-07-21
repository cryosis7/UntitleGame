import { ComponentType } from '../ComponentTypes';

export type RequiresItemComponentProps = {
  requiredCapabilities: string[];
  isActive?: boolean;
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

  constructor({ requiredCapabilities, isActive = true }: RequiresItemComponentProps) {
    this.requiredCapabilities = requiredCapabilities;
    this.isActive = isActive;
  }
}

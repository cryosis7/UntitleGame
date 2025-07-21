import { ComponentType } from '../ComponentTypes';

export type UsableItemComponentProps = {
  capabilities: string[];
  isConsumable?: boolean;
};

/**
 * Component that defines the capabilities and consumption behavior of usable items.
 * Items with this component can be used to interact with entities that require
 * specific capabilities defined in their RequiresItemComponent.
 */
export class UsableItemComponent {
  type = ComponentType.UsableItem;
  capabilities: string[];
  isConsumable: boolean;

  constructor({ capabilities, isConsumable = true }: UsableItemComponentProps) {
    this.capabilities = capabilities;
    this.isConsumable = isConsumable;
  }
}

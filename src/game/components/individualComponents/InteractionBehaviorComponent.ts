import { ComponentType } from '../ComponentTypes';
import { InteractionBehaviorType } from './InteractionBehaviorType';

export type InteractionBehaviorComponentProps = {
  behaviorType: InteractionBehaviorType;
  newSpriteId?: string;
  isRepeatable?: boolean;
};

/**
 * Component that defines how an entity responds when interacted with using compatible items.
 * Determines the behavior type (transform, remove, spawn contents) and associated configuration.
 * Works in conjunction with RequiresItemComponent to enable item-based interactions.
 */
export class InteractionBehaviorComponent {
  type = ComponentType.InteractionBehavior;
  behaviorType: InteractionBehaviorType;
  newSpriteId?: string;
  isRepeatable: boolean;

  constructor({ behaviorType, newSpriteId, isRepeatable = false }: InteractionBehaviorComponentProps) {
    this.behaviorType = behaviorType;
    this.newSpriteId = newSpriteId;
    this.isRepeatable = isRepeatable;

    // Validate that newSpriteId is provided when using TRANSFORM behavior
    if (behaviorType === InteractionBehaviorType.TRANSFORM && !newSpriteId) {
      throw new Error('InteractionBehaviorComponent: newSpriteId is required when behaviorType is TRANSFORM');
    }
  }
}

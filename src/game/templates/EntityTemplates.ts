import { InteractionBehaviorType } from '../components';
import type { EntityTemplate } from '../utils/EntityFactory';

export const Player: EntityTemplate = {
  components: {
    sprite: { sprite: 'player' },
    player: {},
    velocity: { vx: 0, vy: 0 },
    direction: { direction: 'down' },
  },
};

export const Boulder: EntityTemplate = {
  components: {
    sprite: { sprite: 'boulder' },
    movable: {},
  },
};

export const Beaker: EntityTemplate = {
  components: {
    sprite: { sprite: 'bottle_blue' },
    pickable: {},
  },
};

// Example interaction system entities

export const Key: EntityTemplate = {
  components: {
    sprite: { sprite: 'key_gold' },
    pickable: {},
    usableItem: {
      capabilities: ['unlock'],
      isConsumable: true,
    },
  },
};

export const Door: EntityTemplate = {
  components: {
    sprite: { sprite: 'boulder' },
    requiresItem: {
      requiredCapabilities: ['unlock'],
      isActive: true,
    },
    interactionBehavior: {
      behaviorType: InteractionBehaviorType.TRANSFORM,
      newSpriteId: 'dirt',
      isRepeatable: false,
    },
  },
};

export const Chest: EntityTemplate = {
  components: {
    sprite: { sprite: 'chest_closed' },
    requiresItem: {
      requiredCapabilities: ['unlock'],
      isActive: true,
    },
    interactionBehavior: {
      behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
      isRepeatable: false,
    },
    spawnContents: {
      contents: [
        {
          components: {
            sprite: { sprite: 'bottle_blue' },
            pickable: {},
          },
        },
        {
          components: {
            sprite: { sprite: 'bottle_red' },
            pickable: {},
          },
        },
      ],
      spawnOffset: { x: 1, y: 0 },
    },
  },
};

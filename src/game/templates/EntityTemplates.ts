import { InteractionBehaviorType } from '../components';
import type { EntityTemplate } from '../utils/EntityFactory';

export const Player: EntityTemplate = {
  components: {
    sprite: { sprite: 'player' },
    player: {},
    velocity: { vx: 0, vy: 0 },
    direction: { direction: 'down' },
    render: { section: 'game' },
  },
};

export const Boulder: EntityTemplate = {
  components: {
    sprite: { sprite: 'boulder' },
    movable: {},
    render: { section: 'game' },
  },
};

export const Beaker: EntityTemplate = {
  components: {
    sprite: { sprite: 'bottle_blue' },
    pickable: {},
    render: { section: 'game' },
  },
};

export const Key: EntityTemplate = {
  components: {
    sprite: { sprite: 'key_gold' },
    pickable: {},
    usableItem: {
      capabilities: ['unlock'],
      isConsumable: true,
    },
    render: { section: 'game' },
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
    render: { section: 'game' },
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
            render: { section: 'game' },
            pickable: {},
          },
        },
        {
          components: {
            sprite: { sprite: 'bottle_red' },
            render: { section: 'game' },
            pickable: {},
          },
        },
      ],
      spawnOffset: { x: 1, y: 0 },
    },
    render: { section: 'game' },
  },
};

export const HoverHighlight: EntityTemplate = {
  components: {
    hoverHighlight: { isVisible: false },
    render: { section: 'game' },
    position: { x: 0, y: 0 },
  },
};

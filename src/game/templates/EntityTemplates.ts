import { InteractionBehaviorType, RenderSection } from '../components';
import type { EntityTemplate } from '../utils/EntityFactory';

export const Player: EntityTemplate = {
  components: {
    sprite: { spriteName: 'player' },
    player: {},
    velocity: { vx: 0, vy: 0 },
    direction: { direction: 'down' },
    render: { section: RenderSection.Game },
  },
};

export const Boulder: EntityTemplate = {
  components: {
    sprite: { spriteName: 'boulder' },
    movable: {},
    render: { section: RenderSection.Game },
  },
};

export const Beaker: EntityTemplate = {
  components: {
    sprite: { spriteName: 'bottle_blue' },
    pickable: {},
    render: { section: RenderSection.Game },
  },
};

export const Key: EntityTemplate = {
  components: {
    sprite: { spriteName: 'key_gold' },
    pickable: {},
    usableItem: {
      capabilities: ['unlock'],
      isConsumable: true,
    },
    render: { section: RenderSection.Game },
  },
};

export const Door: EntityTemplate = {
  components: {
    sprite: { spriteName: 'boulder' },
    requiresItem: {
      requiredCapabilities: ['unlock'],
      isActive: true,
    },
    interactionBehavior: {
      behaviorType: InteractionBehaviorType.TRANSFORM,
      newSpriteId: 'dirt',
      isRepeatable: false,
    },
    render: { section: RenderSection.Game },
  },
};

export const Chest: EntityTemplate = {
  components: {
    sprite: { spriteName: 'chest_closed' },
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
            sprite: { spriteName: 'bottle_blue' },
            render: { section: RenderSection.Game },
            pickable: {},
          },
        },
        {
          components: {
            sprite: { spriteName: 'bottle_red' },
            render: { section: RenderSection.Game },
            pickable: {},
          },
        },
      ],
      spawnOffset: { x: 1, y: 0 },
    },
    render: { section: RenderSection.Game },
  },
};

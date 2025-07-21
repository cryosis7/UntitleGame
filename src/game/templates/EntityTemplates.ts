import type { EntityTemplate } from '../utils/EntityFactory';

export const Player: EntityTemplate = {
  components: {
    sprite: { sprite: 'player' },
    player: {},
    velocity: { vx: 0, vy: 0 },
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

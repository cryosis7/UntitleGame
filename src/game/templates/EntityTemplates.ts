import type { EntityTemplate } from '../utils/EntityFactory';

export const Player: EntityTemplate = {
  name: 'Player',
  components: {
    sprite: {
      type: 'sprite',
      sprite: 'player',
    },
    player: {
      type: 'player',
    },
    velocity: {
      type: 'velocity',
      vx: 0,
      vy: 0,
    },
  },
};

export const Boulder: EntityTemplate = {
  name: 'Boulder',
  components: {
    sprite: {
      type: 'sprite',
      sprite: 'boulder',
    },
    movable: {
      type: 'movable',
    },
  },
};

export const Beaker: EntityTemplate = {
  name: 'Beaker',
  components: {
    sprite: {
      type: 'sprite',
      sprite: 'bottle_blue',
    },
    pickable: {
      type: 'pickable',
    },
  },
};

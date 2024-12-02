import type { EntityTemplate } from '../utils/EntityFactory';

export const Player: EntityTemplate = {
  name: 'Player',
  components: {
    position: {
      type: 'position',
      x: 0,
      y: 0,
    },
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

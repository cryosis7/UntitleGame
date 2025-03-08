import type { EntityTemplate } from '../utils/EntityFactory';
import { ComponentType } from '../components/Components';

export const Player: EntityTemplate = {
  name: 'Player',
  components: [
    {
      type: 'sprite',
      sprite: 'player',
    },
    {
      type: 'player',
    },
    {
      type: 'velocity',
      vx: 0,
      vy: 0,
    },
  ],
};

export const Boulder: EntityTemplate = {
  name: 'Boulder',
  components: [
    {
      type: 'sprite',
      sprite: 'boulder',
    },
    {
      type: 'movable',
    },
  ],
};

export const Beaker: EntityTemplate = {
  name: 'Beaker',
  components: [
    {
      type: ComponentType.Sprite,
      sprite: 'bottle_blue',
    },
    {
      type: 'pickable',
    },
  ],
};

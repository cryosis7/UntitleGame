import type { SpriteSheetJson } from 'pixi.js';

export const basicSpritesheet: SpriteSheetJson = {
  frames: {
    bottle_blue: {
      frame: {
        x: 1,
        y: 1,
        w: 16,
        h: 16,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 16,
        h: 16,
      },
      sourceSize: {
        w: 16,
        h: 16,
      },
    },
    bottle_red: {
      frame: {
        x: 19,
        y: 1,
        w: 16,
        h: 16,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 16,
        h: 16,
      },
      sourceSize: {
        w: 16,
        h: 16,
      },
    },
    chest_closed: {
      frame: {
        x: 1,
        y: 19,
        w: 16,
        h: 16,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 16,
        h: 16,
      },
      sourceSize: {
        w: 16,
        h: 16,
      },
    },
    chest_open: {
      frame: {
        x: 19,
        y: 19,
        w: 16,
        h: 16,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 16,
        h: 16,
      },
      sourceSize: {
        w: 16,
        h: 16,
      },
    },
    key_gold: {
      frame: {
        x: 37,
        y: 1,
        w: 16,
        h: 16,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 16,
        h: 16,
      },
      sourceSize: {
        w: 16,
        h: 16,
      },
    },
    keys_silver: {
      frame: {
        x: 37,
        y: 19,
        w: 16,
        h: 16,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 16,
        h: 16,
      },
      sourceSize: {
        w: 16,
        h: 16,
      },
    },
  },
  meta: {
    image: 'basicSpritesheet.png',
    //format: 'RGBA8888',
    // size: {
    //   w: 54,
    //   h: 36,
    // },
    scale: '1',
  },
};

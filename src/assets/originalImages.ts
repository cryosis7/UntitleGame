import type { SpriteSheetJson } from 'pixi.js';

export const originalImages: SpriteSheetJson = {
  frames: {
    beaker: {
      frame: {
        x: 1,
        y: 1,
        w: 280,
        h: 280,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 280,
        h: 280,
      },
      sourceSize: {
        w: 280,
        h: 280,
      },
    },
    boulder: {
      frame: {
        x: 283,
        y: 1,
        w: 1200,
        h: 1200,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 1200,
        h: 1200,
      },
      sourceSize: {
        w: 1200,
        h: 1200,
      },
    },
    dirt: {
      frame: {
        x: 1485,
        y: 1,
        w: 512,
        h: 512,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 512,
        h: 512,
      },
      sourceSize: {
        w: 512,
        h: 512,
      },
    },
    player: {
      frame: {
        x: 1,
        y: 1203,
        w: 640,
        h: 640,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 640,
        h: 640,
      },
      sourceSize: {
        w: 640,
        h: 640,
      },
    },
    wall: {
      frame: {
        x: 1,
        y: 515,
        w: 64,
        h: 64,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: 64,
        h: 64,
      },
      sourceSize: {
        w: 64,
        h: 64,
      },
    },
  },
  meta: {
    image: 'originalImages.png',
    // format: 'RGBA8888',
    // size: {
    //   w: 1998,
    //   h: 1844,
    // },
    scale: '1',
  },
};

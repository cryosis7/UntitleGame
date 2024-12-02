import { Application, Assets } from 'pixi.js';

export const pixiApp = new Application();

export const initPixiApp = async (appContainer: HTMLDivElement) => {
  await pixiApp.init({
    background: 'slategray',
    resizeTo: appContainer,
  });
  appContainer.appendChild(pixiApp.canvas);
  // @ts-ignore
  globalThis.__PIXI_APP__ = pixiApp;
};

export const preload = async () => {
  const assets = [
    {
      alias: 'wall',
      src: '/public/assets/images/wall.png',
    },
    {
      alias: 'dirt',
      src: '/public/assets/images/dirt.png',
    },
    {
      alias: 'player',
      src: '/public/assets/images/player.png',
    },
    {
      alias: 'boulder',
      src: '/public/assets/images/boulder.png',
    },
    {
      alias: 'beaker',
      src: '/public/assets/images/beaker.png',
    },
  ];

  await Assets.load(assets);
};

import { Application, Assets, Sprite } from 'pixi.js';
import { useEffect, useRef } from 'react';

export const pixiApp = new Application();

async function initApp(appContainer: HTMLDivElement) {
  await pixiApp.init({
    background: 'slategray',
    resizeTo: appContainer,
  });
  appContainer.appendChild(pixiApp.canvas);
}

async function preload() {
  const assets = [
    {
      alias: 'wall',
      src: '../../assets/wall.png',
    },
  ];

  await Assets.load(assets);
}

const addWalls = () => {
  const tileWidth = pixiApp.screen.width / 10;
  const tileHeight = pixiApp.screen.height / 10;
  const wallPositions: { x: number; y: number }[] = [];

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (Math.random() < 0.15) {
        wallPositions.push({ x: i * tileWidth, y: j * tileHeight });
      }
    }
  }

  wallPositions.forEach((pos) => {
    const wallSprite = Sprite.from('wall');
    wallSprite.width = tileWidth;
    wallSprite.height = tileHeight;
    wallSprite.position.set(pos.x, pos.y);
    pixiApp.stage.addChild(wallSprite);
  });
};
export const PixiStage = () => {
  const appRef = useRef<HTMLDivElement | null>(null);
  const hasInitialised = useRef(false);

  useEffect(() => {
    const appContainer = appRef.current;
    if (!appContainer || hasInitialised.current) {
      return;
    }

    (async () => {
      hasInitialised.current = true;
      await initApp(appContainer);
      await preload();

      addWalls();

      pixiApp.ticker.add((time) => {
        // animateFish(fishes);
        // animateWaterOverlay(overlay, time);
      });
    })();
  }, []);

  return <div ref={appRef} style={{ width: '500px', height: '500px' }} />;
};

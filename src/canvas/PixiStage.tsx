import type {
  Ticker} from 'pixi.js';
import {
  Application,
  Assets,
  Container,
  DisplacementFilter,
  Sprite,
  Texture,
  TilingSprite,
} from 'pixi.js';
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
      alias: 'background',
      src: 'https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg',
    },
    {
      alias: 'fish1',
      src: 'https://pixijs.com/assets/tutorials/fish-pond/fish1.png',
    },
    {
      alias: 'fish2',
      src: 'https://pixijs.com/assets/tutorials/fish-pond/fish2.png',
    },
    {
      alias: 'fish3',
      src: 'https://pixijs.com/assets/tutorials/fish-pond/fish3.png',
    },
    {
      alias: 'fish4',
      src: 'https://pixijs.com/assets/tutorials/fish-pond/fish4.png',
    },
    {
      alias: 'fish5',
      src: 'https://pixijs.com/assets/tutorials/fish-pond/fish5.png',
    },
    {
      alias: 'overlay',
      src: 'https://pixijs.com/assets/tutorials/fish-pond/wave_overlay.png',
    },
    {
      alias: 'displacement',
      src: 'https://pixijs.com/assets/tutorials/fish-pond/displacement_map.png',
    },
  ];

  await Assets.load(assets);
}

const addBackground = () => {
  const background = Sprite.from('background');
  background.anchor.set(0.5);
  if (pixiApp.screen.width > pixiApp.screen.height) {
    background.width = pixiApp.screen.width * 1.2;
    background.scale.y = background.scale.x;
  } else {
    background.height = pixiApp.screen.height * 1.2;
    background.scale.x = background.scale.y;
  }

  background.x = pixiApp.screen.width / 2;
  background.y = pixiApp.screen.height / 2;

  pixiApp.stage.addChild(background);
};

type Fish = Sprite & {
  direction: number;
  speed: number;
  turnSpeed: number;
};

const addFish = (fishList: Fish[] = []) => {
  const fishContainer = new Container();
  pixiApp.stage.addChild(fishContainer);

  const fishCount = 20;
  const fishAssets = ['fish1', 'fish2', 'fish3', 'fish4', 'fish5'];

  for (let i = 0; i < fishCount; i++) {
    const asset = fishAssets[i % fishAssets.length];
    const fish: Fish = Sprite.from(asset) as Fish;
    fish.anchor.set(0.5);
    fish.direction = Math.random() * Math.PI * 2;
    fish.speed = 2 + Math.random() * 2;
    fish.turnSpeed = Math.random() - 0.8;

    fish.x = Math.random() * pixiApp.screen.width;
    fish.y = Math.random() * pixiApp.screen.height;
    fish.scale.set(0.5 + Math.random() * 0.2);
    fishContainer.addChild(fish);
    fishList.push(fish);
  }

  return fishList;
};

const animateFish = (fishList: Fish[]) => {
  const stagePadding = 100;
  const boundWidth = pixiApp.screen.width + stagePadding * 2;
  const boundHeight = pixiApp.screen.height + stagePadding * 2;

  fishList.forEach((fish) => {
    fish.direction += fish.turnSpeed * 0.01;
    fish.x += Math.sin(fish.direction) * fish.speed;
    fish.y += Math.cos(fish.direction) * fish.speed;
    fish.rotation = -fish.direction - Math.PI / 2;

    if (fish.x < -stagePadding) {
      fish.x += boundWidth;
    }
    if (fish.x > pixiApp.screen.width + stagePadding) {
      fish.x -= boundWidth;
    }
    if (fish.y < -stagePadding) {
      fish.y += boundHeight;
    }
    if (fish.y > pixiApp.screen.height + stagePadding) {
      fish.y -= boundHeight;
    }
  });
};

const addWaterOverlay = () => {
  const texture = Texture.from('overlay');
  const overlay = new TilingSprite({
    texture,
    width: pixiApp.screen.width,
    height: pixiApp.screen.height,
  });
  pixiApp.stage.addChild(overlay);
  return overlay;
};

const animateWaterOverlay = (overlay: TilingSprite, time: Ticker) => {
  const delta = time.deltaTime;
  overlay.tilePosition.x -= delta;
  overlay.tilePosition.y -= delta;
};

const addDisplacementFilter = () => {
  const displacementFilter = Sprite.from('displacement');
  displacementFilter.texture.source.wrapMode = 'repeat';
  const filter = new DisplacementFilter({
    sprite: displacementFilter,
    scale: 50,
    width: pixiApp.screen.width,
    height: pixiApp.screen.height,
  });

  pixiApp.stage.filters = [filter];
};

const fishes: Fish[] = [];

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

      addBackground();
      addFish(fishes);
      const overlay = addWaterOverlay();
      addDisplacementFilter();

      pixiApp.ticker.add((time) => {
        animateFish(fishes);
        animateWaterOverlay(overlay, time);
      });
    })();
  }, []);

  return <div ref={appRef} />;
};

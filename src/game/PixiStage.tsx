import type { Ticker } from 'pixi.js';
import { Application, Assets, Sprite } from 'pixi.js';
import { useEffect, useRef } from 'react';
import {
  PlayerComponent,
  PositionComponent,
  SpriteComponent,
} from './components/Components';
import type { Entity } from './utils/ecsUtils';
import { createEntity, getComponent } from './utils/ecsUtils';
import { KeyboardInputSystem } from './systems/KeyboardInputSystem';
import type { System } from './systems/Systems';
import { RenderSystem } from './systems/RenderSystem';
import { GameMap } from './map/GameMap';

export const pixiApp = new Application();

async function initApp(appContainer: HTMLDivElement) {
  await pixiApp.init({
    background: 'slategray',
    resizeTo: appContainer,
  });
  appContainer.appendChild(pixiApp.canvas);
  globalThis.__PIXI_APP__ = pixiApp;
}

async function preload() {
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
  ];

  await Assets.load(assets);
}

const systems: System[] = [];
const entities: Entity[] = [];

// const createMap = () => {
//   const tiles: Tile[][] = [];

//   for (let y = 0; y < 10; y++) {
//     const row: Tile[] = [];
//     for (let x = 0; x < 10; x++) {
//       if (Math.random() < 0.85) {
//         row.push({ tileType: TileType.Dirt, sprite: Sprite.from('dirt') });
//       } else {
//         row.push({ tileType: TileType.Wall, sprite: Sprite.from('wall') });
//       }
//     }
//     tiles.push(row);
//   }
  
//   return tiles;
// };

const createPlayer = () => {
  let playerX: number;
  let playerY: number;
  let isOccupied: boolean;

  do {
    playerX = Math.floor(Math.random() * 10);
    playerY = Math.floor(Math.random() * 10);
    isOccupied = false;

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const positionComponent = getComponent<PositionComponent>(
        entity,
        'position',
      );
      if (
        positionComponent &&
        positionComponent.x === playerX &&
        positionComponent.y === playerY
      ) {
        isOccupied = true;
        break;
      }
    }
  } while (isOccupied);

  const player = createEntity([
    new PositionComponent(playerX, playerY),
    new SpriteComponent('player'),
    new PlayerComponent(),
  ]);
  entities.push(player);
};

const addEntities = () => {
  createPlayer();

  const tileWidth = pixiApp.screen.width / 10;
  const tileHeight = pixiApp.screen.height / 10;

  entities.forEach((entity) => {
    const positionComponent = getComponent<PositionComponent>(
      entity,
      'position',
    );
    const spriteComponent = getComponent<SpriteComponent>(entity, 'sprite');

    if (positionComponent && spriteComponent) {
      spriteComponent.sprite.width = tileWidth;
      spriteComponent.sprite.height = tileHeight;
      spriteComponent.sprite.position.set(
        positionComponent.x * tileWidth,
        positionComponent.y * tileHeight,
      );
      pixiApp.stage.addChild(spriteComponent.sprite);
    }
  });
};

const addSystems = () => {
  systems.push(new KeyboardInputSystem());
  systems.push(new RenderSystem());
};

const gameLoop = (ticker: Ticker, map: GameMap) => {
  systems.forEach((system) => {
    system.update({entities, time: ticker, map});
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

      const map = new GameMap();
      map.init(10, 10);
      pixiApp.stage.addChild(map.getSpriteContainer())

      addEntities();
      addSystems();

      pixiApp.ticker.add((time) => {
        gameLoop(time, map);
      });
    })();
  }, []);

  return <div ref={appRef} style={{ width: '500px', height: '500px' }} />;
};

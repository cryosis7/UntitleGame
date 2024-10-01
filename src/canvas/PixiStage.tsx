import type { Ticker } from 'pixi.js';
import { Application, Assets, Sprite } from 'pixi.js';
import { useEffect, useRef } from 'react';
import {
  PlayerComponent,
  PositionComponent,
  SpriteComponent,
} from '../models/ECS/Components';
import type { Entity} from '../utils/ecsUtils';
import { createEntity, getComponent } from '../utils/ecsUtils';
import { KeyboardInputSystem } from '../models/ECS/Systems/KeyboardInputSystem';
import type { System } from '../models/ECS/Systems/Systems';
import { RenderSystem } from '../models/ECS/Systems/RenderSystem';

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
      src: '../../assets/wall.png',
    },
    {
      alias: 'player',
      src: '../../assets/player.png',
    },
  ];

  await Assets.load(assets);
}

const systems: System[] = [];
const entities: Entity[] = [];

const createWalls = () => {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (Math.random() < 0.15) {
        const wall = createEntity([
          new PositionComponent(i, j),
          new SpriteComponent('wall'),
        ]);
        entities.push(wall);
      }
    }
  }
};

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
  createWalls();
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

const gameLoop = (ticker: Ticker) => {
  systems.forEach((system) => {
    system.update(entities, ticker);
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

      addEntities();
      addSystems();

      pixiApp.ticker.add((time) => {
        gameLoop(time);
      });
    })();
  }, []);

  return <div ref={appRef} style={{ width: '500px', height: '500px' }} />;
};
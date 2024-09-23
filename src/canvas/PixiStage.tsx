import { Application, Assets, Sprite } from 'pixi.js';
import { useEffect, useRef } from 'react';
import type { Entity, System } from '../models/ECS/ECS';
import { createEntity } from '../models/ECS/ECS';
import {
  PlayerComponent,
  PositionComponent,
  SpriteComponent,
} from '../models/ECS/Components';
import { getComponent } from '../utils/common';

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
  let playerX = Math.floor(Math.random() * 10);
  let playerY = Math.floor(Math.random() * 10);

  while (
    entities.some((entity) => {
      const positionComponent = getComponent<PositionComponent>(
        entity,
        'position',
      );
      return (
        positionComponent?.x === playerX && positionComponent?.y === playerY
      );
    })
  ) {
    playerX = Math.floor(Math.random() * 10);
    playerY = Math.floor(Math.random() * 10);
  }

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
      const sprite = Sprite.from(spriteComponent.sprite);
      sprite.width = tileWidth;
      sprite.height = tileHeight;
      sprite.position.set(
        positionComponent.x * tileWidth,
        positionComponent.y * tileHeight,
      );
      pixiApp.stage.addChild(sprite);
    }
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

      systems.forEach((system) => {
        pixiApp.ticker.add((time) => {
          system.update(time, entities);
        });
      });
    })();
  }, []);

  return <div ref={appRef} style={{ width: '500px', height: '500px' }} />;
};

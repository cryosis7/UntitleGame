import type React from 'react';
import { useEffect, useRef } from 'react';
import { initPixiApp, pixiApp, preload } from '../../game/Pixi';
import {
  gameLoop,
  initiateEntities,
  initiateMap,
  initiateSystems,
} from '../../game/GameSystem';

export const Game: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasInitialised = useRef(false);

  useEffect(() => {
    const gameContainer = containerRef.current;
    if (!gameContainer || hasInitialised.current) {
      return;
    }

    (async () => {
      hasInitialised.current = true;
      await initPixiApp(gameContainer);
      await preload();

      initiateMap({ rows: 10, cols: 10 });
      initiateEntities();
      initiateSystems();

      pixiApp.ticker.add((time) => {
        gameLoop(time);
      });
    })();
  }, []);

  return <div ref={containerRef} style={{ width: '500px', height: '500px' }} />;
};

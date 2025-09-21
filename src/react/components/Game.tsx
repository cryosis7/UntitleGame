import type React from 'react';
import { useEffect, useRef } from 'react';
import { initPixiApp, pixiApp, preload } from '../../game/Pixi';
import { gameLoop, initialiseGame } from '../../game/GameSystem';
import { SystemConfig } from '../../game/config/SystemConfigurations';

interface GameProps {
  systemConfig: SystemConfig;
}

export const Game: React.FC<GameProps> = ({ systemConfig }: GameProps) => {
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

      await initialiseGame(systemConfig);

      pixiApp.ticker.add((time) => {
        gameLoop(time);
      });
    })();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '1000px', height: '1000px' }} />
  );
};

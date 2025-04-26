import type React from 'react';
import { useEffect, useRef } from 'react';
import { initPixiApp, pixiApp, preload } from '../../game/Pixi';
import {
  gameLoop,
  initialiseContainers,
  initialiseSystems,
  initiateEntities,
} from '../../game/GameSystem';
import { mapAtom, updateMapConfigAtom } from '../../game/atoms/Atoms';
import { useSetAtom } from 'jotai';
import { store } from '../../App';

export const Game: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasInitialised = useRef(false);
  const updateMapConfig = useSetAtom(updateMapConfigAtom);

  useEffect(() => {
    const gameContainer = containerRef.current;
    if (!gameContainer || hasInitialised.current) {
      return;
    }

    (async () => {
      hasInitialised.current = true;
      await initPixiApp(gameContainer);
      await preload();

      updateMapConfig({ rows: 10, cols: 10 });
      const map = store.get(mapAtom);
      map.init();

      initiateEntities();
      initialiseContainers();
      initialiseSystems();

      pixiApp.ticker.add((time) => {
        gameLoop(time);
      });
    })();
  }, [updateMapConfig]);

  return <div ref={containerRef} style={{ width: '500px', height: '500px' }} />;
};

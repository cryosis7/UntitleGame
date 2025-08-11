import type React from 'react';
import { useEffect, useRef } from 'react';
import { initPixiApp, pixiApp, preload } from '../../game/Pixi';
import {
  gameLoop,
  initialiseContainers,
  initiateEntities,
  initiateSystems,
} from '../../game/GameSystem';
import { mapAtom, store, updateMapConfigAtom } from '../../game/utils/Atoms';
import { useSetAtom } from 'jotai';

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

      // TODO:
      // - Sort out the sprite sheets
      // - Figure out the sidebar/sprite picker

      updateMapConfig({ rows: 10, cols: 10 });
      const map = store.get(mapAtom);
      map.init();

      initiateEntities();
      initialiseContainers();
      initiateSystems();

      pixiApp.ticker.add((time) => {
        gameLoop(time);
      });
    })();
  }, [updateMapConfig]);

  return <div ref={containerRef} style={{ width: '500px', height: '500px' }} />;
};

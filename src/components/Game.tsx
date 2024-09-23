import type React from 'react';
import { SidePanel } from './SidePanel';
import { GameMap } from './GameMap/GameMap';

export const Game: React.FC = () => {
  return (
    <>
      <GameMap />
      <SidePanel />
    </>
  );
};

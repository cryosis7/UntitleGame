import type React from 'react';
import { useEffect } from 'react';
import { SidePanel } from './SidePanel';
import { GameMap } from './GameMap/GameMap';
import { useDispatch } from '../redux/hooks';
import { initialiseMap } from '../redux/slices/mapSlice';

export const Game: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(initialiseMap());
  }, [dispatch]);

  return (
    <>
      <GameMap />
      <SidePanel />
    </>
  );
};

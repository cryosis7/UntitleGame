import type React from 'react';
import { useEffect } from 'react';
import { SidePanel } from './SidePanel';
import { useDispatch } from '../redux/hooks';
import { initialiseMap } from '../redux/slices/mapSlice';
import { PixiCanvas } from './PixiCanvas';

export const Game: React.FC = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(initialiseMap());
  }, [dispatch]);

  return (
    <>
      <PixiCanvas />
      <SidePanel />
    </>
  );
};

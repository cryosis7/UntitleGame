import type React from 'react';
import './GameMap.scss';
import { Tile } from './Tile';
import { useAppSelector } from '../../redux/hooks';
import { getMap } from '../../redux/slices/mapSlice';

export const GameMap: React.FC = () => {
  const map = useAppSelector(getMap);

  const tileComponents = map.map((tile, i) => (
    <Tile index={i} walkable={tile.isWalkable()} key={i} />
  ));

  return <div className='game-map'>{tileComponents}</div>;
};
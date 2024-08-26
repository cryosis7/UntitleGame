import type React from 'react';
import './GameMap.scss';
import { Tile } from './Tile';
import { useAppSelector } from '../../redux/hooks';
import { getMap } from '../../redux/slices/mapSlice';

export const GameMap: React.FC = () => {
  const map = useAppSelector(getMap);

  const tiles = map.map((tile, i) => <Tile key={i} tile={tile} index={i} />);

  return <div className='game-map'>{tiles}</div>;
};

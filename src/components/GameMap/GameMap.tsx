import type React from 'react';
import { useEffect } from 'react';
import './GameMap.scss';
import { useDispatch, useSelector } from '../../redux/hooks';
import { getMap, initialiseMap, setTile } from '../../redux/slices/mapSlice';
import { Tile } from './Tile';
import { Player } from './Player';

export const GameMap: React.FC = () => {
  const dispatch = useDispatch();
  const map = useSelector(getMap);

  useEffect(() => {
    dispatch(initialiseMap());
  }, [dispatch]);

  return (
    <div className='game-map'>
      {map.map((row, y) => (
        <div key={y} className='game-map-row'>
          {row.map((tile, x) => (
            <Tile
              key={x}
              tile={tile}
              updateTile={(tile) =>
                dispatch(setTile({ tile, position: { x, y } }))
              }
              position={{ x, y }}
            />
          ))}
        </div>
      ))}
      <Player />
    </div>
  );
};

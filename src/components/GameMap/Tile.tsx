import type React from 'react';
import './Tile.scss';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getTileSize, setTile } from '../../redux/slices/mapSlice';
import { GroundModel } from '../../models/physical/GroundModel';
import { isWalkable } from '../../utils/interactionHelpers';

interface TileProps {
  tile: GroundModel;
  index: number;
}

export const Tile: React.FC<TileProps> = ({ tile, index }) => {
  const dispatch = useAppDispatch();
  const tileSize = useAppSelector(getTileSize);

  const className = `${isWalkable(tile) ? '' : 'not-'}walkable`;
  return (
    <div
      className={`${className} center-content`}
      style={{
        width: `${tileSize}px`,
        height: `${tileSize}px`,
      }}
      onClick={() =>
        dispatch(setTile({ tile: { ...tile, walkable: false }, index: index }))
      }
    >
      x
    </div>
  );
};

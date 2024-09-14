import type React from 'react';
import './Tile.scss';
import { useSelector } from '../../redux/hooks';
import { getTileSize } from '../../redux/slices/mapSlice';
import type { TileModel } from '../../models/TileModel';

interface TileProps {
  tile: TileModel;
  updateTile: (tile: TileModel) => void;
  position: { x: number; y: number };
}

export const Tile: React.FC<TileProps> = ({ tile, updateTile, position }) => {
  const tileSize = useSelector(getTileSize);

  const walkableClassName = `${tile.properties.walkable ? '' : 'not-'}walkable`;
  return (
    <button
      className={`${walkableClassName} center-content`}
      style={{
        width: `${tileSize}px`,
        height: `${tileSize}px`,
      }}
      onClick={() =>
        updateTile({
          ...tile,
          properties: {
            ...tile.properties,
            walkable: !tile.properties.walkable,
          },
        })
      }
    />
  );
};

import type React from 'react';
import { getMap, getPlayer } from '../redux/slices/mapSlice';
import { useSelector } from '../redux/hooks';

interface SidePanelProps {}

/** List x and y coordinates of unwalkable tiles locations */
export const SidePanel: React.FC<SidePanelProps> = ({}) => {
  const map = useSelector(getMap);
  const player = useSelector(getPlayer);
  const unwalkableTiles = map
    .flatMap((row, y) =>
      row.map((tile, x) => ({
        tile,
        x,
        y,
      })),
    )
    .filter(({ tile }) => !tile.properties.walkable);

  return (
    <div className='border-blue' style={{ flexGrow: '1' }}>
      <h2>Unwalkable Tiles</h2>
      <ul>
        {unwalkableTiles.map(({ x, y }) => (
          <li key={`${x}-${y}`}>{`(${x}, ${y})`}</li>
        ))}
      </ul>
      <br />
      <h2>Player Position</h2>
      <p>{`(${player.properties.position.x}, ${player.properties.position.y})`}</p>
    </div>
  );
};

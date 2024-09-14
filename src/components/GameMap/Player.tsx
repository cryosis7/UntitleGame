import { useDispatch, useSelector } from '../../redux/hooks';
import {
  getMap,
  getPlayer,
  getTileSize,
  setPlayer,
} from '../../redux/slices/mapSlice';
import type React from 'react';
import { useEffect } from 'react';
import type { Direction } from '../../utils/mapUtils';
import { canMoveInDirection, movePlayer } from '../../utils/mapUtils';

export const Player: React.FC = () => {
  const map = useSelector(getMap);
  const player = useSelector(getPlayer);
  const tileSize = useSelector(getTileSize);

  const dispatch = useDispatch();

  // On wasd or arrow key press, move player
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const direction = {
        ArrowUp: 'up',
        w: 'up',
        ArrowDown: 'down',
        s: 'down',
        ArrowLeft: 'left',
        a: 'left',
        ArrowRight: 'right',
        d: 'right',
      }[event.key];

      if (direction === undefined) {
        return;
      } else if (!canMoveInDirection(map, player, direction as Direction)) {
        return;
      }

      const updatedPlayer = movePlayer(map, player, direction as Direction);
      dispatch(setPlayer(updatedPlayer));
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [dispatch, map, player]);

  return (
    <div
      className='player'
      aria-label='player'
      style={{
        top: `${player.properties.position.y * tileSize}px`,
        left: `${player.properties.position.x * tileSize}px`,
        width: `${tileSize}px`,
        height: `${tileSize}px`,
        position: 'absolute',
      }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        width={tileSize}
        height={tileSize}
        style={{ display: 'block', margin: 'auto' }}
      >
        <path
          fill='#000000'
          d='M12 2c-3.31 0-6 2.69-6 6 0 3.31 2.69 6 6 6s6-2.69 6-6c0-3.31-2.69-6-6-6zm-1 18h2v-2h-2v2zm1-4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
        />
      </svg>
    </div>
  );
};

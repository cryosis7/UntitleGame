import type React from 'react';
import { useAtomValue } from 'jotai';
import { playerAtom } from '../../game/GameSystem';
import { getComponent } from '../../game/utils/ecsUtils';
import type { PositionComponent } from '../../game/components/Components';

export const SidePanel: React.FC = () => {
  const player = useAtomValue(playerAtom);

  if (!player) {
    return <div className='border-blue' style={{ flexGrow: '1' }} />;
  }
  let positionComponent = getComponent<PositionComponent>(player, 'position');
  return (
    <div className='border-blue' style={{ flexGrow: '1' }}>
      <h2>Side Panel</h2>
      {player && (
        <>
          <span>
            Player Location:{' '}
            {`${positionComponent?.x}, ${positionComponent?.y}`}
          </span>
        </>
      )}
    </div>
  );
};

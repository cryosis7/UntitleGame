import type React from 'react';
import { useAtomValue } from 'jotai';
import { playerAtom } from '../../game/GameSystem';
import { getComponent } from '../../game/utils/ecsUtils';
import type {
  PositionComponent,
  VelocityComponent,
} from '../../game/components/Components';

export const SidePanel: React.FC = () => {
  const player = useAtomValue(playerAtom);

  if (!player) {
    return <div className='border-blue' style={{ flexGrow: '1' }} />;
  }
  let positionComponent = getComponent<PositionComponent>(player, 'position');
  let velocityComponent = getComponent<VelocityComponent>(player, 'velocity');
  return (
    <div className='border-blue' style={{ flexGrow: '1' }}>
      <h2>Side Panel</h2>
      {player && (
        <>
          <div>
            Player Location:{' '}
            {`${positionComponent?.x}, ${positionComponent?.y}`}
          </div>
          <div>
            Player Velocity:{' '}
            {`${velocityComponent?.vx}, ${velocityComponent?.vy}`}
          </div>
        </>
      )}
    </div>
  );
};

import type React from 'react';
import { useAtomValue } from 'jotai';
import { ComponentType } from '../../game/components/ComponentTypes';
import { getComponentIfExists } from '../../game/components/ComponentOperations';
import { playerAtom } from '../../game/utils/Atoms';
import { getEntity } from '../../game/utils/EntityUtils';

export const SidePanel: React.FC = () => {
  const player = useAtomValue(playerAtom);

  if (!player) {
    return <div className='border-blue' style={{ flexGrow: '1' }} />;
  }
  let positionComponent = getComponentIfExists(player, ComponentType.Position);
  let velocityComponent = getComponentIfExists(player, ComponentType.Velocity);
  getComponentIfExists(player, ComponentType.Interacting);
  const carriedItemComponent = getComponentIfExists(
    player,
    ComponentType.CarriedItem,
  );
  const carriedItem = getEntity(carriedItemComponent?.item ?? '');

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
          <div>Carried Item:</div>
          {carriedItem && (
            <div>
              {getComponentIfExists(carriedItem, ComponentType.Sprite)?.sprite}
            </div>
          )}
        </>
      )}
    </div>
  );
};

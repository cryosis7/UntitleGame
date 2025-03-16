import type React from 'react';
import { useAtomValue } from 'jotai';
import type {
  CarriedItemComponent,
  InteractingComponent,
  PositionComponent,
  SpriteComponent,
  VelocityComponent,
} from '../../game/components/Components';
import { ComponentType } from '../../game/components/Components';
import { getComponentIfExists } from '../../game/utils/ComponentUtils';
import { playerAtom } from '../../game/utils/Atoms';
import { getEntity } from '../../game/utils/EntityUtils';

export const SidePanel: React.FC = () => {
  const player = useAtomValue(playerAtom);

  if (!player) {
    return <div className='border-blue' style={{ flexGrow: '1' }} />;
  }
  let positionComponent = getComponentIfExists<PositionComponent>(
    player,
    ComponentType.Position,
  );
  let velocityComponent = getComponentIfExists<VelocityComponent>(
    player,
    ComponentType.Velocity,
  );
  getComponentIfExists<InteractingComponent>(player, ComponentType.Interacting);
  const carriedItemComponent = getComponentIfExists<CarriedItemComponent>(
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
              {
                getComponentIfExists<SpriteComponent>(
                  carriedItem,
                  ComponentType.Sprite,
                )?.sprite.texture.label
              }
            </div>
          )}
        </>
      )}
    </div>
  );
};

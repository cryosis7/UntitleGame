import type React from 'react';
import { useAtomValue } from 'jotai';
import { ComponentType } from '../../game/components/ComponentTypes';
import { getComponentIfExists } from '../../game/components/ComponentOperations';
import { entitiesAtom, playerAtom } from '../../game/atoms/Atoms';
import {
  getEntitiesWithComponent,
  getEntity,
} from '../../game/utils/EntityUtils';

export const SidePanel: React.FC = () => {
  const player = useAtomValue(playerAtom);
  const entities = useAtomValue(entitiesAtom);

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
  const selectedEntities = getEntitiesWithComponent(
    ComponentType.Selected,
    entities,
  );

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
          <div>
            <h3>Selected Entities</h3>
            <ul>
              {selectedEntities.map((entity) => {
                const sprite = getComponentIfExists(
                  entity,
                  ComponentType.Sprite,
                );
                return (
                  <li key={entity.id}>
                    {sprite?.sprite} ({entity.id})
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

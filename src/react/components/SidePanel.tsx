import type React from 'react';
import { useAtomValue } from 'jotai';
import { entitiesAtom, playerAtom } from '../../game/GameSystem';
import {
  CarriedItemComponent,
  ComponentType,
  InteractingComponent,
  PositionComponent,
  VelocityComponent,
} from '../../game/components/Components';
import {
  getComponent,
  hasAllComponents,
} from '../../game/utils/ComponentUtils';

export const SidePanel: React.FC = () => {
  const player = useAtomValue(playerAtom);
  const entities = useAtomValue(entitiesAtom);

  if (!player) {
    return <div className='border-blue' style={{ flexGrow: '1' }} />;
  }
  let positionComponent = getComponent<PositionComponent>(
    player,
    ComponentType.Position,
  );
  let velocityComponent = getComponent<VelocityComponent>(
    player,
    ComponentType.Velocity,
  );
  const interactionComponent = getComponent<InteractingComponent>(
    player,
    ComponentType.Interacting,
  );
  const carriedItemComponent = getComponent<CarriedItemComponent>(
    player,
    ComponentType.CarriedItem,
  );

  const renderedEntities = entities.filter((entity) =>
    hasAllComponents(entity, ComponentType.Position, ComponentType.Sprite),
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
          <div>
            Player Interaction:{' '}
            {interactionComponent?.type ? 'Interacting' : 'Not interacting'}
          </div>
          <div>Carried Item: {carriedItemComponent?.item}</div>
        </>
      )}
      <h3>Entities</h3>
      <ul>
        {renderedEntities.map((entity) => {
          const positionComponent = getComponent<PositionComponent>(
            entity,
            ComponentType.Position,
          );
          return (
            <li key={entity.id}>
              {`${entity.id}: ${positionComponent?.x}, ${positionComponent?.y}`}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

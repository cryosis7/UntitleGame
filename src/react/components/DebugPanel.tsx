import type React from 'react';
import { useAtomValue } from 'jotai';
import { entitiesAtom } from '../../game/utils/Atoms';
import type { Entity } from '../../game/utils/ecsUtils';
import { ComponentType } from '../../game/components/ComponentTypes';
import type { SpriteComponent } from '../../game/components/individualComponents/SpriteComponent';

export const DebugPanel: React.FC = () => {
  const entities = useAtomValue(entitiesAtom);

  const getEntityHtml = (entity: Entity) => (
    <div key={entity.id}>
      <h3>Entity {entity.id}</h3>
      <ul>
        {Object.entries(entity.components).map(([key, value]) => (
          <li key={key}>
            {key}:
            <br />
            {value.type !== ComponentType.Sprite
              ? JSON.stringify(value)
              : (value as SpriteComponent).spriteName}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className='border-blue' style={{ flexGrow: '1', overflow: 'auto', maxHeight: '100vh' }}>
      <h2>Debug Panel</h2>
      {entities.map(getEntityHtml)}
    </div>
  );
};

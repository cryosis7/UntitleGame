import type { BaseSystem, UpdateArgs } from './Framework/Systems';
import { removeComponent } from '../components/ComponentOperations';
import type { Entity } from '../utils/ecsUtils';
import { getEntitiesWithComponent } from '../utils/EntityUtils';
import { ComponentType } from '../components';

export class CleanUpSystem implements BaseSystem {
  update({ entities }: UpdateArgs) {
    if (!entities) return;

    const interactingEntities = getEntitiesWithComponent(
      ComponentType.Interacting,
      entities,
    );

    interactingEntities.forEach((entity: Entity) => {
      removeComponent(entity, ComponentType.Interacting);
    });
  }
}

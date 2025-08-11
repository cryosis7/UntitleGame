import type { BaseSystem, UpdateArgs } from './Framework/Systems';
import { ComponentType } from '../components/ComponentTypes';
import type { Entity } from '../utils/ecsUtils';
import { getEntitiesWithComponent } from '../utils/EntityUtils';
import { removeComponent } from '../components/ComponentOperations';

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

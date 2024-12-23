import type { System, UpdateArgs } from './Systems';
import { ComponentType } from '../components/Components';
import type { Entity } from '../utils/ecsUtils';
import { getEntitiesWithComponent } from '../utils/EntityUtils';
import { removeComponent } from '../utils/ComponentUtils';

export class CleanUpSystem implements System {
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

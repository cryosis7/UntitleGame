import { BaseRenderSystem } from './BaseRenderSystem';
import type { UpdateArgs } from '../Framework/Systems';
import { hasComponentValue } from '../../components/ComponentOperations';
import { ComponentType } from '../../components';

export class MapRenderSystem extends BaseRenderSystem {
  constructor() {
    super('map');
  }

  update({ map }: UpdateArgs) {
    if (!map.hasChanged) {
      return;
    }
    const entities = map.getAllEntities();
    const mapEntities = entities.filter((entity) => {
      return hasComponentValue(entity, ComponentType.Render, {
        section: 'map',
      });
    });

    this.updateStageAndPositions(mapEntities);

    map.hasChanged = false;
  }
}

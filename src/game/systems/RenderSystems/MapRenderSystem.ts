import { BaseRenderSystem } from './BaseRenderSystem';
import type { UpdateArgs } from '../Framework/Systems';

export class MapRenderSystem extends BaseRenderSystem {
  constructor() {
    super('map');
  }

  update({ map }: UpdateArgs) {
    if (!map.hasChanged) {
      return;
    }
    const entities = map.getAllEntities();
    this.updateStageAndPositions(entities);

    map.hasChanged = false;
  }
}

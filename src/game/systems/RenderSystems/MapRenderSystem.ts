import { BaseRenderSystem } from './BaseRenderSystem';
import { mapAtom, store } from '../../utils/Atoms';
import type { UpdateArgs } from '../Framework/Systems';

export class MapRenderSystem extends BaseRenderSystem {
  constructor() {
    const map = store.get(mapAtom);
    super(map.getSpriteContainer(), 'map', [0, 0]);
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

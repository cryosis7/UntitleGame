import { BaseRenderSystem } from './BaseRenderSystem';
import { RenderSection } from '../../components';
import {
  hasMapUpdatedAtom,
  mapEntitiesAtom,
  setHasMapUpdatedAtom,
  store,
} from '../../atoms';

export class MapRenderSystem extends BaseRenderSystem {
  constructor() {
    super(RenderSection.Map);
  }

  update() {
    if (!store.get(hasMapUpdatedAtom)) {
      return;
    }

    const entities = store.get(mapEntitiesAtom);
    this.updateStageAndPositions(entities);

    store.set(setHasMapUpdatedAtom, false);
  }
}

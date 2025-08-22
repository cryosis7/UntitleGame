import { BaseRenderSystem } from './BaseRenderSystem';
import type { UpdateArgs } from '../Framework/Systems';
import { hasComponentValue } from '../../components/ComponentOperations';
import { ComponentType } from '../../components';
import { RenderSection } from '../../components/individualComponents/RenderComponent';

export class MapRenderSystem extends BaseRenderSystem {
  constructor() {
    super(RenderSection.Map);
  }

  update({ map }: UpdateArgs) {
    if (!map.hasChanged) {
      return;
    }
    const entities = map.getAllEntities();
    const mapEntities = entities.filter((entity) => {
      return hasComponentValue(entity, ComponentType.Render, {
        section: RenderSection.Map,
      });
    });

    this.updateStageAndPositions(mapEntities);

    map.hasChanged = false;
  }
}

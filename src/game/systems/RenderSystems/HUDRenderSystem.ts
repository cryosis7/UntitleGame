import type { UpdateArgs } from '../Framework/Systems';
import { ComponentType, RenderSection } from '../../components';
import { hasComponentValue } from '../../components/ComponentOperations';
import { BaseRenderSystem } from './BaseRenderSystem';

export class HUDRenderSystem extends BaseRenderSystem {
  constructor() {
    super(RenderSection.Hud, [0, 0]);
  }

  update({ entities }: UpdateArgs) {
    const hudEntities = entities.filter((entity) => {
      return hasComponentValue(entity, ComponentType.Render, {
        section: RenderSection.Hud,
      });
    });

    this.updateStageAndPositions(hudEntities);
  }
}

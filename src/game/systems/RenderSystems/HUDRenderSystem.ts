import type { UpdateArgs } from '../Framework/Systems';
import { ComponentType } from '../../components';
import { hasComponentValue } from '../../components/ComponentOperations';
import { BaseRenderSystem } from './BaseRenderSystem';

export class HUDRenderSystem extends BaseRenderSystem {
  constructor() {
    super('hud', [0, 0]);
  }

  update({ entities }: UpdateArgs) {
    const hudEntities = entities.filter((entity) => {
      return hasComponentValue(entity, ComponentType.Render, {
        section: 'hud',
      });
    });

    this.updateStageAndPositions(hudEntities);
  }
}

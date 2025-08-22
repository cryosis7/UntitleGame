import type { UpdateArgs } from '../Framework/Systems';

import { hasComponentValue } from '../../components/ComponentOperations';
import { ComponentType } from '../../components';
import { RenderSection } from '../../components/individualComponents/RenderComponent';
import { BaseRenderSystem } from './BaseRenderSystem';

export class GameRenderSystem extends BaseRenderSystem {
  constructor() {
    super(RenderSection.Game);
  }

  update({ entities }: UpdateArgs) {
    const gameEntities = entities.filter((entity) => {
      return hasComponentValue(entity, ComponentType.Render, {
        section: RenderSection.Game,
      });
    });

    this.updateStageAndPositions(gameEntities);
  }
}

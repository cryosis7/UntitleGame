import type { UpdateArgs } from '../Framework/Systems';

import { getComponentIfExists } from '../../components/ComponentOperations';
import { ComponentType } from '../../components';
import { BaseRenderSystem } from './BaseRenderSystem';

export class GameRenderSystem extends BaseRenderSystem {
  constructor() {
    super('game');
  }

  update({ entities }: UpdateArgs) {
    const gameEntities = entities.filter((entity) => {
      const renderComponent = getComponentIfExists(
        entity,
        ComponentType.Render,
      );

      return renderComponent?.section === 'game';
    });

    this.updateStageAndPositions(gameEntities);
  }
}

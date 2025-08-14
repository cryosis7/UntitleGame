import type { UpdateArgs } from '../Framework/Systems';

import { getComponentIfExists } from '../../components/ComponentOperations';
import { ComponentType } from '../../components';
import { BaseRenderSystem } from './BaseRenderSystem';

export class GameRenderSystem extends BaseRenderSystem {
  constructor() {
    super('game');
  }

  update({ entities }: UpdateArgs) {
    // Filter entities that should be rendered in the game section
    const gameEntities = entities.filter((entity) => {
      const renderComponent = getComponentIfExists(entity, ComponentType.Render);
      
      if (!renderComponent) {
        // If no render component, default to game rendering
        return true;
      }
      
      return renderComponent.section === 'game';
    });

    this.updateStageAndPositions(gameEntities);
  }
}

import type { UpdateArgs } from '../Systems';

import { getComponentIfExists } from '../../components/ComponentOperations';
import { ComponentType } from '../../components/ComponentTypes';
import { mapAtom, store } from '../../utils/Atoms';
import { BaseRenderSystem } from './BaseRenderSystem';

export class GameRenderSystem extends BaseRenderSystem {
  constructor() {
    const map = store.get(mapAtom);
    const spriteContainer = map.getSpriteContainer();
    super(spriteContainer, 'game', [0, 0]);
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

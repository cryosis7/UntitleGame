import type { UpdateArgs } from '../Systems';

import { getComponentAbsolute, hasComponent } from '../../components/ComponentOperations';
import { ComponentType } from '../../components/ComponentTypes';
import { mapAtom, store } from '../../utils/Atoms';
import { BaseRenderSystem } from './BaseRenderSystem';
import type { RenderComponent } from '../../components/individualComponents/RenderComponent';

export class GameRenderSystem extends BaseRenderSystem {
  constructor() {
    const map = store.get(mapAtom);
    const spriteContainer = map.getSpriteContainer();
    super(spriteContainer, 'game', [0, 0]);
  }

  update({ entities }: UpdateArgs) {
    // Filter entities that should be rendered in the game section
    const gameEntities = entities.filter((entity) => {
      if (hasComponent(entity, ComponentType.Render)) {
        const renderComponent = getComponentAbsolute(entity, ComponentType.Render) as RenderComponent;
        return renderComponent.section === 'game';
      }
      // If no render component, default to game rendering (backward compatibility)
      return !hasComponent(entity, ComponentType.RenderInSidebar);
    });

    this.updateStageAndPositions(gameEntities);
  }
}

import type { UpdateArgs } from '../Framework/Systems';

import { hasComponent } from '../../components/ComponentOperations';
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
    // Filter out entities that should be rendered in sidebar
    // TODO: Create a component specifically for game entities instead, or a multipurpose one.
    const gameEntities = entities.filter(
      (entity) => !hasComponent(entity, ComponentType.RenderInSidebar),
    );

    this.updateStageAndPositions(gameEntities);
  }
}

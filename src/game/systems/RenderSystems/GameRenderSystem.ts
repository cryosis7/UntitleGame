import type { UpdateArgs } from '../Framework/Systems';

import { hasComponent } from '../../components/ComponentOperations';
import { ComponentType } from '../../components';
import { BaseRenderSystem } from './BaseRenderSystem';

export class GameRenderSystem extends BaseRenderSystem {
  constructor() {
    super('game');
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

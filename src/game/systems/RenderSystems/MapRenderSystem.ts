import { BaseRenderSystem } from './BaseRenderSystem';
import type { GameMap } from '../../map/GameMap';

export class MapRenderSystem extends BaseRenderSystem {
  constructor(map: GameMap) {
    super({
      rootContainer: map.getContainer(),
    });
  }
}

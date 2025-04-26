import type { SystemBase, UpdateArgs } from '../SystemBase';
import { LevelEditorPlacementSystem } from './LevelEditorPlacementSystem';
import { LevelEditorSelectionSystem } from './LevelEditorSelectionSystem';
import { getContainersAtom } from '../../atoms/RenderConfigAtoms';
import { store } from '../../../App';

export class LevelEditorSystem implements SystemBase {
  private placementSystem: LevelEditorPlacementSystem;
  private selectionSystem: LevelEditorSelectionSystem;

  constructor() {
    const { mapContainer, sidebarContainer } = store.get(getContainersAtom);
    if (!mapContainer || !sidebarContainer) {
      throw new Error('Map or sidebar container is not set');
    }

    this.selectionSystem = new LevelEditorSelectionSystem(sidebarContainer);
    this.placementSystem = new LevelEditorPlacementSystem(mapContainer);
  }

  update(args: UpdateArgs): void {
    this.selectionSystem.update(args);
    this.placementSystem.update(args);
  }
}

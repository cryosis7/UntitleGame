import type { UpdateArgs } from '../SystemBase';
import { LevelEditorPlacementSystem } from './LevelEditorPlacementSystem';
import { LevelEditorSelectionSystem } from './LevelEditorSelectionSystem';
import { getContainersAtom } from '../../atoms/RenderConfigAtoms';
import { store } from '../../../App';

export class LevelEditorSystem {
  private placementSystem: LevelEditorPlacementSystem;
  private selectionSystem: LevelEditorSelectionSystem;

  constructor() {
    const { mapContainer, sidebarContainer } = store.get(getContainersAtom);
    if (!mapContainer || !sidebarContainer) {
      throw new Error('Map or sidebar container is not set');
    }

    this.placementSystem = new LevelEditorPlacementSystem(mapContainer);
    this.selectionSystem = new LevelEditorSelectionSystem(
      sidebarContainer,
      this.setSelectedEntity.bind(this),
    );
  }

  private setSelectedEntity(spriteName: string): void {
    this.placementSystem.setSelectedItem(spriteName);
  }

  update(args: UpdateArgs): void {
    this.selectionSystem.update(args);
    this.placementSystem.update(args);
  }
}

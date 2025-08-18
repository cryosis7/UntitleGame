import type { UpdateArgs } from '../Framework/Systems';
import type { BaseSystem } from '../Framework/Systems';
import { Graphics } from 'pixi.js';
import { ComponentType } from '../../components';
import { hasAllComponents, hasComponentValue, getComponentIfExists } from '../../components/ComponentOperations';
import { sidebarContainerAtom, store } from '../../utils/Atoms';
import type { Entity } from '../../utils/ecsUtils';

export class SidebarHighlightRenderSystem implements BaseSystem {
  private highlightGraphics: Graphics | null = null;
  private sidebarContainer: any;

  constructor() {
    this.sidebarContainer = store.get(sidebarContainerAtom);
    if (!this.sidebarContainer) {
      throw new Error('Sidebar container not found');
    }
  }

  update({ entities }: UpdateArgs) {
    const selectedSidebarEntities = entities.filter((entity) => {
      return (
        hasAllComponents(entity, ComponentType.Selected, ComponentType.Render) &&
        hasComponentValue(entity, ComponentType.Render, { section: 'sidebar' })
      );
    });

    this.clearHighlight();

    if (selectedSidebarEntities.length > 0) {
      const selectedEntity = selectedSidebarEntities[0];
      this.createHighlight(selectedEntity);
    }
  }

  private clearHighlight() {
    if (this.highlightGraphics) {
      this.sidebarContainer.removeChild(this.highlightGraphics);
      this.highlightGraphics.destroy();
      this.highlightGraphics = null;
    }
  }

  private createHighlight(entity: Entity) {
    const positionComponent = getComponentIfExists(entity, ComponentType.Position);
    if (!positionComponent) return;

    const tileSize = 32; // Default tile size for sidebar
    const highlightOffset = 2;
    const highlightWidth = 3;

    this.highlightGraphics = new Graphics();
    
    // Create yellow border highlight
    this.highlightGraphics
      .rect(
        positionComponent.x * tileSize - highlightOffset,
        positionComponent.y * tileSize - highlightOffset,
        tileSize + highlightOffset * 2,
        tileSize + highlightOffset * 2
      )
      .stroke({ width: highlightWidth, color: 0xffff00 });

    this.sidebarContainer.addChild(this.highlightGraphics);
  }
}
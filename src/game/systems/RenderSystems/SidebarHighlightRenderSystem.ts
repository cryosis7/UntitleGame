import type { UpdateArgs } from '../Framework/Systems';
import { Graphics } from 'pixi.js';
import type { BaseSystem } from '../Framework/Systems';
import { ComponentType } from '../../components';
import { getComponentIfExists, hasComponent } from '../../components/ComponentOperations';
import { gridToScreenAsTuple } from '../../map/MappingUtils';
import { getSidebarConfigAtom, sidebarContainerAtom, store } from '../../utils/Atoms';

export class SidebarHighlightRenderSystem implements BaseSystem {
  private highlightGraphics: Graphics | null = null;

  update({ entities }: UpdateArgs) {
    const sidebarContainer = store.get(sidebarContainerAtom);
    if (!sidebarContainer) {
      return;
    }

    if (this.highlightGraphics) {
      sidebarContainer.removeChild(this.highlightGraphics);
      this.highlightGraphics = null;
    }

    const selectedSidebarEntity = entities.find((entity) => {
      const renderComponent = getComponentIfExists(entity, ComponentType.Render);
      return (
        renderComponent?.section === 'sidebar' &&
        hasComponent(entity, ComponentType.Selected)
      );
    });

    if (selectedSidebarEntity) {
      const positionComponent = getComponentIfExists(
        selectedSidebarEntity,
        ComponentType.Position,
      );

      if (positionComponent) {
        const sidebarConfig = store.get(getSidebarConfigAtom);
        const [screenX, screenY] = gridToScreenAsTuple(
          positionComponent,
          sidebarConfig,
        );

        this.highlightGraphics = new Graphics()
          .rect(
            screenX - 2,
            screenY - 2,
            sidebarConfig.tileSize + 4,
            sidebarConfig.tileSize + 4,
          )
          .stroke({ width: 3, color: 0xffff00 });

        sidebarContainer.addChild(this.highlightGraphics);
      }
    }
  }
}
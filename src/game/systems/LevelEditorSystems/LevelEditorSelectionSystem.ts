import { screenToGrid } from '../../map/MappingUtils';
import type { Position } from '../../map/GameMap';
import {
  getComponentAbsolute,
  hasComponent,
  removeComponentFromAllEntities,
  setComponent,
} from '../../components/ComponentOperations';
import type { CustomPointerEvent } from '../BaseClickSystem';
import { BaseClickSystem } from '../BaseClickSystem';
import { ComponentType } from '../../components/ComponentTypes';
import { getSidebarConfigAtom } from '../../atoms/RenderConfigAtoms';
import { store } from '../../../App';
import { getEntitiesWithComponents } from '../../utils/EntityUtils';
import type { UpdateArgs } from '../SystemBase';
import { SelectedComponent } from '../../components/individualComponents/SelectedComponent';

export class LevelEditorSelectionSystem extends BaseClickSystem {
  private clickedPosition?: Position;

  handleClick(event: CustomPointerEvent): void {
    this.clickedPosition = screenToGrid(
      event.localPosition,
      store.get(getSidebarConfigAtom),
    );
  }

  update({ entities }: UpdateArgs): void {
    const clickedPosition = this.clickedPosition; // Helps with TS linting to assign

    if (clickedPosition !== undefined) {
      const sideBarEntities = getEntitiesWithComponents(
        [
          ComponentType.RenderInSidebar,
          ComponentType.Sprite,
          ComponentType.Position,
        ],
        entities,
      );

      const clickedEntity = sideBarEntities.find((entity) => {
        const position = getComponentAbsolute(entity, ComponentType.Position);
        return (
          position.x === clickedPosition.x && position.y === clickedPosition.y
        );
      });

      if (clickedEntity) {
        const shouldSelect = !hasComponent(
          clickedEntity,
          ComponentType.Selected,
        );

        removeComponentFromAllEntities(ComponentType.Selected);

        if (shouldSelect) {
          setComponent(clickedEntity, new SelectedComponent());
        }
      }

      this.clickedPosition = undefined;
    }
  }
}

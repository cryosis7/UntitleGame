import { screenToGrid } from '../../map/MappingUtils';
import type { Position } from '../../map/GameMap';

import type { FederatedPointerEvent, Point } from 'pixi.js';
import { BaseClickSystem } from '../Framework/BaseClickSystem';
import {
  getSidebarConfigAtom,
  sidebarContainerAtom,
  store,
} from '../../utils/Atoms';
import type { UpdateArgs } from '../Framework/Systems';
import { ComponentType, SelectedComponent } from '../../components';
import {
  getComponentAbsolute,
  hasAllComponents,
  hasComponent,
  hasComponentValue,
  removeComponent,
  removeComponentFromAllEntities,
  setComponent,
} from '../../components/ComponentOperations';
import { RenderSection } from '../../components/individualComponents/RenderComponent';

export class LevelEditorSelectionSystem extends BaseClickSystem {
  private clickedPosition?: Position;
  private hasChanged = false;

  constructor() {
    const sidebarContainer = store.get(sidebarContainerAtom);
    if (!sidebarContainer) {
      throw new Error('Sidebar container is not initialized');
    }

    super(sidebarContainer);
  }

  handleClick(_event: FederatedPointerEvent, localPosition: Point) {
    this.clickedPosition = screenToGrid(
      localPosition,
      store.get(getSidebarConfigAtom),
    );
    this.hasChanged = true;
  }

  update({ entities }: UpdateArgs): void {
    if (!this.hasChanged) {
      return;
    }

    const clickedPosition = this.clickedPosition; // Helps with TS linting

    if (clickedPosition !== undefined) {
      const sidebarEntities = entities.filter((entity) => {
        if (
          !hasAllComponents(
            entity,
            ComponentType.Render,
            ComponentType.Sprite,
            ComponentType.Position,
          )
        ) {
          return false;
        }

        return hasComponentValue(entity, ComponentType.Render, {
          section: RenderSection.Sidebar,
        });
      });

      const clickedEntity = sidebarEntities.find((entity) => {
        const position = getComponentAbsolute(entity, ComponentType.Position);
        return (
          position.x === clickedPosition.x && position.y === clickedPosition.y
        );
      });

      if (clickedEntity !== undefined) {
        const isSelected = hasComponent(clickedEntity, ComponentType.Selected);

        if (isSelected) {
          removeComponent(clickedEntity, ComponentType.Selected);
        } else {
          removeComponentFromAllEntities(ComponentType.Selected);
          setComponent(clickedEntity, new SelectedComponent());
        }
      }

      this.clickedPosition = undefined;
    }

    this.hasChanged = false;
  }
}

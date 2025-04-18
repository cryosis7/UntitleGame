import type { Container, FederatedPointerEvent } from 'pixi.js';
import { screenToGrid } from '../../map/MappingUtils';
import type { Position } from '../../map/GameMap';
import { getComponentAbsolute } from '../../components/ComponentOperations';
import { BaseClickSystem } from '../BaseClickSystem';
import { ComponentType } from '../../components/ComponentTypes';
import { getSidebarConfigAtom } from '../../atoms/RenderConfigAtoms';
import { store } from '../../../App';
import { getEntitiesWithComponents } from '../../utils/EntityUtils';
import type { UpdateArgs } from '../SystemBase';

export class LevelEditorSelectionSystem extends BaseClickSystem {
  private clickedPosition?: Position;
  private readonly setSelectedEntity: (spriteName: string) => void;

  constructor(
    container: Container,
    setSelectedEntity: (spriteName: string) => void,
  ) {
    super(container);
    this.setSelectedEntity = setSelectedEntity;
  }

  handleClick(event: FederatedPointerEvent): void {
    this.clickedPosition = screenToGrid(
      { x: event.screenX, y: event.screenY },
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
        const spriteName = getComponentAbsolute(
          clickedEntity,
          ComponentType.Sprite,
        ).sprite;
        this.setSelectedEntity(spriteName);
      }

      this.clickedPosition = undefined;
    }
  }
}

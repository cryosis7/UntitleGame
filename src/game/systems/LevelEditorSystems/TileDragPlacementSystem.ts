import {
  getMapSpriteConfigAtom,
  mapContainerAtom,
  setHasMapUpdatedAtom,
  store,
} from '../../atoms';
import { BaseSystem, UpdateArgs } from '../Framework/Systems';
import {
  ComponentType,
  Position,
  PositionComponent,
  RenderComponent,
  RenderSection,
  SpriteComponent,
  TilePreviewComponent,
} from '../../components';
import { arePositionsEqual } from '../../utils/UtilityFunctions';
import {
  addEntities,
  getEntitiesWithComponent,
  getEntityById,
  removeEntity,
} from '../../utils/EntityUtils';
import {
  getComponentAbsolute,
  removeComponent,
} from '../../components/ComponentOperations';
import { createEntity } from '../../utils/EntityFactory';
import type { Container, FederatedPointerEvent } from 'pixi.js';
import { screenToGrid } from '../../utils/MappingUtils';

export class TileDragPlacementSystem implements BaseSystem {
  private readonly container: Container;

  private hasDragChanged: boolean = false;
  private dragStartPosition: Position | null = null;
  private dragCurrentPosition: Position | null = null;
  private previewEntities: string[] = [];
  private isMousePressed: boolean = false;

  private handleMouseMove = (event: FederatedPointerEvent) => {
    if (!this.isMousePressed) return;

    const currentGridPos = screenToGrid(
      this.container.toLocal(event.global),
      store.get(getMapSpriteConfigAtom),
    );

    this.handleDrag(currentGridPos);
  };

  private handleMouseDown = () => {
    this.isMousePressed = true;
  };

  private handleMouseUp = () => {
    this.isMousePressed = false;
  };

  constructor() {
    const map = store.get(mapContainerAtom);

    if (!map) {
      throw new Error('Map container is not initialized');
    }

    this.container = map;
    map.eventMode = 'static';

    map.on('mousedown', this.handleMouseDown);
    map.on('mousemove', this.handleMouseMove);
    map.on('mouseup', this.handleMouseUp);
  }

  handleDrag(current: Position): void {
    if (this.dragStartPosition === null) {
      this.dragStartPosition = current;
      this.dragCurrentPosition = current;
      this.hasDragChanged = true;
      return;
    }

    if (
      this.dragCurrentPosition &&
      !arePositionsEqual(this.dragCurrentPosition, current)
    ) {
      this.dragCurrentPosition = current;
      this.hasDragChanged = true;
    }
  }

  update(_: UpdateArgs): void {
    const start = this.dragStartPosition;
    const current = this.dragCurrentPosition;

    if (!this.isMousePressed && this.previewEntities.length > 0) {
      this.commitDrag();
      return;
    }

    if (!this.hasDragChanged) {
      return;
    }

    if (!start || !current) {
      this.resetDragState();
      throw new Error('Has active drag but missing positions');
    }

    const selectedSprite = this.getSelectedSprite();
    if (!selectedSprite) {
      return;
    }

    this.previewEntities.forEach(removeEntity);
    const positionsToCover = this.getPositionsInRectangle(start, current);
    const newPreviewEntities = positionsToCover.map((pos) =>
      this.createPreviewEntity(selectedSprite, pos),
    );

    addEntities(newPreviewEntities);
    store.set(setHasMapUpdatedAtom, true);
    this.previewEntities = newPreviewEntities.map((e) => e.id);

    this.hasDragChanged = false;
  }

  private commitDrag = () => {
    const previewEntities = this.previewEntities.map((id) => getEntityById(id));

    previewEntities.forEach((entity) => {
      if (!entity) return;
      removeComponent(entity, ComponentType.TilePreview);
    });

    this.resetDragState(false);
  };

  private resetDragState = (removePreviewEntities: boolean = true) => {
    this.hasDragChanged = false;
    this.dragStartPosition = null;
    this.dragCurrentPosition = null;
    this.isMousePressed = false;
    if (removePreviewEntities) {
      this.previewEntities.forEach(removeEntity);
      store.set(setHasMapUpdatedAtom, true);
    }
    this.previewEntities = [];
  };

  destroy(): void {
    if (this.container) {
      this.container.off('mousedown', this.handleMouseDown);
      this.container.off('mousemove', this.handleMouseMove);
      this.container.off('mouseup', this.handleMouseUp);
    }
    this.resetDragState();
  }

  private getSelectedSprite() {
    const selectedEntities = getEntitiesWithComponent(ComponentType.Selected);
    if (selectedEntities.length === 0) return null;

    if (selectedEntities.length > 1) {
      console.warn(
        'Multiple entities selected, using the first one for tile drag preview',
      );
    }

    const selectedEntity = selectedEntities[0];
    const spriteComponent = getComponentAbsolute(
      selectedEntity,
      ComponentType.Sprite,
    );
    return spriteComponent.spriteName;
  }

  private getPositionsInRectangle(start: Position, end: Position): Position[] {
    const positions: Position[] = [];
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        positions.push({ x, y });
      }
    }

    return positions;
  }

  private createPreviewEntity(spriteName: string, position: Position) {
    return createEntity([
      new TilePreviewComponent(),
      new SpriteComponent({ sprite: spriteName }),
      new PositionComponent(position),
      new RenderComponent({ section: RenderSection.Map }),
    ]);
  }
}

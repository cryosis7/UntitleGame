import { screenToGrid } from '../../map/MappingUtils';
import type { Position } from '../../map/GameMap';
import { BaseMouseMoveSystem } from '../Framework/BaseMouseMoveSystem';
import type { Point } from 'pixi.js';
import { arePositionsEqual } from '../../utils/UtilityFunctions';
import { mapContainerAtom, store } from '../../atoms';
import {
  ComponentType,
  PositionComponent,
  RenderComponent,
  RenderSection,
  SpriteComponent,
  TilePreviewComponent,
} from '../../components';
import { createEntity } from '../../utils/EntityFactory';
import {
  addEntity,
  getEntitiesWithComponent,
  getEntity,
  removeEntity,
} from '../../utils/EntityUtils';
import {
  getComponentAbsolute,
  setComponent,
} from '../../components/ComponentOperations';

export class TileHoverHighlightSystem extends BaseMouseMoveSystem {
  private currentHoverPosition: Position | null = null;
  private hasPositionChanged: boolean = false;
  private previewEntityId: string | null = null;

  constructor() {
    const mapContainer = store.get(mapContainerAtom);
    if (!mapContainer) {
      throw new Error('Map container is not initialized');
    }

    super(mapContainer);
  }

  handleMouseMove(localPosition: Point) {
    const gridPosition = screenToGrid(localPosition);

    if (
      !this.currentHoverPosition ||
      !arePositionsEqual(this.currentHoverPosition, gridPosition)
    ) {
      this.currentHoverPosition = gridPosition;
      this.hasPositionChanged = true;
    }
  }

  handleMouseLeave() {
    this.currentHoverPosition = null;
    this.hasPositionChanged = true;
  }

  update() {
    if (!this.hasPositionChanged) return;

    if (this.currentHoverPosition === null) {
      if (this.previewEntityId) {
        removeEntity(this.previewEntityId);
        this.previewEntityId = null;
      }
      this.hasPositionChanged = false;
      return;
    }

    const selectedSprite = this.getSelectedSprite();
    if (!selectedSprite) {
      if (this.previewEntityId) {
        removeEntity(this.previewEntityId);
        this.previewEntityId = null;
      }
      this.hasPositionChanged = false;
      return;
    }

    if (!this.previewEntityId) {
      const previewEntity = this.createPreviewEntity(
        selectedSprite,
        this.currentHoverPosition,
      );
      addEntity(previewEntity);
      this.previewEntityId = previewEntity.id;
    } else {
      const previewEntity = getEntity(this.previewEntityId);
      if (!previewEntity) {
        throw new Error(
          `Preview entity with ID ${this.previewEntityId} (sprite: ${selectedSprite}) not found`,
        );
      }

      const positionComponent = getComponentAbsolute(
        previewEntity,
        ComponentType.Position,
      );

      if (!arePositionsEqual(positionComponent, this.currentHoverPosition)) {
        setComponent(
          previewEntity,
          new PositionComponent(this.currentHoverPosition),
        );
      }
    }

    this.hasPositionChanged = false;
  }

  private getSelectedSprite() {
    const selectedEntities = getEntitiesWithComponent(ComponentType.Selected);
    if (selectedEntities.length === 0) return null;

    if (selectedEntities.length > 1) {
      console.warn(
        'Multiple entities selected, using the first one for tile preview',
      );
    }

    const selectedEntity = selectedEntities[0];
    const spriteComponent = getComponentAbsolute(
      selectedEntity,
      ComponentType.Sprite,
    );
    return spriteComponent.spriteName;
  }

  private createPreviewEntity(spriteName: string, position: Position) {
    return createEntity([
      new TilePreviewComponent(),
      new SpriteComponent({ sprite: spriteName }),
      new PositionComponent(position),
      new RenderComponent({ section: RenderSection.Game }),
    ]);
  }
}

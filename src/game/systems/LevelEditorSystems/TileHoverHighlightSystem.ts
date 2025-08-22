import { gridToScreenAsTuple, screenToGrid } from '../../map/MappingUtils';
import type { Position } from '../../map/GameMap';
import { BaseMouseMoveSystem } from '../Framework/BaseMouseMoveSystem';
import type { Point } from 'pixi.js';
import { Graphics } from 'pixi.js';
import { arePositionsEqual } from '../../utils/UtilityFunctions';
import { getMapConfigAtom, mapContainerAtom, store } from '../../atoms';

export class TileHoverHighlightSystem extends BaseMouseMoveSystem {
  private static readonly HIGHLIGHT_STROKE_WIDTH = 2;
  private static readonly HIGHLIGHT_COLOR = 0x00ff00;

  private currentHoverPosition: Position | null = null;
  private hasPositionChanged: boolean = false;
  private tileHighlightGraphics: Graphics | null = null;

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
      if (this.tileHighlightGraphics) {
        this.stage.removeChild(this.tileHighlightGraphics);
        this.tileHighlightGraphics.destroy();
        this.tileHighlightGraphics = null;
      }
      this.hasPositionChanged = false;
      return;
    }

    const graphics =
      this.tileHighlightGraphics ?? this.createHighlightGraphics();
    if (!this.tileHighlightGraphics) {
      this.stage.addChild(graphics);
      this.tileHighlightGraphics = graphics;
    }

    const mapConfig = store.get(getMapConfigAtom);
    graphics.position.set(
      ...gridToScreenAsTuple(this.currentHoverPosition, mapConfig),
    );

    this.hasPositionChanged = false;
  }

  private createHighlightGraphics(): Graphics {
    const mapConfig = store.get(getMapConfigAtom);
    return new Graphics()
      .rect(0, 0, mapConfig.tileSize, mapConfig.tileSize)
      .stroke({
        width: TileHoverHighlightSystem.HIGHLIGHT_STROKE_WIDTH,
        color: TileHoverHighlightSystem.HIGHLIGHT_COLOR,
      });
  }
}

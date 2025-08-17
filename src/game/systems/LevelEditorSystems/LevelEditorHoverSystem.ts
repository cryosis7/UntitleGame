import { screenToGrid } from '../../map/MappingUtils';
import type { UpdateArgs } from '../Framework/Systems';
import type { Position } from '../../map/GameMap';
import type { Entity } from '../../utils/ecsUtils';
import { getComponentIfExists, setComponent } from '../../components/ComponentOperations';
import { HoverHighlightComponent, PositionComponent } from '../../components';
import { ComponentType } from '../../components';
import { getEntitiesWithComponent } from '../../utils/EntityUtils';
import { BaseClickSystem } from '../Framework/BaseClickSystem';
import type { FederatedPointerEvent, Point } from 'pixi.js';
import { mapContainerAtom, store, currentGameModeAtom } from '../../utils/Atoms';

export class LevelEditorHoverSystem extends BaseClickSystem {
  private currentHoverPosition: Position | null = null;

  constructor() {
    const mapContainer = store.get(mapContainerAtom);
    if (!mapContainer) {
      throw new Error('Map container is not initialized');
    }

    super(mapContainer);
    
    mapContainer.eventMode = 'static';
    mapContainer.on('pointermove', (event: FederatedPointerEvent) => {
      this.handleMouseMove(event);
    });
    
    mapContainer.on('pointerleave', () => {
      this.handleMouseLeave();
    });
  }

  handleClick(_event: FederatedPointerEvent, _localPosition: Point) {
    // This system only handles hover, not clicks
  }

  private handleMouseMove(event: FederatedPointerEvent) {
    const gameMode = store.get(currentGameModeAtom);
    if (gameMode !== 'editor') {
      return;
    }

    const mapContainer = store.get(mapContainerAtom);
    if (!mapContainer) {
      return;
    }

    const localPosition = mapContainer.toLocal(event.global);
    const gridPosition = screenToGrid(localPosition);
    
    if (localPosition.x < 0 || localPosition.y < 0) {
      this.currentHoverPosition = null;
      return;
    }

    this.currentHoverPosition = gridPosition;
  }

  private handleMouseLeave() {
    this.currentHoverPosition = null;
  }

  update({ entities }: UpdateArgs) {
    const gameMode = store.get(currentGameModeAtom);
    if (gameMode !== 'editor') {
      this.currentHoverPosition = null;
    }

    const hoverHighlightEntities = getEntitiesWithComponent(
      ComponentType.HoverHighlight,
      entities,
    );

    if (hoverHighlightEntities.length === 0) {
      return;
    }

    if (hoverHighlightEntities.length > 1) {
      throw new Error(
        'Multiple hover highlight entities found. Only one should exist.',
      );
    }

    const highlightEntity = hoverHighlightEntities[0];
    const positionComponent = getComponentIfExists(
      highlightEntity,
      ComponentType.Position,
    );

    if (this.currentHoverPosition) {
      setComponent(highlightEntity, new HoverHighlightComponent({
        isVisible: true,
      }));

      if (
        !positionComponent ||
        positionComponent.x !== this.currentHoverPosition.x ||
        positionComponent.y !== this.currentHoverPosition.y
      ) {
        setComponent(highlightEntity, new PositionComponent({
          x: this.currentHoverPosition.x,
          y: this.currentHoverPosition.y,
        }));
      }
    } else {
      setComponent(highlightEntity, new HoverHighlightComponent({
        isVisible: false,
      }));
    }
  }
}
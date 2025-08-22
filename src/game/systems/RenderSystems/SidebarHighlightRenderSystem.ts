import type { UpdateArgs } from '../Framework/Systems';
import { Graphics } from 'pixi.js';
import { ComponentType } from '../../components';
import {
  getComponentIfExists,
  hasComponent,
  hasComponentValue,
} from '../../components/ComponentOperations';
import { BaseRenderSystem } from './BaseRenderSystem';
import { pixiApp } from '../../Pixi';
import { Position } from '../../map/GameMap';
import { Entity } from '../../utils/ecsUtils';
import { arePositionsEqual } from '../../utils/UtilityFunctions';
import { gridToScreenAsTuple } from '../../map/MappingUtils';

export class SidebarHighlightRenderSystem extends BaseRenderSystem {
  private static readonly SIDEBAR_WIDTH = 150;
  private static readonly HIGHLIGHT_STROKE_WIDTH = 3;
  private static readonly HIGHLIGHT_COLOR = 0xffff00;

  private renderedEntities: Record<
    string,
    { entity: Entity; graphics?: Graphics; previousPosition?: Position }
  > = {};

  constructor() {
    super('sidebar', [
      pixiApp.canvas.width - SidebarHighlightRenderSystem.SIDEBAR_WIDTH,
      0,
    ]);
  }

  update({ entities }: UpdateArgs) {
    const lastSelectedEntityIds = Object.keys(this.renderedEntities);
    const selectedEntityIds: string[] = [];

    for (const entity of entities) {
      if (
        hasComponentValue(entity, ComponentType.Render, {
          section: 'sidebar',
        }) &&
        hasComponent(entity, ComponentType.Selected)
      ) {
        selectedEntityIds.push(entity.id);

        if (!lastSelectedEntityIds.includes(entity.id)) {
          this.renderedEntities[entity.id] = {
            entity,
          };
        }
      }
    }

    const entityIdsToRemove = lastSelectedEntityIds.filter(
      (id) => !selectedEntityIds.includes(id),
    );

    entityIdsToRemove.forEach((entityId) => {
      const graphics = this.renderedEntities[entityId].graphics;
      if (graphics) {
        this.stage.removeChild(graphics);
        graphics.destroy();
      }
      delete this.renderedEntities[entityId];
    });

    Object.values(this.renderedEntities).forEach(
      ({ entity, graphics, previousPosition }) => {
        const position = getComponentIfExists(entity, ComponentType.Position);
        if (!position) {
          throw new Error(
            `Entity ${entity.id} does not have a Position component yet is selected`,
          );
        }

        const highlightGraphics =
          graphics ?? this.createHighlightGraphics(position);
        if (!graphics) {
          this.stage.addChild(highlightGraphics);
          this.renderedEntities[entity.id].graphics = highlightGraphics;
        }

        if (
          !previousPosition ||
          !arePositionsEqual(position, previousPosition)
        ) {
          highlightGraphics.position.set(
            ...gridToScreenAsTuple(position, this.interfaceConfig),
          );
          this.renderedEntities[entity.id].previousPosition = position;
        }
      },
    );
  }

  private createHighlightGraphics(position: Position): Graphics {
    return new Graphics()
      .rect(
        0,
        0,
        this.interfaceConfig.tileSize,
        this.interfaceConfig.tileSize,
      )
      .stroke({
        width: SidebarHighlightRenderSystem.HIGHLIGHT_STROKE_WIDTH,
        color: SidebarHighlightRenderSystem.HIGHLIGHT_COLOR,
      });
  }
}

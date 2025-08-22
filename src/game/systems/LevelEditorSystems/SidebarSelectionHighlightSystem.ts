import type { BaseSystem, UpdateArgs } from '../Framework/Systems';
import { Container, Graphics } from 'pixi.js';
import { ComponentType, RenderSection } from '../../components';
import {
  getComponentIfExists,
  hasComponent,
  hasComponentValue,
} from '../../components/ComponentOperations';
import { Position } from '../../map/GameMap';
import { Entity } from '../../utils/ecsUtils';
import { arePositionsEqual } from '../../utils/UtilityFunctions';
import { gridToScreenAsTuple } from '../../map/MappingUtils';
import type { InterfaceConfig } from '../../utils/Atoms';
import {
  getContainerBySectionAtom,
  getInterfaceConfigBySectionAtom,
  store,
} from '../../utils/Atoms';
import { pixiApp } from '../../Pixi';

export class SidebarSelectionHighlightSystem implements BaseSystem {
  private static readonly HIGHLIGHT_STROKE_WIDTH = 3;
  private static readonly HIGHLIGHT_COLOR = 0xffff00;

  private renderedEntities: Record<
    string,
    { entity: Entity; graphics?: Graphics; previousPosition?: Position }
  > = {};

  protected stage: Container;
  protected interfaceConfig: InterfaceConfig;

  constructor() {
    const container = store.get(getContainerBySectionAtom)(
      RenderSection.Sidebar,
    );
    if (!container) {
      throw new Error('Container for section sidebar not found');
    }

    this.stage = container;
    if (pixiApp.stage.getChildByLabel(RenderSection.Sidebar) === null) {
      throw new Error(
        'The SidebarSelectionHighlightSystem requires the sidebar render system to have been initialised first',
      );
    }

    this.interfaceConfig = store.get(getInterfaceConfigBySectionAtom)(
      RenderSection.Sidebar,
    );
  }

  update({ entities }: UpdateArgs) {
    const lastSelectedEntityIds = Object.keys(this.renderedEntities);
    const selectedEntityIds: string[] = [];

    for (const entity of entities) {
      if (
        hasComponentValue(entity, ComponentType.Render, {
          section: RenderSection.Sidebar,
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

        const highlightGraphics = graphics ?? this.createHighlightGraphics();
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

  private createHighlightGraphics(): Graphics {
    return new Graphics()
      .rect(0, 0, this.interfaceConfig.tileSize, this.interfaceConfig.tileSize)
      .stroke({
        width: SidebarSelectionHighlightSystem.HIGHLIGHT_STROKE_WIDTH,
        color: SidebarSelectionHighlightSystem.HIGHLIGHT_COLOR,
      });
  }
}

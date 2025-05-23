import { screenToGrid } from '../../map/MappingUtils';
import type { UpdateArgs } from '../SystemBase';
import type { Position } from '../../map/GameMap';
import type { Entity } from '../../utils/ecsUtils';
import type { EntityTemplate } from '../../utils/EntityFactory';
import { createEntityFromTemplate } from '../../utils/EntityFactory';
import { getComponentIfExists } from '../../components/ComponentOperations';
import { ComponentType } from '../../components/ComponentTypes';
import { addEntities, removeEntities } from '../../utils/EntityUtils';
import type { CustomPointerEvent } from '../BaseClickSystem';
import { BaseClickSystem } from '../BaseClickSystem';
import { partitionEntitiesBySidebarRender } from '../../utils/ArrayUtils';

export class LevelEditorPlacementSystem extends BaseClickSystem {
  private readonly defaultSprite = 'grass';
  private hasChanged: boolean = false;
  private placementPositions: Position[] = [];
  private lastClickedPosition: Position | null = null;

  handleClick(event: CustomPointerEvent): void {
    this.hasChanged = true;

    const gridPosition = screenToGrid(event.localPosition);

    if (event.shiftKey && this.lastClickedPosition) {
      const points = LevelEditorPlacementSystem.getPointsBetween(
        this.lastClickedPosition,
        gridPosition,
      );

      for (const point of points) {
        if (
          !this.placementPositions.some(
            (pos) => pos.x === point.x && pos.y === point.y,
          )
        ) {
          this.placementPositions.push(point);
        }
      }
      this.lastClickedPosition = gridPosition;
      return;
    }

    this.placementPositions.push(gridPosition);
    this.lastClickedPosition = gridPosition;
  }

  update({ entities }: UpdateArgs) {
    if (!this.hasChanged) return;

    const entitiesToAdd: Entity[] = [];
    const entitiesToRemove: string[] = [];

    const [sidebarEntities, gameEntities] =
      partitionEntitiesBySidebarRender(entities);

    const selectedEntity = this.getSelectedEntity(sidebarEntities);
    let selectedItem = this.defaultSprite;
    if (selectedEntity) {
      const component = getComponentIfExists(
        selectedEntity,
        ComponentType.Sprite,
      );
      selectedItem = component?.sprite ?? this.defaultSprite;
    }

    for (const position of this.placementPositions) {
      const entityTemplate: EntityTemplate = {
        components: {
          sprite: { sprite: selectedItem },
          position: position,
        },
      };

      // If there is already the same entity at the position, skip/remove it
      const existingEntitiesAtPosition = gameEntities.reduce((ids, entity) => {
        const positionComponent = getComponentIfExists(
          entity,
          ComponentType.Position,
        );
        const spriteComponent = getComponentIfExists(
          entity,
          ComponentType.Sprite,
        );
        if (
          positionComponent?.x === position.x &&
          positionComponent?.y === position.y &&
          spriteComponent?.sprite === selectedItem
        ) {
          ids.push(entity.id);
        }
        return ids;
      }, [] as string[]);
      if (existingEntitiesAtPosition.length !== 0) {
        if (this.placementPositions.length === 1) {
          // If this is a single click event, remove the existing entity.
          entitiesToRemove.push(...existingEntitiesAtPosition);
          this.lastClickedPosition = null;
        }
        // If it was a shift-click event, leave it in place.
        continue;
      }

      entitiesToAdd.push(createEntityFromTemplate(entityTemplate));
    }

    addEntities(...entitiesToAdd);
    removeEntities(entitiesToRemove);

    this.hasChanged = false;
    this.placementPositions = [];
  }

  /**
   * Calculates all the points between two positions using Bresenham's line algorithm.
   * @param {Position} pos1 - The starting position.
   * @param {Position} pos2 - The ending position.
   * @returns {Position[]} An array of positions representing the points between pos1 and pos2.
   */
  private static getPointsBetween(pos1: Position, pos2: Position): Position[] {
    const points: Position[] = [];
    const dx = Math.abs(pos2.x - pos1.x); // Calculate the absolute difference in x
    const dy = Math.abs(pos2.y - pos1.y); // Calculate the absolute difference in y
    const sx = pos1.x < pos2.x ? 1 : -1; // Determine the step direction for x
    const sy = pos1.y < pos2.y ? 1 : -1; // Determine the step direction for y
    let err = dx - dy; // Initialize the error term

    let x = pos1.x;
    let y = pos1.y;
    while (x !== pos2.x || y !== pos2.y) {
      points.push({ x, y }); // Add the current point to the list

      const e2 = 2 * err; // Double the error term
      if (e2 > -dy) {
        err -= dy; // Adjust the error term
        x += sx; // Move in the x direction
      }
      if (e2 < dx) {
        err += dx; // Adjust the error term
        y += sy; // Move in the y direction
      }
    }

    points.push({ x, y }); // Add the final point to the list

    return points; // Return the list of points
  }

  private getSelectedEntity(entities: Entity[]): Entity | undefined {
    return entities.find((entity) => {
      const selectedComponent = getComponentIfExists(
        entity,
        ComponentType.Selected,
      );
      return selectedComponent !== undefined;
    });
  }
}

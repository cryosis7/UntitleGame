import { screenToGrid } from '../../map/MappingUtils';
import type { UpdateArgs } from '../Framework/Systems';
import type { Position } from '../../map/GameMap';
import type { Entity } from '../../utils/ecsUtils';
import type { EntityTemplate } from '../../utils/EntityFactory';
import { createEntityFromTemplate } from '../../utils/EntityFactory';
import {
  getComponentIfExists,
  hasComponent,
} from '../../components/ComponentOperations';
import { ComponentType } from '../../components';
import {
  addEntities,
  getEntitiesWithComponent,
  removeEntities,
} from '../../utils/EntityUtils';
import { BaseClickSystem } from '../Framework/BaseClickSystem';
import type { FederatedPointerEvent, Point } from 'pixi.js';
import { partitionArray } from '../../../utils';

export class LevelEditorPlacementSystem extends BaseClickSystem {
  private readonly defaultSprite: string = 'grass';
  private hasChanged: boolean = false;
  private placementPositions: Position[] = [];
  private lastClickedPosition: Position | null = null;

  handleClick(event: FederatedPointerEvent, localPosition: Point) {
    this.hasChanged = true;

    const gridPosition = screenToGrid(localPosition);

    // If shift key is pressed, draw a line between the last position and the clicked position
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

    const [sidebarEntities, gameEntities] = partitionArray(entities, (entity) =>
      hasComponent(entity, ComponentType.RenderInSidebar),
    );

    const selectedEntities = getEntitiesWithComponent(
      ComponentType.Selected,
      sidebarEntities,
    );
    if (selectedEntities.length > 1) {
      throw new Error(
        'Multiple selected entities found in EntityPlacementSystem. Only one should be selected at a time.',
      );
    }

    let selectedItem = this.defaultSprite;
    if (selectedEntities.length > 0) {
      const component = getComponentIfExists(
        selectedEntities[0],
        ComponentType.Sprite,
      );
      selectedItem = component?.spriteName ?? this.defaultSprite;
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
          spriteComponent?.spriteName === selectedItem
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

    addEntities(entitiesToAdd);
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
}

import type { System, UpdateArgs } from './Systems';

import {
  getComponentAbsolute,
  getComponentIfExists,
} from '../components/ComponentOperations';
import type { Entity } from '../utils/ecsUtils';
import type { GameMap, Position } from '../map/GameMap';
import type { Container} from 'pixi.js';
import { Sprite } from 'pixi.js';
import { gridToScreenAsTuple } from '../map/MappingUtils';
import { pixiApp } from '../Pixi';
import { ComponentType } from '../components/ComponentTypes';
import type { SpriteComponent } from '../components/individualComponents/SpriteComponent';
import type { PositionComponent } from '../components/individualComponents/PositionComponent';
import { store } from '../../App';
import { getTexture, getTileSizeAtom, mapAtom } from '../utils/Atoms';

export class RenderSystem implements System {
  private renderedEntities: { [id: string]: Sprite } = {};
  private renderedMapSprites: { [id: string]: Sprite } = {};

  constructor() {
    const map = store.get(mapAtom);
    this.addToScreen(map.getContainer(), { x: 0, y: 0 }, pixiApp.stage);
  }

  update({ entities, map }: UpdateArgs) {
    if (map.hasChanged) {
      this.updateMap(map);
      map.hasChanged = false;
    }

    this.updateStage(entities, map.getContainer());
    this.updatePositions(entities);
  }

  // Most of the time, the map will not change, so we can avoid updating the map in these cases.
  private updateMap = (map: GameMap) => {
    const mapEntities = map.getAllEntities();
    const spritesToRemove: string[] = [];
    const mapContainer = map.getContainer();

    mapEntities.forEach((entity: Entity) => {
      const spriteComponent = getComponentIfExists(
        entity,
        ComponentType.Sprite,
      );
      const positionComponent = getComponentIfExists(
        entity,
        ComponentType.Position,
      );

      // 1. Add any new entities to the stage.
      if (
        spriteComponent &&
        positionComponent &&
        !this.renderedMapSprites[entity.id]
      ) {
        const sprite = this.createSprite(spriteComponent.sprite);
        this.addToScreen(sprite, positionComponent, mapContainer);
        this.renderedMapSprites[entity.id] = sprite;
      }

      // 2. Mark for removal any entities that do not have a position component.
      if (!positionComponent) {
        spritesToRemove.push(entity.id);
      }
    });

    Object.entries(this.renderedMapSprites).forEach(([id, sprite]) => {
      const entity = mapEntities.find((e) => e.id === id);
      // 3. Remove any entities that are not in the map anymore.
      if (!entity || spritesToRemove.includes(id)) {
        mapContainer.removeChild(sprite);
        delete this.renderedMapSprites[id];
        return;
      }

      // 4. Update the position of the sprite
      const positionComponent = getComponentAbsolute(
        entity,
        ComponentType.Position,
      );
      this.setPosition(sprite, positionComponent);
    });
  };

  private updateStage = (entities: Entity[], parent: Container) => {
    entities.forEach((entity) => {
      const spriteComponent = getComponentIfExists(
        entity,
        ComponentType.Sprite,
      );

      const positionComponent = getComponentIfExists(
        entity,
        ComponentType.Position,
      );

      if (
        this.shouldAddToStage(entity.id, spriteComponent, positionComponent)
      ) {
        const sprite = this.createSprite(spriteComponent!.sprite);
        this.addToScreen(sprite, positionComponent!, parent);
        this.renderedEntities[entity.id] = sprite;
      } else if (
        this.shouldRemoveFromStage(
          entity.id,
          spriteComponent,
          positionComponent,
        )
      ) {
        parent.removeChild(this.renderedEntities[entity.id]);
        delete this.renderedEntities[entity.id];
      }
    });

    Object.entries(this.renderedEntities).forEach(([id, sprite]) => {
      if (!entities.some((e) => e.id === id)) {
        parent.removeChild(sprite);
        delete this.renderedEntities[id];
      }
    });
  };

  private updatePositions = (entities: Entity[]) => {
    Object.entries(this.renderedEntities).forEach(([id, sprite]) => {
      const entity = entities.find((e) => e.id === id);
      if (!entity) return;

      const positionComponent = getComponentAbsolute(
        entity,
        ComponentType.Position,
      );

      this.setPosition(sprite, positionComponent);
    });
  };

  /**
   * Adds a container to the parent container and sets its position.
   *
   * @param container - The container to be added to the parent.
   * @param position - The position where the container should be placed.
   * @param parent - The parent container to which the container will be added.
   */
  private addToScreen = (
    container: Container,
    position: Position,
    parent: Container,
  ) => {
    parent.addChild(container);
    container.position.set(...gridToScreenAsTuple(position));
  };

  private setPositionById = (id: string, position: PositionComponent) => {
    const container = this.renderedEntities[id] ?? this.renderedMapSprites[id];
    if (container) {
      container.position.set(...gridToScreenAsTuple(position));
    }
  };

  private setPosition = (sprite: Container, position: PositionComponent) => {
    sprite.position.set(...gridToScreenAsTuple(position));
  };

  private createSprite = (name: string) => {
    const texture = getTexture(name);
    if (texture === null) {
      throw Error('No matching texture found for sprite: ' + name);
    }
    const sprite = new Sprite(texture);
    sprite.setSize(store.get(getTileSizeAtom));
    return sprite;
  };

  private shouldAddToStage = (
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) => {
    return (
      spriteComponent !== undefined &&
      positionComponent !== undefined &&
      this.renderedEntities[entityId] === undefined
    );
  };

  private shouldRemoveFromStage = (
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) => {
    return (
      spriteComponent &&
      !positionComponent &&
      this.renderedEntities[entityId] !== undefined
    );
  };
}

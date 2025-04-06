import type { GameMap } from '../map/GameMap';
import type { Entity } from '../utils/ecsUtils';
import {
  getComponentAbsolute,
  getComponentIfExists,
} from '../components/ComponentOperations';
import { ComponentType } from '../components/ComponentTypes';
import type { Container, Sprite } from 'pixi.js';
import { RenderSystem } from './RenderSystem';

export class MapRenderSystem {
  private renderedMapSprites: { [id: string]: Sprite } = {};

  update(map: GameMap, parent: Container) {
    if (map.hasChanged) {
      this.updateMap(map, parent);
      map.hasChanged = false;
    }
  }

  private updateMap(map: GameMap, mapContainer: Container) {
    const mapEntities = map.getAllEntities();
    const spritesToRemove: string[] = [];

    mapEntities.forEach((entity: Entity) => {
      const spriteComponent = getComponentIfExists(
        entity,
        ComponentType.Sprite,
      );
      const positionComponent = getComponentIfExists(
        entity,
        ComponentType.Position,
      );

      if (
        spriteComponent &&
        positionComponent &&
        !this.renderedMapSprites[entity.id]
      ) {
        const sprite = RenderSystem.createSprite(spriteComponent.sprite);
        RenderSystem.addToScreen(sprite, positionComponent, mapContainer);
        this.renderedMapSprites[entity.id] = sprite;
      }

      if (!positionComponent) {
        spritesToRemove.push(entity.id);
      }
    });

    Object.entries(this.renderedMapSprites).forEach(([id, sprite]) => {
      const entity = mapEntities.find((e) => e.id === id);
      if (!entity || spritesToRemove.includes(id)) {
        mapContainer.removeChild(sprite);
        delete this.renderedMapSprites[id];
        return;
      }

      const positionComponent = getComponentAbsolute(
        entity,
        ComponentType.Position,
      );
      RenderSystem.setPosition(sprite, positionComponent);
    });
  }
}

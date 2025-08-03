import type { System, UpdateArgs } from './Systems';

import {
  getComponentAbsolute,
  getComponentIfExists,
  hasAllComponents,
  hasComponent,
} from '../components/ComponentOperations';
import type { Entity } from '../utils/ecsUtils';
import type { GameMap, Position } from '../map/GameMap';
import type { Container } from 'pixi.js';
import { Sprite } from 'pixi.js';
import { gridToScreenAsTuple } from '../map/MappingUtils';
import { pixiApp } from '../Pixi';
import { ComponentType } from '../components/ComponentTypes';
import type { SpriteComponent } from '../components/individualComponents/SpriteComponent';
import {
  getGameRenderedSprites,
  getTexture,
  getTileSizeAtom,
  hasGameSprite,
  mapAtom,
  removeGameSprite,
  setGameSprite,
  store,
} from '../utils/Atoms';

type EntitySpriteMap = {
  [id: string]: { entity?: Entity; sprite?: Container };
};

export class RenderSystem implements System {
  constructor() {
    const map = store.get(mapAtom);
    this.stageContainer(
      map.getSpriteContainer(),
      { x: 0, y: 0 },
      pixiApp.stage,
    );
  }

  update({ entities, map }: UpdateArgs) {
    if (map.hasChanged) {
      this.updateMap(map);
      map.hasChanged = false;
    }

    // Filter out entities that should be rendered in sidebar
    const gameEntities = entities.filter(
      (entity) => !hasComponent(entity, ComponentType.RenderInSidebar),
    );

    const renderedSprites = store.get(getGameRenderedSprites);
    const entitiesWithSprites = this.mergeEntitiesWithSprites(
      gameEntities,
      renderedSprites,
    );

    this.updateStage(entitiesWithSprites, pixiApp.stage);
    this.updatePositions(entitiesWithSprites);
  }

  private readonly updateMap = (map: GameMap) => {
    const container = map.getSpriteContainer();
    map.getAllEntities().forEach((entity) => {
      const spriteComponent = getComponentAbsolute(
        entity,
        ComponentType.Sprite,
      );
      const positionComponent = getComponentAbsolute(
        entity,
        ComponentType.Position,
      );

      if (!store.get(hasGameSprite)(entity.id)) {
        const texture = getTexture(spriteComponent.spriteName);
        if (texture === null) {
          throw Error(
            `No matching texture found for sprite: ${spriteComponent.spriteName}`,
          );
        }
        const sprite = new Sprite(texture);
        sprite.setSize(store.get(getTileSizeAtom));

        container.addChild(sprite);
        store.set(setGameSprite, { entityId: entity.id, sprite: sprite });
      }

      const sprite = store.get(getGameRenderedSprites)[entity.id];
      sprite.position.set(...gridToScreenAsTuple(positionComponent));
    });
  };

  private readonly mergeEntitiesWithSprites = (
    entities: Entity[],
    renderedSprites: Record<string, Container>,
  ): EntitySpriteMap => {
    const map: EntitySpriteMap = {};

    // Merge entities with their matching sprites, if they exist.
    entities.forEach((entity) => {
      const sprite = renderedSprites[entity.id];
      map[entity.id] = { entity, sprite };
      delete renderedSprites[entity.id];
    });

    // Add remaining sprites that are not associated with any entity
    for (const id in renderedSprites) {
      map[id] = { sprite: renderedSprites[id] };
    }

    return map;
  };

  private readonly updateStage = (
    entitySpriteMap: EntitySpriteMap,
    stage: Container,
  ) => {
    Object.entries(entitySpriteMap).forEach(
      ([entityId, { entity, sprite }]) => {
        // 1. If the entity has not been added to the stage yet, add it.
        if (entity && !sprite) {
          const spriteComponent = getComponentIfExists(
            entity,
            ComponentType.Sprite,
          );
          const positionComponent = getComponentIfExists(
            entity,
            ComponentType.Position,
          );

          if (spriteComponent && positionComponent) {
            const newSprite = this.createSprite(spriteComponent!);
            stage.addChild(newSprite);
            entitySpriteMap[entityId].sprite = newSprite;
            store.set(setGameSprite, { entityId, sprite: newSprite });
          }
        }

        // 2. If the entity no longer has the required components for rendering, remove it from the stage.
        // 3. If the entity no longer exists in the game, remove it from the stage.
        if (this.shouldRemoveFromScreen(sprite, entity)) {
          stage.removeChild(sprite);
          delete entitySpriteMap[entityId];
          store.set(removeGameSprite, entityId);
        }
      },
    );
  };

  private readonly updatePositions = (entitySpriteMap: EntitySpriteMap) => {
    Object.entries(entitySpriteMap).forEach(([, { entity, sprite }]) => {
      if (!entity || !sprite) {
        throw new Error(
          'Encountered item without sprite or entity during position update of render cycle.',
        );
      }

      const positionComponent = getComponentAbsolute(
        entity,
        ComponentType.Position,
      );
      sprite.position.set(...gridToScreenAsTuple(positionComponent));
    });
  };

  private readonly stageContainer = (
    container: Container,
    position: Position,
    parent: Container,
  ) => {
    container.position.set(...gridToScreenAsTuple(position));
    parent.addChild(container);
  };
  private readonly createSprite = (spriteComponent: SpriteComponent) => {
    const texture = getTexture(spriteComponent.spriteName);
    if (texture === null) {
      throw Error(
        `No matching texture found for sprite: ${spriteComponent.spriteName}`,
      );
    }
    const sprite = new Sprite(texture);
    sprite.setSize(store.get(getTileSizeAtom));
    return sprite;
  };

  private shouldRemoveFromScreen = (
    sprite?: Container,
    entity?: Entity,
  ): sprite is Container => {
    return (
      sprite !== undefined &&
      (!entity ||
        !hasAllComponents(entity, ComponentType.Sprite, ComponentType.Position))
    );
  };
}

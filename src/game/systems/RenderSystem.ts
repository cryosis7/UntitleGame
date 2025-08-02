import type { System, UpdateArgs } from './Systems';

import {
  getComponentAbsolute,
  getComponentIfExists,
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
import type { PositionComponent } from '../components/individualComponents/PositionComponent';
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

    this.updateStage(gameEntities, pixiApp.stage);
    this.updatePositions(gameEntities);
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

  private readonly updatePositions = (entities: Entity[]) => {
    const renderedEntities = store.get(getGameRenderedSprites);

    entities.forEach((entity) => { // TODO: Fix. Picking up the key breaks this. It's still trying to update it's position.
      const positionComponent = getComponentAbsolute(
        entity,
        ComponentType.Position,
      );

      const sprite = renderedEntities[entity.id];
      if (sprite) {
        sprite.position.set(...gridToScreenAsTuple(positionComponent));
      }
    });
  };

  private readonly updateStage = (entities: Entity[], stage: Container) => {
    const renderedEntities = store.get(getGameRenderedSprites);

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
        this.shouldAddToStage(
          entity.id,
          spriteComponent,
          positionComponent,
          renderedEntities,
        )
      ) {
        this.addToScreen(spriteComponent!, entity, stage);
      } else if (
        this.shouldRemoveFromStage(
          entity.id,
          spriteComponent,
          positionComponent
        )
      ) {
        this.removeFromScreen(renderedEntities, entity, stage);
      }
    });

    this.cleanUpMissingEntities(entities, stage);
  };

  private readonly cleanUpMissingEntities = (
    entities: Entity[],
    stage: Container,
  ) => {
    const renderedEntities = store.get(getGameRenderedSprites);
    for (const entityId in renderedEntities) {
      if (!entities.some((e) => e.id === entityId)) {
        stage.removeChild(renderedEntities[entityId]);
        store.set(removeGameSprite, entityId);
      }
    }
  };
  private readonly stageContainer = (
    container: Container,
    position: Position,
    parent: Container,
  ) => {
    container.position.set(...gridToScreenAsTuple(position));
    parent.addChild(container);
  };

  private readonly addToScreen = (
    spriteComponent: SpriteComponent,
    entity: Entity,
    stage: Container,
  ) => {
    const texture = getTexture(spriteComponent.spriteName);
    if (texture === null) {
      throw Error(
        `No matching texture found for sprite: ${spriteComponent.spriteName}`,
      );
    }
    const sprite = new Sprite(texture);
    sprite.setSize(store.get(getTileSizeAtom));

    stage.addChild(sprite);
    store.set(setGameSprite, { entityId: entity.id, sprite: sprite });
  };

  private readonly removeFromScreen = (
    renderedEntities: Record<string, Container>,
    entity: Entity,
    stage: Container,
  ) => {
    const sprite = renderedEntities[entity.id];
    if (sprite) {
      stage.removeChild(sprite);
      delete renderedEntities[entity.id];
    }
  };

  private readonly shouldAddToStage = (
    entityId: string,
    spriteComponent: SpriteComponent | undefined,
    positionComponent: PositionComponent | undefined,
    renderedEntities: Record<string, Container>,
  ) => {
    return (
      spriteComponent !== undefined &&
      positionComponent !== undefined &&
      renderedEntities[entityId] === undefined
    );
  };

  /**
   * Determines if an entity's sprite should be removed from the stage.
   * True if the entity has a sprite, no position, and is currently rendered; otherwise, false.
   *
   * @param entityId - The unique identifier of the entity.
   * @param spriteComponent - The sprite component of the entity, if it exists.
   * @param positionComponent - The position component of the entity, if it exists.
   * @returns True if the entity has a sprite, no position, and is currently rendered; otherwise, false.
   */
  private readonly shouldRemoveFromStage = (
    entityId: string,
    spriteComponent: SpriteComponent | undefined,
    positionComponent: PositionComponent | undefined,
  ) => {
    return (
      spriteComponent && !positionComponent && store.get(hasGameSprite)(entityId)
    );
  };
}

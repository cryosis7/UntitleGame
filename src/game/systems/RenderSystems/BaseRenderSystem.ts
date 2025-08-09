import type { System, UpdateArgs } from '../Systems';
import type { Entity } from '../../utils/ecsUtils';
import type { Container } from 'pixi.js';
import { Sprite } from 'pixi.js';
import type { Position } from '../../map/GameMap';
import { gridToScreenAsTuple } from '../../map/MappingUtils';
import type { PositionComponent, SpriteComponent } from '../../components';
import type { RenderSection } from '../../components/individualComponents/RenderComponent';
import {
  getTexture,
  getTileSizeAtom,
  removeSprite,
  renderedEntities,
  setSprite,
  store,
} from '../../utils/Atoms';
import {
  getComponentAbsolute,
  getComponentIfExists,
  hasAllComponents,
} from '../../components/ComponentOperations';
import { ComponentType } from '../../components/ComponentTypes';
import { pixiApp } from '../../Pixi';

type EntitySpriteMap = {
  [id: string]: { entity?: Entity; sprite?: Container };
};

export abstract class BaseRenderSystem implements System {
  protected tileSize: number = store.get(getTileSizeAtom);

  protected stage: Container;
  protected renderSectionAtomKey: RenderSection;

  protected constructor(
    container: Container,
    renderSectionAtomKey: RenderSection,
    position: [number, number],
  ) {
    this.stage = container;
    this.renderSectionAtomKey = renderSectionAtomKey;

    pixiApp.stage.addChild(container);
    container.position.set(...position);
  }

  update(updateArgs: UpdateArgs) {
    this.updateStageAndPositions(updateArgs.entities);
  }

  protected updateStageAndPositions = (entities: Entity[]) => {
    const renderedSprites = {
      ...store.get(renderedEntities)[this.renderSectionAtomKey],
    };
    const entitiesWithSprites = this.mergeEntitiesWithSprites(
      entities,
      renderedSprites,
    );

    this.updateStage(entitiesWithSprites);
    this.updatePositions(entitiesWithSprites);
  };

  private mergeEntitiesWithSprites = (
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

  private updateStage = (entitySpriteMap: EntitySpriteMap) => {
    Object.entries(entitySpriteMap).forEach(
      ([entityId, { entity, sprite }]) => {
        if (entity) {
          const spriteComponent = getComponentIfExists(
            entity,
            ComponentType.Sprite,
          );
          const positionComponent = getComponentIfExists(
            entity,
            ComponentType.Position,
          );
          if (
            this.shouldAddToScreen(
              sprite,
              entity,
              spriteComponent,
              positionComponent,
            )
          ) {
            const newSprite = this.createSprite(spriteComponent!);
            this.stage.addChild(newSprite);
            entitySpriteMap[entityId].sprite = newSprite;
            store.set(setSprite, {
              section: this.renderSectionAtomKey,
              entityId,
              sprite: newSprite,
            });
          }
        }

        // 2. If the entity no longer has the required components for rendering, remove it from the stage.
        // 3. If the entity no longer exists in the game, remove it from the stage.
        if (this.shouldRemoveFromScreen(sprite, entity)) {
          this.stage.removeChild(sprite);
          delete entitySpriteMap[entityId];
          store.set(removeSprite, {
            section: this.renderSectionAtomKey,
            entityId,
          });
        }
      },
    );
  };

  private updatePositions = (entitySpriteMap: EntitySpriteMap) => {
    Object.entries(entitySpriteMap).forEach(([, { entity, sprite }]) => {
      if (!entity || !sprite) {
        return;
      }

      const positionComponent = getComponentAbsolute(
        entity,
        ComponentType.Position,
      );
      sprite.position.set(...gridToScreenAsTuple(positionComponent));
    });
  };

  protected readonly shouldAddToScreen = (
    sprite?: Container,
    entity?: Entity,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) => {
    return (
      sprite === undefined &&
      entity !== undefined &&
      spriteComponent !== undefined &&
      positionComponent !== undefined
    );
  };

  protected readonly shouldRemoveFromScreen = (
    sprite?: Container,
    entity?: Entity,
  ): sprite is Container => {
    return (
      sprite !== undefined &&
      (!entity ||
        !hasAllComponents(entity, ComponentType.Sprite, ComponentType.Position))
    );
  };

  protected stageContainer = (
    child: Container,
    position: Position,
    parent: Container,
  ) => {
    child.position.set(...gridToScreenAsTuple(position));
    parent.addChild(child);
  };

  protected createSprite = (spriteComponent: SpriteComponent) => {
    const texture = getTexture(spriteComponent.spriteName);
    if (texture === null) {
      throw Error(
        `No matching texture found for sprite: ${spriteComponent.spriteName}`,
      );
    }

    const sprite = new Sprite(texture);
    sprite.setSize(this.tileSize);
    return sprite;
  };
}

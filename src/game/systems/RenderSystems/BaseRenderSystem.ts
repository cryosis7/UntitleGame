import { Container, Sprite } from 'pixi.js';
import type { Entity } from '../../utils/ecsUtils';
import { getComponentIfExists } from '../../components/ComponentOperations';
import { ComponentType } from '../../components/ComponentTypes';
import type { SpriteComponent } from '../../components/individualComponents/SpriteComponent';
import type { PositionComponent } from '../../components/individualComponents/PositionComponent';
import type { Position } from '../../map/GameMap';
import { gridToScreenAsTuple } from '../../map/MappingUtils';
import type { InterfaceConfig, RenderConfig } from '../../atoms/Atoms';
import { getTextureAtom } from '../../atoms/Atoms';
import { pixiApp } from '../../Pixi';
import { store } from '../../../App';

export abstract class BaseRenderSystem {
  protected renderedEntities: {
    [id: string]: { sprite: Sprite; position: PositionComponent };
  } = {};
  protected rootContainer: Container;
  protected interfaceConfig: InterfaceConfig;

  protected constructor(config: RenderConfig) {
    this.interfaceConfig = config.interfaceConfig;

    if (config.rootContainer === null) {
      console.warn(
        'Root container is not initialised - this may be an error and may lead to bugs...',
      );
    }

    this.rootContainer = config.rootContainer ?? new Container();
    pixiApp.stage.addChild(this.rootContainer);
  }

  public update(entities: Entity[]) {
    this.updateStage(entities);
    this.updatePositions();
  }

  protected updateStage(entities: Entity[]) {
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
        this.addToScreen(sprite, positionComponent!);
        this.renderedEntities[entity.id] = {
          sprite,
          position: positionComponent!,
        };
      } else if (this.shouldRemoveFromStage(entity.id, positionComponent)) {
        this.rootContainer.removeChild(this.renderedEntities[entity.id].sprite);
        delete this.renderedEntities[entity.id];
        return;
      }

      if (positionComponent) {
        this.renderedEntities[entity.id].position = positionComponent;
      }
    });

    Object.entries(this.renderedEntities).forEach(([id, { sprite }]) => {
      if (!entities.some((e) => e.id === id)) {
        this.rootContainer.removeChild(sprite);
        delete this.renderedEntities[id];
      }
    });
  }

  protected updatePositions() {
    Object.entries(this.renderedEntities).forEach(
      ([id, { sprite, position }]) => {
        this.setPosition(sprite, position);
      },
    );
  }

  private addToScreen(container: Container, position: Position) {
    this.rootContainer.addChild(container);
    this.setPosition(container, position);
  }

  private setPosition(container: Container, position: Position) {
    container.position.set(
      ...gridToScreenAsTuple(position, this.interfaceConfig),
    );
  }

  private createSprite(name: string) {
    const texture = store.get(getTextureAtom)(name);
    if (texture === null) {
      throw new Error(`Texture ${name} not found`);
    }
    const sprite = new Sprite(texture);
    sprite.setSize(this.interfaceConfig.tileSize);
    return sprite;
  }

  private shouldAddToStage(
    entityId: string,
    spriteComponent?: SpriteComponent,
    positionComponent?: PositionComponent,
  ) {
    return (
      spriteComponent !== undefined &&
      positionComponent !== undefined &&
      this.renderedEntities[entityId] === undefined
    );
  }

  private shouldRemoveFromStage(
    entityId: string,
    positionComponent?: PositionComponent,
  ) {
    return !positionComponent && this.renderedEntities[entityId] !== undefined;
  }
}

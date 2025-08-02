import type { System, UpdateArgs } from '../Systems';
import { Container, Graphics, Sprite } from 'pixi.js';
import { pixiApp } from '../../Pixi';
import { ComponentType } from '../../components/ComponentTypes';
import { getEntitiesWithComponents } from '../../utils/EntityUtils';
import {
  getComponentAbsolute,
  getComponentIfExists,
} from '../../components/ComponentOperations';
import { gridToScreenAsTuple } from '../../map/MappingUtils';
import {
  getSidebarRenderedSprites,
  getTexture,
  getTileSizeAtom,
  setSidebarSprite,
  store,
} from '../../utils/Atoms';
import type { SpriteComponent } from '../../components/individualComponents/SpriteComponent';
import type { Entity } from '../../utils/ecsUtils';

export class RenderSidebarSystem implements System {
  private readonly sidebarWidth = 150;
  private readonly sidebarContainer: Container;

  constructor() {
    this.sidebarContainer = new Container({
      width: this.sidebarWidth,
      height: pixiApp.canvas.height,
    }).addChild(
      new Graphics({
        x: 0,
        y: 0,
      })
        .rect(0, 0, this.sidebarWidth, pixiApp.canvas.height)
        .fill(0xd3d3d3),
    );
    pixiApp.stage.addChild(this.sidebarContainer);

    this.sidebarContainer.position.set(
      pixiApp.canvas.width - this.sidebarWidth,
      0,
    );
  }

  update({ entities }: UpdateArgs) {
    const sidebarEntities = getEntitiesWithComponents(
      [ComponentType.RenderInSidebar, ComponentType.Sprite],
      entities,
    );
    const renderedEntities = store.get(getSidebarRenderedSprites);

    sidebarEntities.forEach((entity) => {
      const spriteComponent = getComponentAbsolute(
        entity,
        ComponentType.Sprite,
      );
      const positionComponent = getComponentIfExists(
        entity,
        ComponentType.Position,
      );

      // Remove any from the sidebar that are no longer have position components
      if (positionComponent === undefined && renderedEntities[entity.id]) {
        this.removeFromScreen(renderedEntities, entity);
        return;
      }

      // No position and no rendered entity means it's not on the screen and doesn't need to be.
      if (!positionComponent) {
        return;
      }

      // If the entity is not already rendered, add it to the screen.
      if (renderedEntities[entity.id] === undefined) {
        this.addToScreen(spriteComponent, entity);
      }

      // Update the position of the sprite on the screen.
      // TODO: Should really only be updating the position if it has changed.
      const sprite = renderedEntities[entity.id];
      sprite.position.set(
        ...gridToScreenAsTuple(positionComponent, {
          tileSize: store.get(getTileSizeAtom),
          gap: 4,
        }),
      );
    });
  }

  private removeFromScreen(
    renderedEntities: Record<string, Container>,
    entity: Entity,
  ) {
    this.sidebarContainer.removeChild(renderedEntities[entity.id]);
    delete renderedEntities[entity.id];
  }

  private addToScreen(spriteComponent: SpriteComponent, entity: Entity) {
    const texture = getTexture(spriteComponent.spriteName);
    if (texture === null) {
      throw Error(
        `No matching texture found for sprite: ${spriteComponent.spriteName}`,
      );
    }
    const sprite = new Sprite(texture);
    sprite.setSize(store.get(getTileSizeAtom));

    this.sidebarContainer.addChild(sprite);
    store.set(setSidebarSprite, { entityId: entity.id, sprite: sprite });
  }
}

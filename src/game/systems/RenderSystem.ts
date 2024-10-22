import { getComponent } from '../utils/ecsUtils';
import type { System, UpdateArgs } from './Systems';
import type { PositionComponent, SpriteComponent } from '../components/Components';
import { pixiApp } from '../PixiStage';

export class RenderSystem implements System {
  update({ entities }: UpdateArgs) {
    entities?.forEach((entity) => {
      const spriteComponent = getComponent<SpriteComponent>(entity, 'sprite');
      const positionComponent = getComponent<PositionComponent>(
        entity,
        'position',
      );

      if (!spriteComponent || !positionComponent) return;

      spriteComponent.sprite.position.set(
        positionComponent.x * (pixiApp.screen.width / 10),
        positionComponent.y * (pixiApp.screen.height / 10),
      );
    });
  }
}

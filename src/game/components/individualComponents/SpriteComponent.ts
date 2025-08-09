import { ComponentType } from '../ComponentTypes';

export type SpriteComponentProps = { sprite: string };

export class SpriteComponent {
  type = ComponentType.Sprite;
  spriteName: string;

  constructor({ sprite }: SpriteComponentProps) {
    this.spriteName = sprite;
  }
}

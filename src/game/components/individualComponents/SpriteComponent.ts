import { ComponentType } from '../ComponentTypes';

export type SpriteComponentProps = { spriteName: string };

export class SpriteComponent {
  type = ComponentType.Sprite;
  spriteName: string;

  constructor({ spriteName }: SpriteComponentProps) {
    this.spriteName = spriteName;
  }
}

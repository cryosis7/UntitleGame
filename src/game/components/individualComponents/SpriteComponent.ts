import { ComponentType } from '../ComponentTypes';

export type SpriteComponentProps = { sprite: string };

export class SpriteComponent {
  type = ComponentType.Sprite;
  sprite: string;

  constructor({ sprite }: SpriteComponentProps) {
    this.sprite = sprite;
  }
}

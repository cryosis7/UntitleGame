import { ComponentType } from '../ComponentTypes';

export type SpriteComponentProps = { sprite: string };

export class SpriteComponent {
  type = ComponentType.Sprite;
  sprite: string;

  constructor({ sprite }: SpriteComponentProps) {
    this.sprite = sprite;
  }
  //   const texture = getTexture(sprite);
  //   if (texture === null) {
  //     throw Error('No matching texture found for sprite: ' + sprite);
  //   }
  //
  //   this.sprite = new Sprite(texture);
  //   this.sprite.setSize(store.get(getTileSizeAtom));
  // }
}

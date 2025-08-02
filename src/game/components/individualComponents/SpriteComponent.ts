import { ComponentType } from '../ComponentTypes';

export type SpriteComponentProps = { sprite: string };

export class SpriteComponent {
  type = ComponentType.Sprite;
  spriteName: string;

  constructor({ sprite }: SpriteComponentProps) {
    // const texture = getTexture(sprite);
    // if (texture === null) {
    //   throw Error('No matching texture found for sprite: ' + sprite);
    // }

    // this.spriteName = new Sprite(texture);
    // this.spriteName.setSize(store.get(getTileSizeAtom));
    this.spriteName = sprite;
  }
}

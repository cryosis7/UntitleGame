import {
  Application,
  Assets,
  Spritesheet,
  SpriteSheetJson,
  Texture,
} from 'pixi.js';
import { basicSpritesheet } from '../assets/basicSpritesheet';
import { addSpritesheetAtom } from './utils/Atoms';
import { store } from '../App';
import { originalImages } from '../assets/originalImages';

export const pixiApp = new Application();

export const initPixiApp = async (appContainer: HTMLDivElement) => {
  await pixiApp.init({
    background: 'slategray',
    resizeTo: appContainer,
  });
  appContainer.appendChild(pixiApp.canvas);
  // @ts-ignore
  globalThis.__PIXI_APP__ = pixiApp;
};

export const preload = async () => {
  const spritesheets: SpriteSheetJson[] = [originalImages, basicSpritesheet];

  for (const spritesheetData of spritesheets) {
    await Assets.load(`/assets/images/${spritesheetData.meta.image}`);
    const sheet = new Spritesheet(
      Texture.from(`/assets/images/${spritesheetData.meta.image}`),
      spritesheetData,
    );
    await sheet.parse();
    store.set(addSpritesheetAtom, sheet);
  }
};

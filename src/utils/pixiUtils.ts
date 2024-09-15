import { Application, Graphics } from 'pixi.js';

export const setupPixi = async (canvas: HTMLCanvasElement) => {
  const app = new Application();
  
  await app.init({
    view: canvas,
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
  });

  // Add a rectangle to the stage
  const rectangle = new Graphics();
  rectangle.beginFill(0x66CCFF);
  rectangle.drawRect(0, 0, 64, 64);
  rectangle.endFill();
  rectangle.x = 170;
  rectangle.y = 170;
  app.stage.addChild(rectangle);

  return app;
};


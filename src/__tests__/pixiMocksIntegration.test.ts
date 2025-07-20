import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the pixi.js module before importing our code
vi.mock('pixi.js', async () => {
  const { 
    Application, 
    Container, 
    Sprite, 
    Graphics, 
    Ticker, 
    Spritesheet, 
    Texture, 
    Assets 
  } = await import('./mocks/pixiMocks');
  
  return {
    Application,
    Container,
    Sprite,
    Graphics,
    Ticker,
    Spritesheet,
    Texture,
    Assets,
  };
});

// Now import the code that uses Pixi.js
import { setupPixiMocks } from './mocks/pixiMocks';

describe('Pixi.js Mocks Integration with Game Code', () => {
  beforeEach(() => {
    setupPixiMocks();
  });

  it('should work with Application creation pattern', async () => {
    const { Application } = await import('pixi.js');
    
    const app = new Application();
    await app.init({
      backgroundAlpha: 0,
      resizeTo: document.body,
    });
    
    expect(app.stage).toBeDefined();
    expect(app.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(app.init).toHaveBeenCalledWith({
      backgroundAlpha: 0,
      resizeTo: document.body,
    });
  });

  it('should work with Container hierarchy pattern', async () => {
    const { Container } = await import('pixi.js');
    
    const parent = new Container();
    const child = new Container();
    
    parent.addChild(child);
    
    expect(parent.children).toContain(child);
    expect(child.parent).toBe(parent);
  });

  it('should work with Assets loading pattern', async () => {
    const { Assets } = await import('pixi.js');
    
    const texture = await Assets.load('/assets/images/test.png');
    
    expect(texture).toBeDefined();
    expect(texture.width).toBe(100);
    expect(texture.height).toBe(100);
    expect(Assets.load).toHaveBeenCalledWith('/assets/images/test.png');
  });

  it('should work with Spritesheet pattern', async () => {
    const { Spritesheet, Texture } = await import('pixi.js');
    
    const texture = Texture.from('/assets/images/spritesheet.png');
    const mockData = { 
      frames: {}, 
      meta: { 
        image: 'spritesheet.png', 
        format: 'RGBA8888',
        size: { w: 100, h: 100 },
        scale: '1'
      } 
    };
    const spritesheet = new Spritesheet(texture, mockData);
    
    await spritesheet.parse();
    
    expect(spritesheet.parse).toHaveBeenCalled();
    expect(spritesheet.textures).toBeDefined();
  });

  it('should work with Sprite creation pattern', async () => {
    const { Sprite, Texture } = await import('pixi.js');
    
    const texture = Texture.from('/assets/images/sprite.png');
    const sprite = new Sprite();
    sprite.texture = texture;
    
    expect(sprite.texture).toBe(texture);
    expect(sprite.anchor).toEqual({ x: 0, y: 0 });
  });

  it('should work with Graphics drawing pattern', async () => {
    const { Graphics } = await import('pixi.js');
    
    const graphics = new Graphics();
    graphics.clear()
      .beginFill(0xFF0000)
      .drawRect(0, 0, 100, 100)
      .endFill();
    
    expect(graphics.clear).toHaveBeenCalled();
    expect(graphics.beginFill).toHaveBeenCalledWith(0xFF0000);
    expect(graphics.drawRect).toHaveBeenCalledWith(0, 0, 100, 100);
    expect(graphics.endFill).toHaveBeenCalled();
  });

  it('should work with Ticker pattern', async () => {
    const { Ticker } = await import('pixi.js');
    
    const ticker = new Ticker();
    const callback = vi.fn();
    
    ticker.add(callback);
    ticker.start();
    
    expect(ticker.add).toHaveBeenCalledWith(callback);
    expect(ticker.started).toBe(true);
    
    ticker.stop();
    expect(ticker.started).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpriteComponent, type SpriteComponentProps } from '../SpriteComponent';
import { ComponentType } from '../../ComponentTypes';
import { setupPixiMocks } from '../../../../__tests__/mocks/pixiMocks';

// Mock pixi.js at the module level
vi.mock('pixi.js', () => {
  class MockSprite {
    x = 0;
    y = 0;
    width = 100;
    height = 100;
    visible = true;
    alpha = 1;
    scale = { x: 1, y: 1 };
    position = { x: 0, y: 0 };
    texture = null;
    anchor = { x: 0, y: 0 };
    tint = 0xFFFFFF;
    setSize = vi.fn().mockImplementation(function(this: any, size: number) {
      this.width = size;
      this.height = size;
    });
    destroy = vi.fn();

    constructor(texture?: any) {
      this.texture = texture;
    }
  }
  
  const mockTexture = () => ({
    width: 100,
    height: 100,
    valid: true,
    destroyed: false,
    source: null,
    destroy: vi.fn(),
  });
  
  return {
    Sprite: MockSprite,
    Texture: {
      from: vi.fn(() => mockTexture()),
      WHITE: mockTexture(),
      EMPTY: mockTexture(),
    }
  };
});

// Mock the atoms and store dependencies
vi.mock('../../../utils/Atoms', () => ({
  getTexture: vi.fn(),
  getTileSizeAtom: { key: 'tileSize' }
}));

vi.mock('../../../../App', () => ({
  store: {
    get: vi.fn()
  }
}));

const { getTexture } = await import('../../../utils/Atoms');
const { store } = await import('../../../../App');

describe('SpriteComponent', () => {
  beforeEach(() => {
    setupPixiMocks();
    vi.clearAllMocks();
    
    // Setup default mocks
    (getTexture as any).mockReturnValue({ width: 32, height: 32 });
    (store.get as any).mockReturnValue({ width: 32, height: 32 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Creation', () => {
    it('should create a sprite component with valid sprite name', () => {
      const props: SpriteComponentProps = { sprite: 'player' };
      const component = new SpriteComponent(props);

      expect(component.type).toBe(ComponentType.Sprite);
      expect(component.sprite).toBeDefined();
      expect(component.sprite).toHaveProperty('x');
      expect(component.sprite).toHaveProperty('y');
    });

    it('should create component with different sprite types', () => {
      const spriteNames = ['player', 'wall', 'dirt', 'boulder'];
      
      spriteNames.forEach(spriteName => {
        (getTexture as any).mockReturnValue({ width: 32, height: 32 });
        const component = new SpriteComponent({ sprite: spriteName });
        
        expect(component.type).toBe(ComponentType.Sprite);
        expect(component.sprite).toBeDefined();
        expect(getTexture).toHaveBeenCalledWith(spriteName);
      });
    });

    it('should set sprite size from tile size atom', () => {
      const tileSize = { width: 64, height: 64 };
      (store.get as any).mockReturnValue(tileSize);
      
      const component = new SpriteComponent({ sprite: 'test' });
      
      expect(store.get).toHaveBeenCalled();
      expect(component.sprite.setSize).toHaveBeenCalledWith(tileSize);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when texture is not found', () => {
      (getTexture as any).mockReturnValue(null);
      
      expect(() => new SpriteComponent({ sprite: 'nonexistentSprite' }))
        .toThrow('No matching texture found for sprite: nonexistentSprite');
    });

    it('should handle different invalid sprite names', () => {
      (getTexture as any).mockReturnValue(null);
      
      expect(() => new SpriteComponent({ sprite: 'invalid' }))
        .toThrow('No matching texture found for sprite: invalid');
      
      expect(() => new SpriteComponent({ sprite: 'missing' }))
        .toThrow('No matching texture found for sprite: missing');
    });

    it('should provide meaningful error messages', () => {
      (getTexture as any).mockReturnValue(null);
      const spriteName = 'customSpriteName';
      
      expect(() => new SpriteComponent({ sprite: spriteName }))
        .toThrow(new RegExp(spriteName));
    });
  });

  describe('Component Type', () => {
    it('should always have the correct component type', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      expect(component.type).toBe(ComponentType.Sprite);
    });

    it('should maintain type consistency across instances', () => {
      const component1 = new SpriteComponent({ sprite: 'sprite1' });
      const component2 = new SpriteComponent({ sprite: 'sprite2' });
      
      expect(component1.type).toBe(component2.type);
      expect(component1.type).toBe(ComponentType.Sprite);
    });
  });

  describe('Pixi.js Integration', () => {
    it('should create Pixi.js Sprite instance', () => {
      const mockTexture = { width: 32, height: 32 };
      (getTexture as any).mockReturnValue(mockTexture);
      
      const component = new SpriteComponent({ sprite: 'test' });
      
      expect(component.sprite).toBeDefined();
      expect(component.sprite.constructor.name).toBe('MockSprite');
    });

    it('should pass texture to Pixi.js Sprite constructor', () => {
      const mockTexture = { width: 64, height: 64, name: 'testTexture' };
      (getTexture as any).mockReturnValue(mockTexture);
      
      const component = new SpriteComponent({ sprite: 'test' });
      
      expect(getTexture).toHaveBeenCalledWith('test');
      expect(component.sprite).toBeDefined();
    });

    it('should handle different texture sizes', () => {
      const textureSizes = [
        { width: 16, height: 16 },
        { width: 32, height: 32 },
        { width: 64, height: 64 },
        { width: 128, height: 128 }
      ];
      
      textureSizes.forEach(textureSize => {
        (getTexture as any).mockReturnValue(textureSize);
        
        const component = new SpriteComponent({ sprite: 'test' });
        expect(component.sprite).toBeDefined();
      });
    });
  });

  describe('Sprite Properties', () => {
    it('should have access to sprite properties', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      expect(component.sprite).toHaveProperty('x');
      expect(component.sprite).toHaveProperty('y');
      expect(component.sprite).toHaveProperty('visible');
      expect(component.sprite).toHaveProperty('alpha');
    });

    it('should allow sprite property modification', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      component.sprite.x = 100;
      component.sprite.y = 200;
      component.sprite.alpha = 0.5;
      
      expect(component.sprite.x).toBe(100);
      expect(component.sprite.y).toBe(200);
      expect(component.sprite.alpha).toBe(0.5);
    });

    it('should support sprite visibility toggle', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      component.sprite.visible = false;
      expect(component.sprite.visible).toBe(false);
      
      component.sprite.visible = true;
      expect(component.sprite.visible).toBe(true);
    });
  });

  describe('Tile Size Integration', () => {
    it('should use different tile sizes', () => {
      const tileSizes = [
        { width: 16, height: 16 },
        { width: 32, height: 32 },
        { width: 64, height: 64 }
      ];
      
      tileSizes.forEach(tileSize => {
        (store.get as any).mockReturnValue(tileSize);
        
        const component = new SpriteComponent({ sprite: 'test' });
        
        expect(component.sprite.setSize).toHaveBeenCalledWith(tileSize);
      });
    });

    it('should handle non-square tile sizes', () => {
      const tileSize = { width: 32, height: 48 };
      (store.get as any).mockReturnValue(tileSize);
      
      const component = new SpriteComponent({ sprite: 'test' });
      
      expect(component.sprite.setSize).toHaveBeenCalledWith(tileSize);
    });

    it('should call setSize on sprite creation', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      expect(component.sprite.setSize).toHaveBeenCalled();
    });
  });

  describe('Rendering System Integration', () => {
    it('should be compatible with rendering systems', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      // Simulate rendering system operations
      const sprite = component.sprite;
      expect(sprite).toBeDefined();
      expect(typeof sprite.x).toBe('number');
      expect(typeof sprite.y).toBe('number');
    });

    it('should support sprite positioning', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      // Simulate position updates from rendering system
      component.sprite.x = 64;
      component.sprite.y = 128;
      
      expect(component.sprite.x).toBe(64);
      expect(component.sprite.y).toBe(128);
    });

    it('should work with sprite transformation', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      // Simulate transformations
      component.sprite.scale.x = 2;
      component.sprite.scale.y = 2;
      
      expect(component.sprite.scale.x).toBe(2);
      expect(component.sprite.scale.y).toBe(2);
    });
  });

  describe('Resource Management', () => {
    it('should handle sprite cleanup', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      // Sprite should have destroy method for cleanup
      expect(component.sprite.destroy).toBeDefined();
      expect(typeof component.sprite.destroy).toBe('function');
    });

    it('should support sprite destruction', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      component.sprite.destroy();
      expect(component.sprite.destroy).toHaveBeenCalled();
    });
  });

  describe('Different Sprite Types', () => {
    it('should handle player sprites', () => {
      const component = new SpriteComponent({ sprite: 'player' });
      
      expect(component.type).toBe(ComponentType.Sprite);
      expect(getTexture).toHaveBeenCalledWith('player');
    });

    it('should handle environment sprites', () => {
      const environmentSprites = ['wall', 'dirt', 'grass', 'water'];
      
      environmentSprites.forEach(spriteName => {
        const component = new SpriteComponent({ sprite: spriteName });
        
        expect(component.type).toBe(ComponentType.Sprite);
        expect(getTexture).toHaveBeenCalledWith(spriteName);
      });
    });

    it('should handle item sprites', () => {
      const itemSprites = ['sword', 'potion', 'key', 'gem'];
      
      itemSprites.forEach(spriteName => {
        const component = new SpriteComponent({ sprite: spriteName });
        
        expect(component.type).toBe(ComponentType.Sprite);
        expect(getTexture).toHaveBeenCalledWith(spriteName);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sprite names', () => {
      (getTexture as any).mockReturnValue(null);
      
      expect(() => new SpriteComponent({ sprite: '' }))
        .toThrow('No matching texture found for sprite: ');
    });

    it('should handle special character sprite names', () => {
      const specialNames = ['sprite-1', 'sprite_2', 'sprite.png', 'sprite@2x'];
      
      specialNames.forEach(spriteName => {
        (getTexture as any).mockReturnValue({ width: 32, height: 32 });
        
        const component = new SpriteComponent({ sprite: spriteName });
        expect(component.sprite).toBeDefined();
        expect(getTexture).toHaveBeenCalledWith(spriteName);
      });
    });

    it('should handle very long sprite names', () => {
      const longSpriteName = 'a'.repeat(1000);
      
      expect(() => new SpriteComponent({ sprite: longSpriteName })).not.toThrow();
      expect(getTexture).toHaveBeenCalledWith(longSpriteName);
    });
  });

  describe('Serialization Considerations', () => {
    it('should have serializable component type', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      expect(component.type).toBe(ComponentType.Sprite);
      expect(typeof component.type).toBe('string');
    });

    it('should handle component identification', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      const isSprite = component.type === ComponentType.Sprite;
      expect(isSprite).toBe(true);
    });

    // Note: Full serialization is complex due to Pixi.js objects
    // In practice, only the sprite name might be serialized
    it('should preserve sprite reference for ECS operations', () => {
      const component = new SpriteComponent({ sprite: 'test' });
      
      expect(component.sprite).toBeDefined();
      expect(component.sprite).not.toBeNull();
    });
  });
});

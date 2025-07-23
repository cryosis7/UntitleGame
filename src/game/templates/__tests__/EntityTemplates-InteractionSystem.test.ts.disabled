import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Key, Door, Chest } from '../EntityTemplates';
import { InteractionBehaviorType } from '../../components/individualComponents/InteractionBehaviorType';
import { createEntityFromTemplate } from '../../utils/EntityFactory';
import { hasComponent } from '../../components/ComponentOperations';
import { ComponentType } from '../../components/ComponentTypes';
import type { UsableItemComponentProps } from '../../components/individualComponents/UsableItemComponent';
import type { RequiresItemComponentProps } from '../../components/individualComponents/RequiresItemComponent';
import type { InteractionBehaviorComponentProps } from '../../components/individualComponents/InteractionBehaviorComponent';
import type { SpawnContentsComponentProps } from '../../components/individualComponents/SpawnContentsComponent';
import type { SpriteComponentProps } from '../../components/individualComponents/SpriteComponent';
import { setupPixiMocks } from '../../../__tests__/mocks/pixiMocks';

// Mock Pixi.js
vi.mock('pixi.js', async () => {
  const mocks = await import('../../../__tests__/mocks/pixiMocks');
  return {
    Application: mocks.Application,
    Container: mocks.Container,
    Sprite: mocks.Sprite,
    Graphics: mocks.Graphics,
    Ticker: mocks.Ticker,
    Spritesheet: mocks.Spritesheet,
    Texture: mocks.Texture,
    Assets: mocks.Assets,
  };
});

// Mock the getTexture function
vi.mock('../../utils/Atoms', () => ({
  getTexture: vi.fn(),
  getTileSizeAtom: { key: 'tileSize' },
}));

vi.mock('../../../App', () => ({
  store: {
    get: vi.fn(),
  },
}));

const { getTexture } = await import('../../utils/Atoms');
const { store } = await import('../../../App');

describe('EntityTemplates - Interaction System', () => {
  beforeEach(() => {
    setupPixiMocks();
    vi.clearAllMocks();

    // Mock getTexture to return a valid texture for any sprite name
    (getTexture as any).mockReturnValue({ width: 16, height: 16 });
    // Mock store.get for tile size
    (store.get as any).mockReturnValue(16);
  });
  describe('Key Template', () => {
    it('should create a pickable usable item with unlock capability', () => {
      const entity = createEntityFromTemplate(Key);

      // Should have required components
      expect(hasComponent(entity, ComponentType.Sprite)).toBe(true);
      expect(hasComponent(entity, ComponentType.Pickable)).toBe(true);
      expect(hasComponent(entity, ComponentType.UsableItem)).toBe(true);
    });

    it('should have correct usable item configuration', () => {
      // Template should have correct structure
      const usableItem = Key.components.usableItem as UsableItemComponentProps;
      expect(usableItem.capabilities).toEqual(['unlock']);
      expect(usableItem.isConsumable).toBe(true);
    });

    it('should have appropriate sprite', () => {
      const sprite = Key.components.sprite as SpriteComponentProps;
      expect(sprite.sprite).toBe('key_gold');
    });
  });

  describe('Door Template', () => {
    it('should create an entity requiring unlock capability with transform behavior', () => {
      const entity = createEntityFromTemplate(Door);

      // Should have required components
      expect(hasComponent(entity, ComponentType.Sprite)).toBe(true);
      expect(hasComponent(entity, ComponentType.RequiresItem)).toBe(true);
      expect(hasComponent(entity, ComponentType.InteractionBehavior)).toBe(
        true,
      );
    });

    it('should have correct requires item configuration', () => {
      const requiresItem = Door.components
        .requiresItem as RequiresItemComponentProps;
      expect(requiresItem.requiredCapabilities).toEqual(['unlock']);
      expect(requiresItem.isActive).toBe(true);
    });

    it('should have correct interaction behavior configuration', () => {
      const interactionBehavior = Door.components
        .interactionBehavior as InteractionBehaviorComponentProps;
      expect(interactionBehavior.behaviorType).toBe(
        InteractionBehaviorType.TRANSFORM,
      );
      expect(interactionBehavior.newSpriteId).toBe('dirt');
      expect(interactionBehavior.isRepeatable).toBe(false);
    });

    it('should have appropriate sprites for closed/open states', () => {
      const sprite = Door.components.sprite as SpriteComponentProps;
      const interactionBehavior = Door.components
        .interactionBehavior as InteractionBehaviorComponentProps;
      expect(sprite.sprite).toBe('boulder');
      expect(interactionBehavior.newSpriteId).toBe('dirt');
    });
  });

  describe('Chest Template', () => {
    it('should create an entity requiring unlock capability with spawn contents behavior', () => {
      const entity = createEntityFromTemplate(Chest);

      // Should have required components
      expect(hasComponent(entity, ComponentType.Sprite)).toBe(true);
      expect(hasComponent(entity, ComponentType.RequiresItem)).toBe(true);
      expect(hasComponent(entity, ComponentType.InteractionBehavior)).toBe(
        true,
      );
      expect(hasComponent(entity, ComponentType.SpawnContents)).toBe(true);
    });

    it('should have correct requires item configuration', () => {
      const requiresItem = Chest.components
        .requiresItem as RequiresItemComponentProps;
      expect(requiresItem.requiredCapabilities).toEqual(['unlock']);
      expect(requiresItem.isActive).toBe(true);
    });

    it('should have correct interaction behavior configuration', () => {
      const interactionBehavior = Chest.components
        .interactionBehavior as InteractionBehaviorComponentProps;
      expect(interactionBehavior.behaviorType).toBe(
        InteractionBehaviorType.SPAWN_CONTENTS,
      );
      expect(interactionBehavior.isRepeatable).toBe(false);
    });

    it('should have spawn contents with treasure items', () => {
      const spawnContents = Chest.components
        .spawnContents as SpawnContentsComponentProps;
      const contents = spawnContents.contents;
      expect(contents).toHaveLength(2);

      // Check first treasure item
      const firstItem = contents[0];
      const firstSprite = firstItem.components.sprite as SpriteComponentProps;
      expect(firstSprite.sprite).toBe('bottle_blue');
      expect(firstItem.components.pickable).toBeDefined();

      // Check second treasure item
      const secondItem = contents[1];
      const secondSprite = secondItem.components.sprite as SpriteComponentProps;
      expect(secondSprite.sprite).toBe('bottle_red');
      expect(secondItem.components.pickable).toBeDefined();
    });

    it('should have correct spawn offset', () => {
      const spawnContents = Chest.components
        .spawnContents as SpawnContentsComponentProps;
      expect(spawnContents.spawnOffset).toEqual({ x: 1, y: 0 });
    });

    it('should have appropriate sprite', () => {
      const sprite = Chest.components.sprite as SpriteComponentProps;
      expect(sprite.sprite).toBe('chest_closed');
    });
  });

  describe('Template Integration', () => {
    it('should create entities that demonstrate full interaction workflow', () => {
      const key = createEntityFromTemplate(Key);
      const door = createEntityFromTemplate(Door);
      const chest = createEntityFromTemplate(Chest);

      // All entities should be valid
      expect(key.id).toBeDefined();
      expect(door.id).toBeDefined();
      expect(chest.id).toBeDefined();

      // Key should be usable for both door and chest
      const keyUsable = Key.components.usableItem as UsableItemComponentProps;
      const doorRequires = Door.components
        .requiresItem as RequiresItemComponentProps;
      const chestRequires = Chest.components
        .requiresItem as RequiresItemComponentProps;

      expect(keyUsable.capabilities).toContain('unlock');
      expect(doorRequires.requiredCapabilities).toContain('unlock');
      expect(chestRequires.requiredCapabilities).toContain('unlock');
    });

    it('should support different interaction behaviors', () => {
      const doorBehavior = Door.components
        .interactionBehavior as InteractionBehaviorComponentProps;
      const chestBehavior = Chest.components
        .interactionBehavior as InteractionBehaviorComponentProps;

      // Door transforms when unlocked
      expect(doorBehavior.behaviorType).toBe(InteractionBehaviorType.TRANSFORM);

      // Chest spawns contents when unlocked
      expect(chestBehavior.behaviorType).toBe(
        InteractionBehaviorType.SPAWN_CONTENTS,
      );
    });

    it('should follow existing entity template patterns', () => {
      // All templates should have sprite components
      expect(Key.components.sprite).toBeDefined();
      expect(Door.components.sprite).toBeDefined();
      expect(Chest.components.sprite).toBeDefined();

      // Templates should be structured consistently
      expect(typeof Key.components).toBe('object');
      expect(typeof Door.components).toBe('object');
      expect(typeof Chest.components).toBe('object');
    });
  });
});

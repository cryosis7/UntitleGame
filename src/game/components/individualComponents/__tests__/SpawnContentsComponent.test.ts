import { SpawnContentsComponent } from '../SpawnContentsComponent';
import { ComponentType } from '../../ComponentTypes';
import type { EntityTemplate } from '../../../utils/EntityFactory';

describe('SpawnContentsComponent', () => {
  // Sample entity templates for testing
  const sampleItemTemplate: EntityTemplate = {
    components: {
      position: { x: 0, y: 0 },
      sprite: { sprite: 'gold_coin' },
      pickable: {},
    },
  };

  const sampleWeaponTemplate: EntityTemplate = {
    components: {
      position: { x: 0, y: 0 },
      sprite: { sprite: 'sword' },
      pickable: {},
      usableItem: { capabilities: ['attack'], isConsumable: false },
    },
  };

  const sampleKeyTemplate: EntityTemplate = {
    components: {
      sprite: { sprite: 'key_gold' },
      usableItem: { capabilities: ['unlock'], isConsumable: true },
    },
  };

  describe('Constructor', () => {
    it('should create component with required properties', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate],
      });

      expect(component.type).toBe(ComponentType.SpawnContents);
      expect(component.contents).toEqual([sampleItemTemplate]);
      expect(component.spawnOffset).toEqual({ x: 0, y: 0 });
    });

    it('should create component with all properties specified', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate, sampleWeaponTemplate],
        spawnOffset: { x: 1, y: -1 },
      });

      expect(component.type).toBe(ComponentType.SpawnContents);
      expect(component.contents).toHaveLength(2);
      expect(component.contents[0]).toEqual(sampleItemTemplate);
      expect(component.contents[1]).toEqual(sampleWeaponTemplate);
      expect(component.spawnOffset).toEqual({ x: 1, y: -1 });
    });

    it('should default spawnOffset to (0, 0) when not specified', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate],
      });

      expect(component.spawnOffset).toEqual({ x: 0, y: 0 });
    });

    it('should handle empty contents array', () => {
      const component = new SpawnContentsComponent({
        contents: [],
      });

      expect(component.contents).toEqual([]);
      expect(component.contents).toHaveLength(0);
    });
  });

  describe('Validation', () => {
    it('should require contents to be an array', () => {
      expect(() => {
        new SpawnContentsComponent({
          contents: null as any,
        });
      }).toThrow('SpawnContentsComponent: contents must be an array of EntityTemplate objects');

      expect(() => {
        new SpawnContentsComponent({
          contents: 'invalid' as any,
        });
      }).toThrow('SpawnContentsComponent: contents must be an array of EntityTemplate objects');

      expect(() => {
        new SpawnContentsComponent({
          contents: {} as any,
        });
      }).toThrow('SpawnContentsComponent: contents must be an array of EntityTemplate objects');
    });

    it('should validate entity template structure', () => {
      expect(() => {
        new SpawnContentsComponent({
          contents: [null as any],
        });
      }).toThrow('SpawnContentsComponent: contents[0] must be a valid EntityTemplate with components property');

      expect(() => {
        new SpawnContentsComponent({
          contents: ['invalid' as any],
        });
      }).toThrow('SpawnContentsComponent: contents[0] must be a valid EntityTemplate with components property');

      expect(() => {
        new SpawnContentsComponent({
          contents: [{ invalid: 'template' } as any],
        });
      }).toThrow('SpawnContentsComponent: contents[0] must be a valid EntityTemplate with components property');
    });

    it('should validate all templates in contents array', () => {
      expect(() => {
        new SpawnContentsComponent({
          contents: [sampleItemTemplate, null as any, sampleWeaponTemplate],
        });
      }).toThrow('SpawnContentsComponent: contents[1] must be a valid EntityTemplate with components property');
    });

    it('should allow valid entity templates', () => {
      expect(() => {
        new SpawnContentsComponent({
          contents: [sampleItemTemplate, sampleWeaponTemplate, sampleKeyTemplate],
        });
      }).not.toThrow();
    });
  });

  describe('Contents Management', () => {
    it('should support single entity template', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate],
      });

      expect(component.contents).toHaveLength(1);
      expect(component.contents[0]).toEqual(sampleItemTemplate);
    });

    it('should support multiple entity templates', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate, sampleWeaponTemplate, sampleKeyTemplate],
      });

      expect(component.contents).toHaveLength(3);
      expect(component.contents[0]).toEqual(sampleItemTemplate);
      expect(component.contents[1]).toEqual(sampleWeaponTemplate);
      expect(component.contents[2]).toEqual(sampleKeyTemplate);
    });

    it('should preserve template references without deep copying', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate],
      });

      expect(component.contents[0]).toBe(sampleItemTemplate);
    });
  });

  describe('Spawn Offset Handling', () => {
    it('should support positive spawn offsets', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate],
        spawnOffset: { x: 5, y: 3 },
      });

      expect(component.spawnOffset).toEqual({ x: 5, y: 3 });
    });

    it('should support negative spawn offsets', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate],
        spawnOffset: { x: -2, y: -4 },
      });

      expect(component.spawnOffset).toEqual({ x: -2, y: -4 });
    });

    it('should support zero spawn offsets', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate],
        spawnOffset: { x: 0, y: 0 },
      });

      expect(component.spawnOffset).toEqual({ x: 0, y: 0 });
    });

    it('should support fractional spawn offsets', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate],
        spawnOffset: { x: 0.5, y: -1.5 },
      });

      expect(component.spawnOffset).toEqual({ x: 0.5, y: -1.5 });
    });
  });

  describe('Component Type Integration', () => {
    it('should have correct ComponentType', () => {
      const component = new SpawnContentsComponent({
        contents: [sampleItemTemplate],
      });

      expect(component.type).toBe(ComponentType.SpawnContents);
      expect(component.type).toBe('spawnContents');
    });
  });

  describe('Game Logic Integration', () => {
    it('should support chest opening scenario', () => {
      const treasureContents = [
        sampleItemTemplate, // Gold coin
        sampleWeaponTemplate, // Weapon
        sampleKeyTemplate, // Key
      ];

      const chestContents = new SpawnContentsComponent({
        contents: treasureContents,
        spawnOffset: { x: 0, y: 1 }, // Spawn below chest
      });

      expect(chestContents.contents).toHaveLength(3);
      expect(chestContents.spawnOffset).toEqual({ x: 0, y: 1 });
    });

    it('should support container breaking scenario', () => {
      const containerContents = new SpawnContentsComponent({
        contents: [sampleItemTemplate], // Single item
        spawnOffset: { x: 0, y: 0 }, // Spawn at same location
      });

      expect(containerContents.contents).toHaveLength(1);
      expect(containerContents.spawnOffset).toEqual({ x: 0, y: 0 });
    });

    it('should support vending machine scenario', () => {
      const vendingMachineContents = new SpawnContentsComponent({
        contents: [
          {
            components: {
              sprite: { sprite: 'health_potion' },
              pickable: {},
              usableItem: { capabilities: ['heal'], isConsumable: true },
            },
          },
        ],
        spawnOffset: { x: 1, y: 0 }, // Spawn to the right
      });

      expect(vendingMachineContents.contents).toHaveLength(1);
      expect(vendingMachineContents.spawnOffset).toEqual({ x: 1, y: 0 });
    });

    it('should support loot drop scenario', () => {
      const lootDropContents = new SpawnContentsComponent({
        contents: [
          sampleItemTemplate,
          {
            components: {
              sprite: { sprite: 'gem_blue' },
              pickable: {},
            },
          },
          {
            components: {
              sprite: { sprite: 'potion_red' },
              pickable: {},
              usableItem: { capabilities: ['heal'], isConsumable: true },
            },
          },
        ],
        spawnOffset: { x: 0, y: 0 },
      });

      expect(lootDropContents.contents).toHaveLength(3);
      expect(lootDropContents.contents[0].components).toHaveProperty('sprite');
      expect(lootDropContents.contents[1].components).toHaveProperty('pickable');
      expect(lootDropContents.contents[2].components).toHaveProperty('usableItem');
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('should handle complex entity templates', () => {
      const complexTemplate: EntityTemplate = {
        components: {
          position: { x: 10, y: 20 },
          sprite: { sprite: 'complex_item' },
          pickable: {},
          usableItem: { capabilities: ['magic', 'unlock', 'heal'], isConsumable: false },
          requiresItem: { requiredCapabilities: ['access'], isActive: true },
        },
      };

      const component = new SpawnContentsComponent({
        contents: [complexTemplate],
        spawnOffset: { x: -5, y: 10 },
      });

      expect(component.contents[0]).toEqual(complexTemplate);
      expect(component.spawnOffset).toEqual({ x: -5, y: 10 });
    });

    it('should handle templates with minimal components', () => {
      const minimalTemplate: EntityTemplate = {
        components: {},
      };

      const component = new SpawnContentsComponent({
        contents: [minimalTemplate],
      });

      expect(component.contents[0]).toEqual(minimalTemplate);
    });

    it('should validate all array indices on error', () => {
      const validTemplate = sampleItemTemplate;
      const invalidTemplate = { badTemplate: true } as any;

      expect(() => {
        new SpawnContentsComponent({
          contents: [validTemplate, validTemplate, invalidTemplate, validTemplate],
        });
      }).toThrow('SpawnContentsComponent: contents[2] must be a valid EntityTemplate with components property');
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large contents arrays efficiently', () => {
      const largeContentsArray = Array(100).fill(sampleItemTemplate);

      const startTime = performance.now();
      const component = new SpawnContentsComponent({
        contents: largeContentsArray,
      });
      const endTime = performance.now();

      expect(component.contents).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should maintain reference integrity', () => {
      const template1 = sampleItemTemplate;
      const template2 = sampleWeaponTemplate;

      const component = new SpawnContentsComponent({
        contents: [template1, template2],
      });

      expect(component.contents[0]).toBe(template1);
      expect(component.contents[1]).toBe(template2);
    });
  });
});

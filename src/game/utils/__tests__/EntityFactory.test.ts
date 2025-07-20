import { describe, it, expect } from 'vitest';
import { 
  createEntityFromTemplate,
  createEntitiesFromTemplates,
  type EntityTemplate
} from '../EntityFactory';
import { ComponentType } from '../../components/ComponentTypes';

describe('EntityFactory', () => {
  describe('Function Exports', () => {
    it('should export createEntityFromTemplate function', () => {
      expect(createEntityFromTemplate).toBeDefined();
      expect(typeof createEntityFromTemplate).toBe('function');
    });

    it('should export createEntitiesFromTemplates function', () => {
      expect(createEntitiesFromTemplates).toBeDefined();
      expect(typeof createEntitiesFromTemplates).toBe('function');
    });
  });

  describe('createEntityFromTemplate', () => {
    it('should create entity with generated ID', () => {
      const template: EntityTemplate = {
        components: {}
      };

      const entity = createEntityFromTemplate(template);

      expect(entity).toHaveProperty('id');
      expect(typeof entity.id).toBe('string');
      expect(entity.id.length).toBeGreaterThan(0);
      expect(entity).toHaveProperty('components');
    });

    it('should create entity with position component', () => {
      const template: EntityTemplate = {
        components: {
          [ComponentType.Position]: { x: 10, y: 20 }
        }
      };

      const entity = createEntityFromTemplate(template);

      expect(entity.components.position).toBeDefined();
      expect(entity.components.position?.type).toBe(ComponentType.Position);
      // Type assertion for testing specific properties
      const posComponent = entity.components.position as any;
      expect(posComponent?.x).toBe(10);
      expect(posComponent?.y).toBe(20);
    });

    it('should create entity with player component', () => {
      const template: EntityTemplate = {
        components: {
          [ComponentType.Player]: {},
          [ComponentType.Position]: { x: 0, y: 0 }
        }
      };

      const entity = createEntityFromTemplate(template);

      expect(entity.components.player).toBeDefined();
      expect(entity.components.player?.type).toBe(ComponentType.Player);
      expect(entity.components.position).toBeDefined();
    });

    it('should handle empty template', () => {
      const template: EntityTemplate = {
        components: {}
      };

      const entity = createEntityFromTemplate(template);

      expect(typeof entity.id).toBe('string');
      expect(entity.components).toEqual({});
    });
  });

  describe('createEntitiesFromTemplates', () => {
    it('should handle empty templates', () => {
      const entities = createEntitiesFromTemplates();

      expect(entities).toHaveLength(0);
      expect(Array.isArray(entities)).toBe(true);
    });

    it('should create multiple entities from valid templates', () => {
      const template1: EntityTemplate = {
        components: {
          [ComponentType.Position]: { x: 1, y: 1 }
        }
      };
      
      const template2: EntityTemplate = {
        components: {
          [ComponentType.Player]: {}
        }
      };

      const entities = createEntitiesFromTemplates(template1, template2);

      expect(entities).toHaveLength(2);
      expect(entities[0].id).not.toBe(entities[1].id); // Different IDs
      expect(entities[0].components.position).toBeDefined();
      expect(entities[1].components.player).toBeDefined();
    });

    it('should maintain template independence', () => {
      const template1: EntityTemplate = {
        components: {
          [ComponentType.Position]: { x: 5, y: 5 }
        }
      };
      
      const template2: EntityTemplate = {
        components: {
          [ComponentType.Position]: { x: 10, y: 10 }
        }
      };

      const entities = createEntitiesFromTemplates(template1, template2);

      const pos1 = entities[0].components.position as any;
      const pos2 = entities[1].components.position as any;
      
      expect(pos1?.x).toBe(5);
      expect(pos2?.x).toBe(10);
      
      // Modifying one shouldn't affect the other
      pos1.x = 100;
      expect(pos2?.x).toBe(10);
    });
  });

  describe('EntityTemplate Interface', () => {
    it('should support component template structure', () => {
      const basicTemplate: EntityTemplate = {
        components: {
          [ComponentType.Position]: { x: 1, y: 1 },
          [ComponentType.Player]: {},
          [ComponentType.Movable]: {},
          [ComponentType.Velocity]: { x: 2, y: 3 },
          [ComponentType.Pickable]: {},
          [ComponentType.Walkable]: {},
          [ComponentType.RenderInSidebar]: {}
        }
      };

      expect(basicTemplate.components).toHaveProperty(ComponentType.Position);
      expect(basicTemplate.components).toHaveProperty(ComponentType.Player);
      expect(basicTemplate.components).toHaveProperty(ComponentType.Movable);
      expect(basicTemplate.components).toHaveProperty(ComponentType.Velocity);
      expect(basicTemplate.components).toHaveProperty(ComponentType.Pickable);
      expect(basicTemplate.components).toHaveProperty(ComponentType.Walkable);
      expect(basicTemplate.components).toHaveProperty(ComponentType.RenderInSidebar);
    });

    it('should support template validation', () => {
      // Templates should have a components property
      const validTemplate: EntityTemplate = {
        components: {}
      };
      
      expect(validTemplate).toHaveProperty('components');
      expect(typeof validTemplate.components).toBe('object');
    });
  });
});

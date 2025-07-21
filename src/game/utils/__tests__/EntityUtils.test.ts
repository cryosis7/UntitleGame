import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addEntity,
  addEntities,
  removeEntity,
  removeEntities,
  getEntitiesWithComponents,
  getEntity,
} from '../EntityUtils';
import type { Entity } from '../ecsUtils';
import { ComponentType } from '../../components/ComponentTypes';

// Mock store dependencies
vi.mock('../../../App', () => ({
  store: {
    set: vi.fn(),
    get: vi.fn(() => []), // Default empty entities array
  },
}));

vi.mock('../Atoms', () => ({
  entitiesAtom: 'entities-atom',
}));

vi.mock('../../components/ComponentOperations', () => ({
  hasComponent: vi.fn(),
  hasAllComponents: vi.fn(),
}));

describe('EntityUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Function Exports', () => {
    it('should export addEntity function', () => {
      expect(addEntity).toBeDefined();
      expect(typeof addEntity).toBe('function');
    });

    it('should export addEntities function', () => {
      expect(addEntities).toBeDefined();
      expect(typeof addEntities).toBe('function');
    });

    it('should export removeEntity function', () => {
      expect(removeEntity).toBeDefined();
      expect(typeof removeEntity).toBe('function');
    });

    it('should export removeEntities function', () => {
      expect(removeEntities).toBeDefined();
      expect(typeof removeEntities).toBe('function');
    });

    it('should export getEntitiesWithComponents function', () => {
      expect(getEntitiesWithComponents).toBeDefined();
      expect(typeof getEntitiesWithComponents).toBe('function');
    });

    it('should export getEntity function', () => {
      expect(getEntity).toBeDefined();
      expect(typeof getEntity).toBe('function');
    });
  });

  describe('getEntitiesWithComponents', () => {
    it('should filter entities by components', async () => {
      const { hasAllComponents } = await import(
        '../../components/ComponentOperations'
      );

      const entities: Entity[] = [
        { id: 'entity1', components: {} },
        { id: 'entity2', components: {} },
        { id: 'entity3', components: {} },
      ];

      // Mock hasAllComponents to return true for entity2 only
      vi.mocked(hasAllComponents).mockImplementation((entity) => {
        return entity.id === 'entity2';
      });

      const result = getEntitiesWithComponents(
        [ComponentType.Position],
        entities,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('entity2');
    });

    it('should handle multiple required components', async () => {
      const { hasAllComponents } = await import(
        '../../components/ComponentOperations'
      );

      const entities: Entity[] = [
        { id: 'partial', components: {} }, // Has Position only
        { id: 'complete', components: {} }, // Has both Position and Sprite
        { id: 'none', components: {} }, // Has neither
      ];

      vi.mocked(hasAllComponents).mockImplementation((entity) => {
        return entity.id === 'complete'; // Only complete entity has all required components
      });

      const result = getEntitiesWithComponents(
        [ComponentType.Position, ComponentType.Sprite],
        entities,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('complete');
    });

    it('should return empty array when no entities match', async () => {
      const { hasAllComponents } = await import(
        '../../components/ComponentOperations'
      );

      const entities: Entity[] = [{ id: 'entity1', components: {} }];

      vi.mocked(hasAllComponents).mockReturnValue(false);

      const result = getEntitiesWithComponents(
        [ComponentType.Position],
        entities,
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('getEntity', () => {
    it('should find entity by ID from store', async () => {
      const { store } = await import('../../../App');

      const entities: Entity[] = [
        { id: 'first', components: {} },
        { id: 'target', components: {} },
        { id: 'last', components: {} },
      ];

      vi.mocked(store.get).mockReturnValue(entities);

      const result = getEntity('target');

      expect(result).toBeDefined();
      expect(result?.id).toBe('target');
    });

    it('should return undefined for non-existent ID', async () => {
      const { store } = await import('../../../App');

      const entities: Entity[] = [{ id: 'existing', components: {} }];

      vi.mocked(store.get).mockReturnValue(entities);

      const result = getEntity('non-existent');

      expect(result).toBeUndefined();
    });

    it('should handle empty entities array', async () => {
      const { store } = await import('../../../App');

      vi.mocked(store.get).mockReturnValue([]);

      const result = getEntity('any-id');

      expect(result).toBeUndefined();
    });
  });

  describe('Entity Store Integration', () => {
    it('should interact with store for entity operations', async () => {
      const { store } = await import('../../../App');

      const mockEntity: Entity = {
        id: 'test-entity',
        components: {},
      };

      // Test that functions call store methods
      addEntity(mockEntity);
      expect(store.set).toHaveBeenCalled();

      removeEntity('test-id');
      expect(store.set).toHaveBeenCalled();

      // Functions should be callable without throwing
      expect(() => addEntities([mockEntity])).not.toThrow();
      expect(() => removeEntities(['test-id'])).not.toThrow();
    });
  });
});

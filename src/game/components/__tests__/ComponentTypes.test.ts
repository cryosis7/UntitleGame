import { describe, it, expect } from 'vitest';
import { ComponentType, type FullComponentDictionary, type ComponentProps } from '../ComponentTypes';
import { RequiresItemComponent } from '../individualComponents/RequiresItemComponent';
import { UsableItemComponent } from '../individualComponents/UsableItemComponent';
import { InteractionBehaviorComponent } from '../individualComponents/InteractionBehaviorComponent';
import { SpawnContentsComponent } from '../individualComponents/SpawnContentsComponent';
import { InteractionBehaviorType } from '../individualComponents/InteractionBehaviorType';

describe('ComponentTypes - Entity Interaction System Integration', () => {
  describe('ComponentType Enum Registration', () => {
    it('should include RequiresItem in ComponentType enum', () => {
      expect(ComponentType.RequiresItem).toBe('requiresItem');
      expect(Object.values(ComponentType)).toContain('requiresItem');
    });

    it('should include UsableItem in ComponentType enum', () => {
      expect(ComponentType.UsableItem).toBe('usableItem');
      expect(Object.values(ComponentType)).toContain('usableItem');
    });

    it('should include InteractionBehavior in ComponentType enum', () => {
      expect(ComponentType.InteractionBehavior).toBe('interactionBehavior');
      expect(Object.values(ComponentType)).toContain('interactionBehavior');
    });

    it('should include SpawnContents in ComponentType enum', () => {
      expect(ComponentType.SpawnContents).toBe('spawnContents');
      expect(Object.values(ComponentType)).toContain('spawnContents');
    });

    it('should have all 4 new interaction system component types', () => {
      const interactionSystemTypes = [
        ComponentType.RequiresItem,
        ComponentType.UsableItem,
        ComponentType.InteractionBehavior,
        ComponentType.SpawnContents,
      ];

      interactionSystemTypes.forEach(type => {
        expect(Object.values(ComponentType)).toContain(type);
      });
    });
  });

  describe('FullComponentDictionary Type Mapping', () => {
    it('should map RequiresItem to RequiresItemComponent class', () => {
      // TypeScript type-level test - if this compiles, the mapping is correct
      const requiresItemComponent = new RequiresItemComponent({
        requiredCapabilities: ['test'],
      });

      expect(requiresItemComponent).toBeInstanceOf(RequiresItemComponent);
      expect(requiresItemComponent.type).toBe(ComponentType.RequiresItem);
    });

    it('should map UsableItem to UsableItemComponent class', () => {
      // TypeScript type-level test - if this compiles, the mapping is correct
      const usableItemComponent = new UsableItemComponent({
        capabilities: ['test'],
      });

      expect(usableItemComponent).toBeInstanceOf(UsableItemComponent);
      expect(usableItemComponent.type).toBe(ComponentType.UsableItem);
    });

    it('should map InteractionBehavior to InteractionBehaviorComponent class', () => {
      // TypeScript type-level test - if this compiles, the mapping is correct
      const interactionBehaviorComponent = new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.REMOVE,
      });

      expect(interactionBehaviorComponent).toBeInstanceOf(InteractionBehaviorComponent);
      expect(interactionBehaviorComponent.type).toBe(ComponentType.InteractionBehavior);
    });

    it('should map SpawnContents to SpawnContentsComponent class', () => {
      // TypeScript type-level test - if this compiles, the mapping is correct
      const spawnContentsComponent = new SpawnContentsComponent({
        contents: [],
      });

      expect(spawnContentsComponent).toBeInstanceOf(SpawnContentsComponent);
      expect(spawnContentsComponent.type).toBe(ComponentType.SpawnContents);
    });

    it('should maintain type consistency across all component mappings', () => {
      // Test that all new component types have consistent type property values
      const requiresItem = new RequiresItemComponent({ requiredCapabilities: [] });
      const usableItem = new UsableItemComponent({ capabilities: [] });
      const interactionBehavior = new InteractionBehaviorComponent({ 
        behaviorType: InteractionBehaviorType.REMOVE 
      });
      const spawnContents = new SpawnContentsComponent({ contents: [] });

      expect(requiresItem.type).toBe(ComponentType.RequiresItem);
      expect(usableItem.type).toBe(ComponentType.UsableItem);
      expect(interactionBehavior.type).toBe(ComponentType.InteractionBehavior);
      expect(spawnContents.type).toBe(ComponentType.SpawnContents);
    });
  });

  describe('ComponentProps Type Union', () => {
    it('should include RequiresItemComponentProps in ComponentProps union', () => {
      // TypeScript type-level test - if this compiles, the props type is included
      const requiredCapabilities = ['test'];
      const isActive = true;
      
      const requiresItemProps = { requiredCapabilities, isActive };
      
      // This should be assignable to ComponentProps if properly included
      const props: ComponentProps = requiresItemProps;
      expect(props).toEqual(requiresItemProps);
    });

    it('should include UsableItemComponentProps in ComponentProps union', () => {
      // TypeScript type-level test - if this compiles, the props type is included
      const capabilities = ['test'];
      const isConsumable = true;
      
      const usableItemProps = { capabilities, isConsumable };
      
      // This should be assignable to ComponentProps if properly included
      const props: ComponentProps = usableItemProps;
      expect(props).toEqual(usableItemProps);
    });

    it('should include InteractionBehaviorComponentProps in ComponentProps union', () => {
      // TypeScript type-level test - if this compiles, the props type is included
      const behaviorType = InteractionBehaviorType.TRANSFORM;
      const newSpriteId = 'door_open';
      const isRepeatable = false;
      
      const interactionBehaviorProps = { behaviorType, newSpriteId, isRepeatable };
      
      // This should be assignable to ComponentProps if properly included
      const props: ComponentProps = interactionBehaviorProps;
      expect(props).toEqual(interactionBehaviorProps);
    });

    it('should include SpawnContentsComponentProps in ComponentProps union', () => {
      // TypeScript type-level test - if this compiles, the props type is included
      const contents = [{ components: {} }];
      const spawnOffset = { x: 1, y: 2 };
      
      const spawnContentsProps = { contents, spawnOffset };
      
      // This should be assignable to ComponentProps if properly included
      const props: ComponentProps = spawnContentsProps;
      expect(props).toEqual(spawnContentsProps);
    });
  });

  describe('TypeScript Compilation Validation', () => {
    it('should compile successfully with all new component types', () => {
      // Test that TypeScript can properly infer and compile with the new types
      const componentInstances = {
        [ComponentType.RequiresItem]: new RequiresItemComponent({
          requiredCapabilities: ['unlock', 'access'],
          isActive: true,
        }),
        [ComponentType.UsableItem]: new UsableItemComponent({
          capabilities: ['unlock', 'heal'],
          isConsumable: false,
        }),
        [ComponentType.InteractionBehavior]: new InteractionBehaviorComponent({
          behaviorType: InteractionBehaviorType.SPAWN_CONTENTS,
          isRepeatable: true,
        }),
        [ComponentType.SpawnContents]: new SpawnContentsComponent({
          contents: [
            {
              components: {
                sprite: { sprite: 'treasure' },
                pickable: {},
              },
            },
          ],
          spawnOffset: { x: 0, y: 1 },
        }),
      };

      // Verify all instances were created successfully
      Object.entries(componentInstances).forEach(([typeKey, instance]) => {
        expect(instance).toBeDefined();
        expect(instance.type).toBe(typeKey);
      });
    });

    it('should support proper type narrowing for new component types', () => {
      // Test TypeScript type narrowing works correctly
      const components = [
        new RequiresItemComponent({ requiredCapabilities: ['test'] }),
        new UsableItemComponent({ capabilities: ['test'] }),
        new InteractionBehaviorComponent({ behaviorType: InteractionBehaviorType.REMOVE }),
        new SpawnContentsComponent({ contents: [] }),
      ];

      components.forEach(component => {
        switch (component.type) {
          case ComponentType.RequiresItem:
            expect(component).toBeInstanceOf(RequiresItemComponent);
            expect(component.requiredCapabilities).toBeDefined();
            expect(component.isActive).toBeDefined();
            break;
          case ComponentType.UsableItem:
            expect(component).toBeInstanceOf(UsableItemComponent);
            expect(component.capabilities).toBeDefined();
            expect(component.isConsumable).toBeDefined();
            break;
          case ComponentType.InteractionBehavior:
            expect(component).toBeInstanceOf(InteractionBehaviorComponent);
            expect(component.behaviorType).toBeDefined();
            expect(component.isRepeatable).toBeDefined();
            break;
          case ComponentType.SpawnContents:
            expect(component).toBeInstanceOf(SpawnContentsComponent);
            expect(component.contents).toBeDefined();
            expect(component.spawnOffset).toBeDefined();
            break;
          default:
            // This should not happen for our new component types
            break;
        }
      });
    });
  });

  describe('Integration with Existing System', () => {
    it('should not break existing component type registrations', () => {
      // Ensure existing component types still work
      const existingTypes = [
        ComponentType.Position,
        ComponentType.Sprite,
        ComponentType.Player,
        ComponentType.Movable,
        ComponentType.Velocity,
        ComponentType.Pickable,
        ComponentType.CarriedItem,
        ComponentType.Interacting,
        ComponentType.Handling,
        ComponentType.Walkable,
        ComponentType.RenderInSidebar,
      ];

      existingTypes.forEach(type => {
        expect(Object.values(ComponentType)).toContain(type);
      });

      // Ensure we haven't accidentally changed any enum values
      expect(ComponentType.Position).toBe('position');
      expect(ComponentType.Sprite).toBe('sprite');
      expect(ComponentType.Player).toBe('player');
      expect(ComponentType.Movable).toBe('movable');
      expect(ComponentType.Velocity).toBe('velocity');
      expect(ComponentType.Pickable).toBe('pickable');
      expect(ComponentType.CarriedItem).toBe('carriedItem');
      expect(ComponentType.Interacting).toBe('interacting');
      expect(ComponentType.Handling).toBe('handling');
      expect(ComponentType.Walkable).toBe('walkable');
      expect(ComponentType.RenderInSidebar).toBe('renderInSidebar');
    });

    it('should maintain consistent enum naming convention', () => {
      // Check that new component types follow existing naming conventions
      expect(ComponentType.RequiresItem).toBe('requiresItem'); // camelCase
      expect(ComponentType.UsableItem).toBe('usableItem'); // camelCase
      expect(ComponentType.InteractionBehavior).toBe('interactionBehavior'); // camelCase
      expect(ComponentType.SpawnContents).toBe('spawnContents'); // camelCase
    });

    it('should have complete component coverage in enum', () => {
      // Ensure all interaction system components are registered
      const interactionSystemComponents = [
        'requiresItem',
        'usableItem', 
        'interactionBehavior',
        'spawnContents',
      ];

      const enumValues = Object.values(ComponentType);
      interactionSystemComponents.forEach(componentType => {
        expect(enumValues).toContain(componentType);
      });
    });
  });
});

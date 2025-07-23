import type { Position } from '../../src/game/map/GameMap';
import type { GameMap } from '../../src/game/map/GameMap';
import type { Component } from '../../src/game/components/ComponentTypes';
import { PlayerComponent } from '../../src/game/components/individualComponents/PlayerComponent';
import { PositionComponent } from '../../src/game/components/individualComponents/PositionComponent';
import { VelocityComponent } from '../../src/game/components/individualComponents/VelocityComponent';
import { SpriteComponent } from '../../src/game/components/individualComponents/SpriteComponent';
import { PickableComponent } from '../../src/game/components/individualComponents/PickableComponent';
import { InteractionBehaviorComponent } from '../../src/game/components/individualComponents/InteractionBehaviorComponent';
import { InteractionBehaviorType } from '../../src/game/components/individualComponents/InteractionBehaviorType';
import { RequiresItemComponent } from '../../src/game/components/individualComponents/RequiresItemComponent';
import { UsableItemComponent } from '../../src/game/components/individualComponents/UsableItemComponent';
import type { Entity } from '../../src/game/utils/ecsUtils';
import type { UpdateArgs } from '../../src/game/systems/Systems';
import { store } from '../../src/App';
import { entitiesAtom } from '../../src/game/utils/Atoms';

export function createStandardUpdateArgs(entities: Entity[] = []): UpdateArgs {
  // Create a mock GameMap that allows movement in a 20x20 area
  const mockGameMap = {
    isValidPosition: ({ x, y }: Position) =>
      x >= 0 && y >= 0 && x < 20 && y < 20,
    isPositionInMap: ({ x, y }: Position) =>
      x >= 0 && y >= 0 && x < 20 && y < 20,
    isTileWalkable: ({ x, y }: Position) => true, // All tiles are walkable in tests
    getTile: ({ x, y }: Position) => null,
  } as GameMap;

  return {
    entities,
    map: mockGameMap,
    time: undefined,
  };
}

/**
 * Sets up the global store with test entities for systems that depend on the global state.
 * IMPORTANT: This must be called in tests that interact with systems that use EntityUtils functions,
 * as those functions depend on the global entitiesAtom store.
 *
 * @param entities The entities to set in the global store
 * @returns A cleanup function that restores the original store state
 */
export function setupGlobalStoreForTesting(entities: Entity[]): () => void {
  const originalEntities = store.get(entitiesAtom);
  store.set(entitiesAtom, entities);

  return () => {
    store.set(entitiesAtom, originalEntities);
  };
}

export const ConvenienceComponentSets = {
  player: (position: Position = { x: 0, y: 0 }): Component[] => [
    new PlayerComponent(),
    new PositionComponent(position),
    new VelocityComponent({ vx: 0, vy: 0 }),
  ],

  playerWithSprite: (position: Position = { x: 0, y: 0 }): Component[] => [
    new PlayerComponent(),
    new PositionComponent(position),
    new VelocityComponent({ vx: 0, vy: 0 }),
    new SpriteComponent({ sprite: 'player' }),
  ],

  item: (position: Position): Component[] => [
    new PositionComponent(position),
    new PickableComponent(),
  ],

  chest: (position: Position, requiredItem?: string): Component[] => {
    const components: Component[] = [
      new PositionComponent(position),
      new InteractionBehaviorComponent({
        behaviorType: InteractionBehaviorType.TRANSFORM,
        isRepeatable: false,
      }),
    ];

    if (requiredItem) {
      components.push(
        new RequiresItemComponent({
          requiredCapabilities: [requiredItem],
          isActive: true,
        }),
      );
    }

    return components;
  },

  key: (position: Position, keyType: string = 'basic_key'): Component[] => [
    new PositionComponent(position),
    new PickableComponent(),
    new UsableItemComponent({
      capabilities: [keyType],
      isConsumable: true,
    }),
  ],
};

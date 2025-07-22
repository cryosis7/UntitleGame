import type { Position } from '../../src/game/map/GameMap';
import { GameMap } from '../../src/game/map/GameMap';
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

export function createStandardUpdateArgs(entities: Entity[] = []): UpdateArgs {
  const mockGameMap = new GameMap();

  return {
    entities,
    map: mockGameMap,
    time: undefined,
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

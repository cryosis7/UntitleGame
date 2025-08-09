import { ComponentType } from '../ComponentTypes';
import type { EntityTemplate } from '../../utils/EntityFactory';
import type { Position } from '../../map/GameMap';

export type SpawnContentsComponentProps = {
  contents: EntityTemplate[];
  spawnOffset?: Position;
};

/**
 * Component that defines what entities should be spawned when a SPAWN_CONTENTS interaction behavior is triggered.
 * Used in conjunction with InteractionBehaviorComponent to create new entities at the interaction location.
 * The original target entity is typically removed when contents are spawned.
 */
export class SpawnContentsComponent {
  type = ComponentType.SpawnContents;
  contents: EntityTemplate[];
  spawnOffset: Position;

  constructor({
    contents,
    spawnOffset = { x: 0, y: 0 },
  }: SpawnContentsComponentProps) {
    this.contents = contents;
    this.spawnOffset = spawnOffset;

    // Validate that contents array is not empty when using SPAWN_CONTENTS behavior
    if (!Array.isArray(contents)) {
      throw new Error(
        'SpawnContentsComponent: contents must be an array of EntityTemplate objects',
      );
    }

    // Validate each entity template has the expected structure
    contents.forEach((template, index) => {
      if (!template || typeof template !== 'object' || !template.components) {
        throw new Error(
          `SpawnContentsComponent: contents[${index}] must be a valid EntityTemplate with components property`,
        );
      }
    });
  }
}

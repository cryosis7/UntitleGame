import type { ThingModel } from './ThingModel';
import { BaseThing } from './BaseThing';

export interface GroundModel extends BaseThing {
  contents: ThingModel | null;
}

export const groundModelCreator = (
  config: GroundModel = {
    contents: null,
    walkable: true,
  },
): GroundModel => {
  return {
    contents: config.contents,
    walkable: config.walkable,
  };
};

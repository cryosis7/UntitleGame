import type { BaseModel, BaseModelProperty } from './BaseModel';
import type { Position } from '../utils/mapUtils';

type PlayerModelMandatoryProperties = {
  position: Position;
};

type PlayerModelProperties = PlayerModelMandatoryProperties & BaseModelProperty;

export interface PlayerModel extends BaseModel {
  id: string;
  properties: PlayerModelProperties;
}

export const createPlayerObject = (
  properties?: Partial<PlayerModelProperties>,
): PlayerModel => {
  return {
    id: crypto.randomUUID(),
    properties: {
      position: { x: 0, y: 0 },
      ...properties,
    },
  };
};

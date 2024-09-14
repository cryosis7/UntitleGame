import type { BaseModel, BaseModelProperty } from './BaseModel';

type TileModelMandatoryProperties = {
  color: string,
  walkable: boolean,
};

type TileModelProperties = TileModelMandatoryProperties & BaseModelProperty;

export interface TileModel extends BaseModel {
  id: string;
  properties: TileModelProperties;
}

export const createTileModel = (properties?: Partial<TileModelProperties>): TileModel => {
  return {
    id: crypto.randomUUID(),
    properties: {
      color: 'black',
      walkable: false,
      ...properties
    }
  };
};
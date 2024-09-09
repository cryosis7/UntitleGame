type BaseModelPropertyTypes = string | number | boolean;
export type BaseModelProperty = { [key:string]: BaseModelPropertyTypes | BaseModelProperty };

export interface BaseModel {
  id: string;
  properties: BaseModelProperty;
}

// Deprecated
export const createBaseModel = (properties: BaseModelProperty = {}): BaseModel => {
  return {
    id: crypto.randomUUID(),
    properties,
  };
};
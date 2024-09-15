type BaseModelPropertyTypes = string | number | boolean;
export type BaseModelProperty = { [key:string]: BaseModelPropertyTypes | BaseModelProperty };

export interface BaseModel {
  id: string;
  properties: BaseModelProperty;
}
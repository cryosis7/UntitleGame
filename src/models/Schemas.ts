export type SupportedValueTypes = 'string' | 'number' | 'boolean';

export interface ValueSchema {
  type: SupportedValueTypes;
  required?: boolean;
  description?: string;
  // dependantProperty?: string // This would only enable this property if the dependant property is enabled.
}

export interface PropertySection {
  [key: string]: ValueSchema
}

export interface PropertiesSchema {
  [key: string]: ValueSchema | PropertySection;
}

export interface BaseObjectSchema {
  properties: PropertiesSchema,
}

export interface GameObjectSchema extends BaseObjectSchema {}
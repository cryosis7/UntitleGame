export type SupportedValueTypes = 'string' | 'number' | 'boolean';

export interface ValueSchema {
  type: SupportedValueTypes;
  description?: string;
  required?: boolean;
  defaultValue?: SupportedValueTypes
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
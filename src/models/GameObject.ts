import type { SupportedValueTypes } from './schemas/coreSchemas';

export type MandatoryProperties = {
  name: string,
};

type CustomProperties = {
  [key: string]: SupportedValueTypes;
};

export interface GameObject {
  id: string;
  properties: MandatoryProperties & CustomProperties
}
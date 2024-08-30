import type { SupportedValueTypes } from './Schemas';

export type MandatoryProperties = {
  name: string,
  isCollidable: boolean,
  isInteractable: boolean,
};

type CustomProperties = {
  [key: string]: SupportedValueTypes;
};

export interface GameObject {
  id: string;
  properties: MandatoryProperties & CustomProperties
}
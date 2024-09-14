import type { SupportedValueTypes } from './Schemas';

export type GameObjectMandatoryProperties = {
  name: string,
  isCollidable: boolean,
  isInteractable: boolean,
};

export type CustomProperties = {
  [key: string]: SupportedValueTypes;
};

export interface GameObject {
  id: string;
  properties: GameObjectMandatoryProperties & CustomProperties
}
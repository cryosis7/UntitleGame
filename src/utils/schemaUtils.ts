import { GameObjectSchema, PropertiesSchema, PropertySection, ValueSchema } from '../models/Schemas';

export const isValueSchema = (property: any): property is ValueSchema => {
  return (
    typeof property === 'object' &&
    property !== null &&
    'type' in property &&
    ['string', 'number', 'boolean'].includes(property.type)
  );
};

export const isPropertySection = (property: any): property is PropertySection => {
  return (
    typeof property === 'object' &&
    property !== null &&
    !isValueSchema(property)
  );
};

export const createGameObjectSchema = (properties?: PropertiesSchema): GameObjectSchema => {
  return {
    properties: {
      name: {
        type: 'string',
        required: true,
      },
      colour: { type: 'string' },
      isCollidable: {
        type: 'boolean',
        required: true,
      },
      isInteractable: {
        type: 'boolean',
        required: true
      },
      ...properties
    }
  };
};
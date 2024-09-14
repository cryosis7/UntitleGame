export type SupportedValueTypes = 'string' | 'number' | 'boolean';

export interface ValueSchema {
  type: SupportedValueTypes;
  required?: boolean;
  description?: string;
}

export interface PropertiesSchema {
  [key: string]: ValueSchema | PropertiesSchema;
}

export interface BaseObjectSchema {
  properties: PropertiesSchema,
}
// Example:
// {
//   properties: {
//     name: {
//       type: 'string',
//       required: true,
//     },
//     physical: {
//       location: {
//         x: { type: 'number' },
//         y: { type: 'number' },
//       },
//       size: {
//         width: { type: 'number' },
//         height: { type: 'number' },
//       },
//     },
//     colour: { type: 'string' },
//     isCollidable: {
//       type: 'boolean',
//       required: true,
//     },
//     isInteractable: {
//       type: 'boolean',
//       required: true
//     },
//   }
// }
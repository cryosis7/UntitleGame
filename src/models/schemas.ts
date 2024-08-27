interface PropertySchema {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
  description?: string;
}

interface ObjectSchema {
  type: string; // The type of the object (e.g., "ground", "gameObject")
  properties: PropertySchema[]; // Array of properties for this object type
}

const groundSchema: ObjectSchema = {
  type: "ground",
  properties: [
    { name: "id", type: "string", required: true },
    { name: "type", type: "string", required: true }, // e.g., "grass", "water", "dirt"
    { name: "texture", type: "string", required: true }, // Path or reference to the tile's texture
    { name: "walkable", type: "boolean", required: true }, // Indicates if the tile is walkable
    { name: "collision", type: "boolean", required: true }, // Indicates if the tile has collision properties
    { name: "environmentalEffects", type: "string", required: false }, // Optional effects (e.g., "slow", "damage")
  ],
};

// Define schemas for each object type
export const objectSchemas: ObjectSchema[] = [
  groundSchema,
  {
    type: 'interactable',
    properties: [
      { name: 'id', type: 'string', required: true },
      { name: 'position.x', type: 'number', required: true },
      { name: 'position.y', type: 'number', required: true },
      { name: 'interactable', type: 'boolean', required: true },
      { name: 'texture', type: 'string' },
      { name: 'description', type: 'string' },
    ],
  },
  {
    type: 'destructible',
    properties: [
      { name: 'id', type: 'string', required: true },
      { name: 'position.x', type: 'number', required: true },
      { name: 'position.y', type: 'number', required: true },
      { name: 'texture', type: 'string', required: true },
      { name: 'health', type: 'number', required: true },
    ],
  },
  {
    type: 'collectible',
    properties: [
      { name: 'id', type: 'string', required: true },
      { name: 'position.x', type: 'number', required: true },
      { name: 'position.y', type: 'number', required: true },
      { name: 'texture', type: 'string', required: true },
      { name: 'collectible', type: 'boolean', required: true },
      { name: 'resourceType', type: 'string', required: true },
      { name: 'resourceAmount', type: 'number', required: true },
    ],
  },
];

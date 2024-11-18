type StringProperty = {
  type: 'string';
  default: string;
};
type NumberProperty = {
  type: 'number';
  default: number;
};

export type PropertyValueSchema = StringProperty | NumberProperty;

type ComponentPropertySchema = {
  [propertyName: string]: PropertyValueSchema;
};

export type EntitiesComponentsSchema = {
  [key: string]: ComponentPropertySchema;
};

export const DefaultComponentSchemas: EntitiesComponentsSchema = {
  position: {
    x: { type: 'number', default: 0 },
    y: { type: 'number', default: 0 },
  },
  velocity: {
    vx: { type: 'number', default: 0 },
    vy: { type: 'number', default: 0 },
  },
  player: {},
  movable: {},
  sprite: {
    sprite: { type: 'string', default: '' },
  },
};

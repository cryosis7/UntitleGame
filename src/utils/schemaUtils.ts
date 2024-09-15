import type { PropertiesSchema, ValueSchema } from '../models/Schemas';

export function isValueSchema(
  schema: ValueSchema | PropertiesSchema,
): schema is ValueSchema {
  return (schema as ValueSchema)?.type !== undefined ?? false;
}
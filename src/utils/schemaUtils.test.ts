import { isValueSchema } from '../utils/schemaUtils';
import type { ValueSchema, PropertiesSchema } from '../models/Schemas';

describe('isValueSchema', () => {
    it('should return true for a ValueSchema', () => {
        const schema: ValueSchema = {
            type: 'string',
        };
        expect(isValueSchema(schema)).toBe(true);
    });

    it('should return false for a PropertiesSchema', () => {
        const schema: PropertiesSchema = {
            properties: {
                name: { type: 'string' },
                age: { type: 'number' },
            },
        };
        expect(isValueSchema(schema)).toBe(false);
    });

    it('should return false for an empty object', () => {
        const schema = {};
        expect(isValueSchema(schema)).toBe(false);
    });

    it('should return false for null', () => {
        const schema = null;
        expect(isValueSchema(schema as unknown as ValueSchema)).toBe(false);
    });

    it('should return false for undefined', () => {
        const schema = undefined;
        expect(isValueSchema(schema as unknown as ValueSchema)).toBe(false);
    });
});

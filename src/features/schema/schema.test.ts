import { describe, expect, it } from 'vitest';
import { schemaToJsonSchema, validateSchemaDefinition } from './schema';
import type { SchemaDefinition } from './types';

const baseSchema: SchemaDefinition = {
  id: 'schema-1',
  name: 'Invoice',
  updatedAt: '2026-09-18T00:00:00.000Z',
  fields: [
    {
      id: 'field-1',
      name: 'Amount',
      key: 'amount',
      type: 'number',
      required: true,
      description: 'Total invoice amount',
      rules: { min: 0 },
    },
  ],
};

describe('validateSchemaDefinition', () => {
  it('rejects duplicate field keys', () => {
    const schema: SchemaDefinition = {
      ...baseSchema,
      fields: [baseSchema.fields[0], { ...baseSchema.fields[0], id: 'field-2' }],
    };
    const result = validateSchemaDefinition(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('Duplicate');
  });

  it('rejects invalid regular expressions', () => {
    const schema: SchemaDefinition = {
      ...baseSchema,
      fields: [{ ...baseSchema.fields[0], type: 'string', rules: { pattern: '[' } }],
    };
    expect(validateSchemaDefinition(schema).valid).toBe(false);
  });
});

describe('schemaToJsonSchema', () => {
  it('converts fields and required keys to JSON Schema', () => {
    const jsonSchema = schemaToJsonSchema(baseSchema);
    expect(jsonSchema.type).toBe('object');
    expect(jsonSchema.required).toEqual(['amount']);
    expect(jsonSchema.properties.amount).toMatchObject({
      type: ['number', 'null'],
      description: 'Total invoice amount',
      minimum: 0,
    });
    expect(jsonSchema.additionalProperties).toBe(false);
  });

  it('requires optional business fields in provider schema while allowing null', () => {
    const schema: SchemaDefinition = {
      ...baseSchema,
      fields: [
        baseSchema.fields[0],
        { id: 'field-2', name: 'Memo', key: 'memo', type: 'string', required: false, description: '', rules: {} },
      ],
    };
    const jsonSchema = schemaToJsonSchema(schema);
    expect(jsonSchema.required).toEqual(['amount', 'memo']);
    expect(jsonSchema.properties.memo.type).toEqual(['string', 'null']);
  });
});

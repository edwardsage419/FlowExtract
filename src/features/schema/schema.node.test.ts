import assert from 'node:assert/strict';
import test from 'node:test';
import { schemaToJsonSchema, validateSchemaDefinition } from './schema.ts';
import type { SchemaDefinition } from './types.ts';

const baseSchema: SchemaDefinition = {
  id: 'schema-1',
  name: 'Invoice',
  updatedAt: '2026-09-18T00:00:00.000Z',
  fields: [{
    id: 'field-1', name: 'Amount', key: 'amount', type: 'number', required: true,
    description: 'Total invoice amount', rules: { min: 0 },
  }],
};

test('schema validation rejects duplicate field keys', () => {
  const schema = { ...baseSchema, fields: [baseSchema.fields[0], { ...baseSchema.fields[0], id: 'field-2' }] };
  const result = validateSchemaDefinition(schema);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /Duplicate/);
});

test('schema validation rejects invalid regex', () => {
  const schema = { ...baseSchema, fields: [{ ...baseSchema.fields[0], type: 'string' as const, rules: { pattern: '[' } }] };
  assert.equal(validateSchemaDefinition(schema).valid, false);
});

test('schema converts to JSON Schema', () => {
  const jsonSchema = schemaToJsonSchema(baseSchema);
  assert.deepEqual(jsonSchema.required, ['amount']);
  assert.deepEqual(jsonSchema.properties.amount.type, ['number', 'null']);
  assert.equal(jsonSchema.properties.amount.minimum, 0);
  assert.equal(jsonSchema.additionalProperties, false);
});

test('provider JSON Schema requires every property and represents optional business fields with null', () => {
  const schema: SchemaDefinition = {
    ...baseSchema,
    fields: [
      baseSchema.fields[0],
      { id: 'field-2', name: 'Memo', key: 'memo', type: 'string', required: false, description: '', rules: {} },
    ],
  };
  const jsonSchema = schemaToJsonSchema(schema);
  assert.deepEqual(jsonSchema.required, ['amount', 'memo']);
  assert.deepEqual(jsonSchema.properties.memo.type, ['string', 'null']);
});

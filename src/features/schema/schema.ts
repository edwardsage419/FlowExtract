import type {
  ExtractionJsonSchema,
  FieldDefinition,
  SchemaDefinition,
  SchemaValidationResult,
} from './types.ts';

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function validateSchemaDefinition(schema: SchemaDefinition): SchemaValidationResult {
  const errors: string[] = [];

  if (!schema.name.trim()) errors.push('Schema name is required.');
  if (schema.fields.length === 0) errors.push('At least one field is required.');

  const keys = new Set<string>();
  for (const field of schema.fields) {
    if (!field.name.trim()) errors.push(`Field ${field.id} requires a name.`);
    if (!field.key.trim()) errors.push(`Field ${field.id} requires a key.`);
    if (field.key && !KEY_PATTERN.test(field.key)) {
      errors.push(`Field key "${field.key}" must use letters, numbers, and underscores and cannot start with a number.`);
    }
    if (keys.has(field.key)) errors.push(`Duplicate field key: ${field.key}.`);
    keys.add(field.key);

    if (field.rules.pattern) {
      try {
        new RegExp(field.rules.pattern);
      } catch {
        errors.push(`Invalid regular expression for ${field.key || field.name}.`);
      }
    }
    if (field.rules.min !== undefined && field.rules.max !== undefined && field.rules.min > field.rules.max) {
      errors.push(`Minimum cannot exceed maximum for ${field.key || field.name}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function propertyFor(field: FieldDefinition): Record<string, unknown> {
  const type = field.type === 'date' ? 'string' : field.type;
  const property: Record<string, unknown> = {
    type: [type, 'null'],
  };

  if (field.description.trim()) property.description = field.description.trim();
  if (field.type === 'date') property.format = 'date';
  if (field.type === 'string' && field.rules.pattern) property.pattern = field.rules.pattern;
  if (field.type === 'number' && field.rules.min !== undefined) property.minimum = field.rules.min;
  if (field.type === 'number' && field.rules.max !== undefined) property.maximum = field.rules.max;
  return property;
}

export function schemaToJsonSchema(schema: SchemaDefinition): ExtractionJsonSchema {
  const validation = validateSchemaDefinition(schema);
  if (!validation.valid) {
    throw new Error(`Invalid schema: ${validation.errors.join(' ')}`);
  }

  return {
    type: 'object',
    properties: Object.fromEntries(schema.fields.map((field) => [field.key, propertyFor(field)])),
    required: schema.fields.map((field) => field.key),
    additionalProperties: false,
  };
}

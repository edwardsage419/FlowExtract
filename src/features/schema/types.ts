export type FieldType = 'string' | 'number' | 'date' | 'boolean';

export interface FieldRules {
  pattern?: string;
  min?: number;
  max?: number;
}

export interface FieldDefinition {
  id: string;
  name: string;
  key: string;
  type: FieldType;
  required: boolean;
  description: string;
  rules: FieldRules;
}

export interface SchemaDefinition {
  id: string;
  name: string;
  updatedAt: string;
  fields: FieldDefinition[];
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
}

export interface JsonSchemaProperty {
  type: string[];
  description?: string;
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
}

export interface ExtractionJsonSchema {
  [key: string]: unknown;
  type: 'object';
  properties: Record<string, Record<string, unknown>>;
  required: string[];
  additionalProperties: false;
}

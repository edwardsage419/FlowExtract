import type { DocumentRecord } from '../documents/types.ts';
import type { ExtractionRecord } from '../project/types.ts';
import type { AIProvider } from '../providers/types.ts';
import { schemaToJsonSchema, validateSchemaDefinition } from '../schema/schema.ts';
import type { SchemaDefinition } from '../schema/types.ts';
import { validateExtraction } from '../validation/validate.ts';

export interface RunExtractionInput {
  document: DocumentRecord;
  schema: SchemaDefinition;
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export async function runExtraction(input: RunExtractionInput): Promise<ExtractionRecord> {
  const schemaValidation = validateSchemaDefinition(input.schema);
  if (!schemaValidation.valid) {
    throw new Error(`Schema is invalid: ${schemaValidation.errors.join(' ')}`);
  }
  if (!input.apiKey.trim()) throw new Error('API key is required for extraction.');
  if (!input.model.trim()) throw new Error('Model name is required for extraction.');
  if (!input.document.text.trim()) throw new Error('Document contains no extractable text.');

  const result = await input.provider.extract({
    apiKey: input.apiKey,
    model: input.model,
    documentText: input.document.text,
    jsonSchema: schemaToJsonSchema(input.schema),
  });
  const validation = validateExtraction(input.schema, result.data);

  return {
    id: crypto.randomUUID(),
    documentId: input.document.id,
    schemaId: input.schema.id,
    provider: input.provider.id,
    model: input.model,
    processedAt: new Date().toISOString(),
    rawResponse: result.rawText,
    fields: validation.fields,
    globalIssues: validation.globalIssues,
  };
}

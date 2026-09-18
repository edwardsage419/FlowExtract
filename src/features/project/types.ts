import type { DocumentRecord } from '../documents/types';
import type { ProviderId } from '../providers/types';
import type { SchemaDefinition } from '../schema/types';
import type { ReviewedField, ValidationIssue } from '../validation/types';

export interface ExtractionRecord {
  id: string;
  documentId: string;
  schemaId: string;
  provider: ProviderId;
  model: string;
  processedAt: string;
  rawResponse?: string;
  fields: Record<string, ReviewedField>;
  globalIssues: ValidationIssue[];
}

export interface ProjectRecord {
  id: string;
  name: string;
  updatedAt: string;
  document?: DocumentRecord;
  schema: SchemaDefinition;
  extraction?: ExtractionRecord;
}

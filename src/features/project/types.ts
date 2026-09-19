import type { DocumentRecord } from '../documents/types';
import type { ExtractionMode, ManualAIService } from '../extraction/types';
import type { ProviderId, QwenRegion } from '../providers/types';
import type { SchemaDefinition } from '../schema/types';
import type { ReviewedField, ValidationIssue } from '../validation/types';

export interface ExtractionRecord {
  id: string;
  documentId: string;
  schemaId: string;
  extractionMode?: ExtractionMode;
  provider?: ProviderId;
  model?: string;
  manualService?: ManualAIService;
  providerRegion?: QwenRegion;
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

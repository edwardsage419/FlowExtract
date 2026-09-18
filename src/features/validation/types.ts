export type ValidationSeverity = 'warning' | 'error';
export type FieldStatus = 'valid' | 'warning' | 'error' | 'corrected';

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
}

export interface ReviewedField {
  key: string;
  prediction: unknown;
  finalValue: unknown;
  status: FieldStatus;
  validationIssues: ValidationIssue[];
  correctedByHuman: boolean;
  sourceText?: string;
  sourcePage?: number;
  confidence?: number;
}

export interface ExtractionValidationResult {
  valid: boolean;
  fields: Record<string, ReviewedField>;
  globalIssues: ValidationIssue[];
}

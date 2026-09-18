import type { ReviewedField } from '../validation/types.ts';

export interface EvalMetrics {
  fieldCount: number;
  validFieldCount: number;
  validationFailureCount: number;
  humanCorrectionCount: number;
  fieldAccuracyProxy: number | null;
}

export function computeMetrics(fields: Record<string, ReviewedField>): EvalMetrics {
  const values = Object.values(fields);
  const fieldCount = values.length;
  const humanCorrectionCount = values.filter((field) => field.correctedByHuman).length;
  return {
    fieldCount,
    validFieldCount: values.filter((field) => field.status !== 'error').length,
    validationFailureCount: values.filter((field) => field.status === 'error').length,
    humanCorrectionCount,
    fieldAccuracyProxy: fieldCount === 0 ? null : (fieldCount - humanCorrectionCount) / fieldCount,
  };
}

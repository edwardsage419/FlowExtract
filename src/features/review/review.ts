import type { SchemaDefinition } from '../schema/types.ts';
import { validateExtraction } from '../validation/validate.ts';
import type { ReviewedField } from '../validation/types.ts';

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function applyCorrection(
  schema: SchemaDefinition,
  currentFields: Record<string, ReviewedField>,
  key: string,
  value: unknown,
): Record<string, ReviewedField> {
  const raw = Object.fromEntries(Object.entries(currentFields).map(([fieldKey, field]) => [fieldKey, field.finalValue]));
  raw[key] = value;
  const validated = validateExtraction(schema, raw).fields;

  return Object.fromEntries(Object.entries(validated).map(([fieldKey, field]) => {
    const previous = currentFields[fieldKey];
    const prediction = previous?.prediction;
    const correctedByHuman = previous?.correctedByHuman || (fieldKey === key && !sameValue(prediction, field.finalValue));
    return [fieldKey, {
      ...field,
      prediction,
      correctedByHuman,
      status: field.status === 'error' ? 'error' : correctedByHuman ? 'corrected' : 'valid',
    } satisfies ReviewedField];
  }));
}

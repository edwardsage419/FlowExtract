import type { FieldDefinition, SchemaDefinition } from '../schema/types.ts';
import type { ExtractionValidationResult, ReviewedField, ValidationIssue } from './types.ts';

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

function issue(code: string, message: string): ValidationIssue {
  return { code, severity: 'error', message };
}

function isIsoCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function normalize(field: FieldDefinition, value: unknown): { value: unknown; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (isMissing(value)) {
    if (field.required) issues.push(issue('required', `${field.name} is required.`));
    return { value: value ?? null, issues };
  }

  if (field.type === 'string') {
    if (typeof value !== 'string') {
      issues.push(issue('type_string', `${field.name} must be a string.`));
      return { value, issues };
    }
    if (field.rules.pattern) {
      const re = new RegExp(field.rules.pattern);
      if (!re.test(value)) issues.push(issue('pattern', `${field.name} does not match the required format.`));
    }
    return { value, issues };
  }

  if (field.type === 'number') {
    const normalized = typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value.replace(/,/g, ''))
        : Number.NaN;
    if (!Number.isFinite(normalized)) {
      issues.push(issue('type_number', `${field.name} must be a number.`));
      return { value, issues };
    }
    if (field.rules.min !== undefined && normalized < field.rules.min) {
      issues.push(issue('minimum', `${field.name} must be at least ${field.rules.min}.`));
    }
    if (field.rules.max !== undefined && normalized > field.rules.max) {
      issues.push(issue('maximum', `${field.name} exceeds maximum ${field.rules.max}.`));
    }
    return { value: normalized, issues };
  }

  if (field.type === 'date') {
    if (typeof value !== 'string' || !isIsoCalendarDate(value)) {
      issues.push(issue('type_date', `${field.name} must be a valid YYYY-MM-DD date.`));
    }
    return { value, issues };
  }

  if (field.type === 'boolean') {
    if (typeof value === 'boolean') return { value, issues };
    if (typeof value === 'string') {
      const lowered = value.trim().toLowerCase();
      if (lowered === 'true') return { value: true, issues };
      if (lowered === 'false') return { value: false, issues };
    }
    issues.push(issue('type_boolean', `${field.name} must be true or false.`));
    return { value, issues };
  }

  return { value, issues };
}

export function validateExtraction(schema: SchemaDefinition, raw: unknown): ExtractionValidationResult {
  const globalIssues: ValidationIssue[] = [];
  const source = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? raw as Record<string, unknown>
    : {};

  if (source !== raw) {
    globalIssues.push(issue('output_shape', 'AI output must be a JSON object.'));
  } else {
    const expectedKeys = new Set(schema.fields.map((field) => field.key));
    for (const key of Object.keys(source)) {
      if (!expectedKeys.has(key)) {
        globalIssues.push(issue('unexpected_field', `AI output contains unexpected field: ${key}.`));
      }
    }
  }

  const fields: Record<string, ReviewedField> = {};
  for (const field of schema.fields) {
    const prediction = source[field.key];
    const normalized = normalize(field, prediction);
    fields[field.key] = {
      key: field.key,
      prediction,
      finalValue: normalized.value,
      status: normalized.issues.some((item) => item.severity === 'error') ? 'error' : 'valid',
      validationIssues: normalized.issues,
      correctedByHuman: false,
    };
  }

  return {
    valid: globalIssues.length === 0 && Object.values(fields).every((field) => field.status !== 'error'),
    fields,
    globalIssues,
  };
}

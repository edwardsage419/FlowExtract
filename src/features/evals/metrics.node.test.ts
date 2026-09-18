import assert from 'node:assert/strict';
import test from 'node:test';
import { computeMetrics } from './metrics.ts';
import type { ReviewedField } from '../validation/types.ts';

const fields: Record<string, ReviewedField> = {
  a: { key: 'a', prediction: 'x', finalValue: 'x', status: 'valid', validationIssues: [], correctedByHuman: false },
  b: { key: 'b', prediction: 1, finalValue: 2, status: 'corrected', validationIssues: [], correctedByHuman: true },
  c: { key: 'c', prediction: null, finalValue: null, status: 'error', validationIssues: [{ code: 'required', severity: 'error', message: 'required' }], correctedByHuman: false },
};

test('computes local review metrics', () => {
  assert.deepEqual(computeMetrics(fields), {
    fieldCount: 3,
    validFieldCount: 2,
    validationFailureCount: 1,
    humanCorrectionCount: 1,
    fieldAccuracyProxy: 2 / 3,
  });
});

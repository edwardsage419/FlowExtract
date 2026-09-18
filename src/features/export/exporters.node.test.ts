import assert from 'node:assert/strict';
import test from 'node:test';
import { finalValues, toCsv, toJson } from './exporters.ts';
import type { ReviewedField } from '../validation/types.ts';

const fields: Record<string, ReviewedField> = {
  customer: { key: 'customer', prediction: 'ACME, Inc.', finalValue: 'ACME, Inc.', status: 'valid', validationIssues: [], correctedByHuman: false },
  note: { key: 'note', prediction: 'Line 1\nLine 2', finalValue: 'Line 1\nLine 2', status: 'valid', validationIssues: [], correctedByHuman: false },
  amount: { key: 'amount', prediction: '12.5', finalValue: 12.5, status: 'valid', validationIssues: [], correctedByHuman: false },
};

test('finalValues uses reviewed final values', () => {
  assert.deepEqual(finalValues(fields), { customer: 'ACME, Inc.', note: 'Line 1\nLine 2', amount: 12.5 });
});

test('JSON export is parseable and preserves values', () => {
  assert.deepEqual(JSON.parse(toJson(fields)), finalValues(fields));
});

test('CSV export escapes commas and newlines', () => {
  const csv = toCsv(fields);
  assert.match(csv, /^customer,note,amount\r?\n/);
  assert.match(csv, /"ACME, Inc\."/);
  assert.match(csv, /"Line 1\nLine 2"/);
});

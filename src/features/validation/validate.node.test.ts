import assert from 'node:assert/strict';
import test from 'node:test';
import { validateExtraction } from './validate.ts';
import type { SchemaDefinition } from '../schema/types.ts';

const schema: SchemaDefinition = {
  id: 's', name: 'Invoice', updatedAt: '2026-09-18T00:00:00.000Z',
  fields: [
    { id: 'a', name: 'Invoice', key: 'invoice_number', type: 'string', required: true, description: '', rules: { pattern: '^INV-' } },
    { id: 'b', name: 'Amount', key: 'amount', type: 'number', required: true, description: '', rules: { min: 0, max: 1000 } },
    { id: 'c', name: 'Date', key: 'date', type: 'date', required: false, description: '', rules: {} },
    { id: 'd', name: 'Paid', key: 'paid', type: 'boolean', required: false, description: '', rules: {} },
  ],
};

test('flags missing required fields', () => {
  const result = validateExtraction(schema, { invoice_number: null, amount: '' });
  assert.equal(result.valid, false);
  assert.equal(result.fields.invoice_number.status, 'error');
  assert.match(result.fields.invoice_number.validationIssues[0].message, /required/i);
});

test('normalizes numeric and boolean strings and applies numeric ranges', () => {
  const good = validateExtraction(schema, { invoice_number: 'INV-1', amount: '12.50', paid: 'true' });
  assert.equal(good.fields.amount.finalValue, 12.5);
  assert.equal(good.fields.paid.finalValue, true);
  assert.equal(good.fields.amount.status, 'valid');

  const bad = validateExtraction(schema, { invoice_number: 'INV-1', amount: 1200 });
  assert.equal(bad.fields.amount.status, 'error');
  assert.match(bad.fields.amount.validationIssues[0].message, /maximum/i);
});

test('checks date and string pattern', () => {
  const result = validateExtraction(schema, { invoice_number: '42', amount: 10, date: 'not-a-date' });
  assert.equal(result.fields.invoice_number.status, 'error');
  assert.equal(result.fields.date.status, 'error');
});

test('rejects non object AI output without throwing', () => {
  const result = validateExtraction(schema, ['wrong']);
  assert.equal(result.valid, false);
  assert.equal(result.globalIssues.length, 1);
  assert.equal(Object.keys(result.fields).length, 4);
});

test('flags unexpected fields in AI output', () => {
  const result = validateExtraction(schema, { invoice_number: 'INV-1', amount: 10, unexpected: 'value' });
  assert.equal(result.valid, false);
  assert.ok(result.globalIssues.some((item) => item.code === 'unexpected_field'));
});

test('date validation requires a real ISO calendar date', () => {
  const wrongShape = validateExtraction(schema, { invoice_number: 'INV-1', amount: 10, date: '09/18/2026' });
  const impossible = validateExtraction(schema, { invoice_number: 'INV-1', amount: 10, date: '2026-02-30' });
  const valid = validateExtraction(schema, { invoice_number: 'INV-1', amount: 10, date: '2026-09-18' });
  assert.equal(wrongShape.fields.date.status, 'error');
  assert.equal(impossible.fields.date.status, 'error');
  assert.equal(valid.fields.date.status, 'valid');
});

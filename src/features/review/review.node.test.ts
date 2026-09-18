import assert from 'node:assert/strict';
import test from 'node:test';
import { applyCorrection } from './review.ts';
import { validateExtraction } from '../validation/validate.ts';
import type { SchemaDefinition } from '../schema/types.ts';

const schema: SchemaDefinition = {
  id: 's', name: 'Invoice', updatedAt: 'x',
  fields: [{ id: 'f', name: 'Amount', key: 'amount', type: 'number', required: true, description: '', rules: { min: 0 } }],
};

test('human correction preserves prediction and marks corrected value', () => {
  const initial = validateExtraction(schema, { amount: -4 }).fields;
  const corrected = applyCorrection(schema, initial, 'amount', '12.5');
  assert.equal(corrected.amount.prediction, -4);
  assert.equal(corrected.amount.finalValue, 12.5);
  assert.equal(corrected.amount.correctedByHuman, true);
  assert.equal(corrected.amount.status, 'corrected');
});

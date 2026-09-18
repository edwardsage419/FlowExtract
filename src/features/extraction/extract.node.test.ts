import assert from 'node:assert/strict';
import test from 'node:test';
import { runExtraction } from './extract.ts';
import type { AIProvider } from '../providers/types.ts';
import type { DocumentRecord } from '../documents/types.ts';
import type { SchemaDefinition } from '../schema/types.ts';

const document: DocumentRecord = {
  id: 'd1', name: 'invoice.pdf', mimeType: 'application/pdf', size: 10,
  createdAt: '2026-09-18T00:00:00.000Z', text: 'Total 12.5', pages: ['Total 12.5'], sourceKind: 'pdf', ocrUsed: false,
};
const schema: SchemaDefinition = {
  id: 's1', name: 'Invoice', updatedAt: '2026-09-18T00:00:00.000Z',
  fields: [{ id: 'f1', name: 'Amount', key: 'amount', type: 'number', required: true, description: '', rules: { min: 0 } }],
};

test('runExtraction returns validated provenance without retaining API key', async () => {
  const provider: AIProvider = {
    id: 'openai',
    async extract(input) {
      assert.equal(input.apiKey, 'secret');
      return { data: { amount: '12.5' }, rawText: '{"amount":"12.5"}' };
    },
  };
  const result = await runExtraction({ document, schema, provider, apiKey: 'secret', model: 'gpt-test' });
  assert.equal(result.fields.amount.finalValue, 12.5);
  assert.equal(result.provider, 'openai');
  assert.equal(result.model, 'gpt-test');
  assert.ok(!JSON.stringify(result).includes('secret'));
});

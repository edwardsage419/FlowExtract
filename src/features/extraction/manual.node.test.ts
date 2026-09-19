import assert from 'node:assert/strict';
import test from 'node:test';
import { buildManualExtractionPrompt, importManualExtraction, parseManualAiResponse } from './manual.ts';
import type { DocumentRecord } from '../documents/types.ts';
import type { SchemaDefinition } from '../schema/types.ts';

const document: DocumentRecord = {
  id: 'doc-1',
  name: 'invoice.pdf',
  mimeType: 'application/pdf',
  size: 100,
  createdAt: '2026-09-19T00:00:00.000Z',
  text: 'Invoice INV-42 dated 2026-09-19 total 1333.80',
  pages: ['Invoice INV-42 dated 2026-09-19 total 1333.80'],
  sourceKind: 'pdf',
  ocrUsed: false,
};

const schema: SchemaDefinition = {
  id: 'schema-1',
  name: 'Invoice',
  updatedAt: '2026-09-19T00:00:00.000Z',
  fields: [
    { id: 'invoice', name: 'Invoice Number', key: 'invoice_number', type: 'string', required: true, description: 'Invoice identifier', rules: { pattern: '^INV-' } },
    { id: 'date', name: 'Date', key: 'date', type: 'date', required: false, description: '', rules: {} },
    { id: 'amount', name: 'Amount', key: 'amount', type: 'number', required: true, description: '', rules: { min: 0 } },
  ],
};

test('manual prompt includes document content, field semantics and validation rules', () => {
  const prompt = buildManualExtractionPrompt(document, schema);
  assert.match(prompt, /invoice_number/);
  assert.match(prompt, /business_required=yes/);
  assert.match(prompt, /regex \^INV-/);
  assert.match(prompt, /minimum 0/);
  assert.match(prompt, /2026-09-19 total 1333\.80/);
  assert.match(prompt, /Do not guess/);
});

test('manual response parser accepts plain JSON, fenced JSON and surrounding prose', () => {
  const fence = String.fromCharCode(96).repeat(3);
  assert.deepEqual(parseManualAiResponse('{"amount":1333.8}'), { amount: 1333.8 });
  assert.deepEqual(parseManualAiResponse(fence + 'json\n{"amount":1333.8}\n' + fence), { amount: 1333.8 });
  assert.deepEqual(parseManualAiResponse('Here is the result:\n' + fence + 'json\n{"amount":1333.8}\n' + fence + '\nDone.'), { amount: 1333.8 });
});

test('manual import uses existing validation and records manual provenance', () => {
  const extraction = importManualExtraction({
    document,
    schema,
    service: 'chatgpt',
    rawResponse: '{"invoice_number":"INV-42","date":"2026-09-19","amount":1333.8}',
  });

  assert.equal(extraction.extractionMode, 'manual');
  assert.equal(extraction.manualService, 'chatgpt');
  assert.equal(extraction.provider, undefined);
  assert.equal(extraction.model, undefined);
  assert.equal(extraction.rawResponse, undefined);
  assert.equal(extraction.fields.amount.finalValue, 1333.8);
  assert.equal(extraction.fields.amount.status, 'valid');
  assert.equal(extraction.globalIssues.length, 0);
});

test('manual import surfaces malformed output without persisting the raw chat response', () => {
  const extraction = importManualExtraction({
    document,
    schema,
    service: 'claude',
    rawResponse: 'I could not produce JSON.',
  });

  assert.equal(extraction.globalIssues[0]?.code, 'malformed_ai_output');
  assert.equal(extraction.rawResponse, undefined);
  assert.equal(extraction.fields.invoice_number.status, 'error');
});

test('manual import keeps unknown-field validation', () => {
  const extraction = importManualExtraction({
    document,
    schema,
    service: 'gemini',
    rawResponse: '{"invoice_number":"INV-42","date":"2026-09-19","amount":1333.8,"extra":"unexpected"}',
  });
  assert.ok(extraction.globalIssues.some((item) => item.code === 'unexpected_field'));
});

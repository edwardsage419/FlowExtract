import assert from 'node:assert/strict';
import test from 'node:test';
import { createProvider, parseProviderJson } from './providers.ts';

const jsonSchema = { type: 'object', properties: { amount: { type: ['number', 'null'] } }, required: ['amount'], additionalProperties: false };

test('parseProviderJson accepts raw JSON and fenced JSON', () => {
  assert.deepEqual(parseProviderJson('{"amount":12}'), { amount: 12 });
  assert.deepEqual(parseProviderJson('```json\n{"amount":12}\n```'), { amount: 12 });
});

test('parseProviderJson rejects malformed AI output', () => {
  assert.throws(() => parseProviderJson('{"amount":'), /JSON|Unexpected|position|end/i);
});

test('OpenAI adapter normalizes Responses API output', async () => {
  let request: RequestInit | undefined;
  const fetcher = async (_url: string, init?: RequestInit) => {
    request = init;
    return new Response(JSON.stringify({ output: [{ type: 'message', content: [{ type: 'output_text', text: '{"amount":10}' }] }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const provider = createProvider('openai', fetcher);
  const result = await provider.extract({ apiKey: 'secret-key', model: 'gpt-test', documentText: 'Total 10', jsonSchema });
  assert.deepEqual(result.data, { amount: 10 });
  const body = JSON.parse(String(request?.body));
  assert.equal(body.model, 'gpt-test');
  assert.equal(body.store, false);
  assert.equal(body.text.format.type, 'json_schema');
  assert.ok(!String(request?.body).includes('secret-key'));
});

test('Anthropic adapter sends browser access header and parses text block', async () => {
  let headers: HeadersInit | undefined;
  const fetcher = async (_url: string, init?: RequestInit) => {
    headers = init?.headers;
    return new Response(JSON.stringify({ content: [{ type: 'text', text: '{"amount":11}' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const result = await createProvider('anthropic', fetcher).extract({ apiKey: 'k', model: 'claude-test', documentText: 'Total 11', jsonSchema });
  assert.deepEqual(result.data, { amount: 11 });
  const normalized = new Headers(headers);
  assert.equal(normalized.get('anthropic-dangerous-direct-browser-access'), 'true');
});

test('Gemini adapter sends JSON Schema and parses candidate text', async () => {
  let request: RequestInit | undefined;
  const fetcher = async (_url: string, init?: RequestInit) => {
    request = init;
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"amount":12}' }] } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const result = await createProvider('gemini', fetcher).extract({ apiKey: 'k', model: 'gemini-test', documentText: 'Total 12', jsonSchema });
  assert.deepEqual(result.data, { amount: 12 });
  const body = JSON.parse(String(request?.body));
  assert.equal(body.generationConfig.responseMimeType, 'application/json');
  assert.deepEqual(body.generationConfig.responseJsonSchema, jsonSchema);
});

test('provider errors do not expose API keys', async () => {
  const fetcher = async () => new Response(JSON.stringify({ error: { message: 'bad request' } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  await assert.rejects(
    () => createProvider('openai', fetcher).extract({ apiKey: 'super-secret', model: 'gpt-test', documentText: 'x', jsonSchema }),
    (error: Error) => !error.message.includes('super-secret') && /401/.test(error.message),
  );
});


test('default provider fetch keeps the browser fetch receiver valid', async () => {
  const originalFetch = globalThis.fetch;
  const expectedReceiver = globalThis;
  globalThis.fetch = (async function (this: typeof globalThis, _input: string | URL | Request, _init?: RequestInit) {
    assert.equal(this, expectedReceiver);
    return new Response(JSON.stringify({ output: [{ content: [{ type: 'output_text', text: '{"amount":13}' }] }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    const result = await createProvider('openai').extract({
      apiKey: 'test-key',
      model: 'gpt-test',
      documentText: 'Total 13',
      jsonSchema,
    });
    assert.deepEqual(result.data, { amount: 13 });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

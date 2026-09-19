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

test('Qwen adapter sends strict JSON Schema and parses OpenAI-compatible output', async () => {
  let url = '';
  let request: RequestInit | undefined;
  const fetcher = async (nextUrl: string, init?: RequestInit) => {
    url = nextUrl;
    request = init;
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"amount":14}' } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const result = await createProvider('qwen', fetcher).extract({ apiKey: 'qwen-key', model: 'qwen-test', documentText: 'Total 14', jsonSchema, region: 'cn-beijing' });
  assert.deepEqual(result.data, { amount: 14 });
  assert.match(url, /dashscope\.aliyuncs\.com\/compatible-mode\/v1\/chat\/completions$/);
  const headers = new Headers(request?.headers);
  assert.equal(headers.get('authorization'), 'Bearer qwen-key');
  const body = JSON.parse(String(request?.body));
  assert.equal(body.model, 'qwen-test');
  assert.equal(body.response_format.type, 'json_schema');
  assert.equal(body.response_format.json_schema.strict, true);
  assert.deepEqual(body.response_format.json_schema.schema, jsonSchema);
  assert.ok(!String(request?.body).includes('qwen-key'));
});

test('Qwen region selection changes only the endpoint and never auto-falls back', async () => {
  const urls: string[] = [];
  const fetcher = async (url: string) => {
    urls.push(url);
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"amount":15}' } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  await createProvider('qwen', fetcher).extract({ apiKey: 'k', model: 'qwen-test', documentText: 'Total 15', jsonSchema, region: 'ap-southeast-1' });
  assert.deepEqual(urls, ['https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions']);
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

test('Qwen live verification is scoped to Beijing', () => {
  assert.equal(getProviderVerification('qwen', 'cn-beijing'), 'verified');
  assert.equal(getProviderVerification('qwen', 'ap-southeast-1'), 'experimental');
  assert.equal(getProviderVerification('qwen', 'cn-hongkong'), 'experimental');
  assert.equal(getProviderVerification('openai'), 'experimental');
});

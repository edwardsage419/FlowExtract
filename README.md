# FlowExtract

Local first AI assisted document extraction, validation and human review.

[简体中文](README.zh-CN.md)

## Try FlowExtract and send feedback

Live app: https://flowextract.edwardxie421.workers.dev

Testing FlowExtract with a real document? Please report bugs and real-world test feedback through [GitHub Issues](https://github.com/edwardsage419/FlowExtract/issues/new/choose).

Do not include API keys, credentials, full provider responses, or sensitive document content in public issues. If a reproduction file is useful, use a public, synthetic, or sanitized example.

FlowExtract is an open source browser application for turning PDFs and document images into structured, reviewable data. The current V0.1.x scope stays deliberately small: upload a document, define a schema, extract through an AI chat or your own AI provider key, validate results locally, correct questionable fields, and export JSON, CSV, or XLSX.

## V0.1 workflow

`Document -> Extract -> Validate -> Review -> Export`

### Extraction modes

FlowExtract supports two extraction paths that converge on the same Validation, Review, Final Value, Export, and local eval flow:

* **AI Chat**: generate a document-specific prompt locally, copy it into ChatGPT, Claude, Gemini, Qwen, or another AI chat, then paste the JSON response back into FlowExtract. No API key is required. FlowExtract does not automate or read the user's AI chat session.
* **API**: keep the existing automated BYOK flow using OpenAI, Anthropic, Gemini, or Qwen. Provider usage may consume API quota or incur provider charges.

Manual AI Chat imports preserve the AI prediction and record the selected chat service as provenance. The raw pasted chat response remains page-local while editing and is not added to the project record.

The review step is the product focus. AI makes the first prediction. Deterministic rules identify missing, malformed, or out of range values. The user sees the source alongside the predicted and final values and corrects only what needs attention.

## V0.1 scope

Supported input targets:

* Digital PDF with browser side text extraction using PDF.js
* Scanned PDF with local OCR fallback on low text pages
* PNG
* JPG and JPEG

Schema fields support `string`, `number`, `date`, and `boolean`, plus required fields, regex patterns, and numeric minimum and maximum rules.

BYOK provider adapters are included for OpenAI, Anthropic, Gemini, and Qwen (Alibaba Cloud Model Studio). Model names are editable because provider model lifecycles change independently from FlowExtract. Qwen is live-verified for V0.1 against Alibaba Cloud Model Studio in China (Beijing). OpenAI, Anthropic, and Gemini remain Experimental: their adapters and contract tests are included, but a real API smoke test has not been completed for this release.

Exports include JSON, CSV, and XLSX. Project state is stored in IndexedDB. Portable JSON backup and restore are included.

## Privacy model

FlowExtract has no application backend in V0.1.

Documents are parsed in the browser. OCR runs locally with Tesseract.js. In AI Chat mode, FlowExtract generates the prompt locally and the user decides when and where to paste it. In API mode, parsed document text is sent directly from the browser to the provider selected by the user. FlowExtract does not proxy either path through a FlowExtract server.

API keys are held only in React memory for the current page session. They are not written to IndexedDB, project backups, source code, or logs. Reloading the page clears the key.

A project backup contains parsed document text, schema, extraction results, validation state, and human corrections. It does not contain the original binary document or API keys.

Important: direct browser BYOK means the browser communicates with third party AI APIs. Users should review the chosen provider's privacy, retention, billing, and API key policies before sending sensitive content.

## Architecture

The application is a static React and TypeScript SPA built with Vite.

```text
src/features/
  documents/     file acceptance, PDF.js parsing, local OCR
  schema/        field definitions and JSON Schema generation
  providers/     OpenAI, Anthropic, Gemini, Qwen adapters
  extraction/    provider independent extraction orchestration
  validation/    deterministic local validation
  review/        human correction state
  persistence/   IndexedDB and portable backup
  export/        JSON, CSV, XLSX
  evals/         local quality metrics
```

Provider code is isolated from validation, review, persistence, and export logic.

## Development

Requirements: Node.js 22 or newer and npm.

```bash
npm install
npm run dev
```

Verification:

```bash
npm run test:domain
npm run test:run
npm run typecheck
npm run build
npm run test:e2e
```

`npm run test:domain` runs dependency free Node 22 domain tests. It remains usable when package installation is unavailable.

## Cloudflare Workers deployment

FlowExtract requires no application backend. The public V0.1 deployment uses Cloudflare Workers + Static Assets with Git integration.

```text
Production branch: main
Build command: npm run build
Deploy command: npx wrangler deploy
Static assets: ./dist
Node version: 22
```

Production: `https://flowextract.edwardxie421.workers.dev`

The repository `wrangler.jsonc` configures `./dist` as SPA static assets. V0.1 stays on the free `workers.dev` hostname and does not add a paid domain, database, server-side AI proxy, or FlowExtract-funded AI account.

## Provider notes

Default model strings are convenience values only and are editable in the UI. The V0.1 defaults were rechecked against official provider documentation on 2026-09-19: `gpt-5.6-luna`, `claude-sonnet-5`, `gemini-3.8-flash`, and `qwen3.8-max`.

OpenAI uses the Responses API with structured JSON output and requests `store: false`. Anthropic uses the Messages API and structured output. The browser adapter includes Anthropic's direct browser access header. Gemini uses `generateContent` with `responseJsonSchema`. Qwen uses Alibaba Cloud Model Studio's OpenAI-compatible Chat Completions interface with strict JSON Schema output. Qwen region selection is explicit; FlowExtract does not automatically retry a document in another region.

Browser BYOK is a deliberate V0.1 tradeoff for a zero backend, user controlled tool. The key is never embedded in the application and is cleared on reload, but it is still accessible to the page runtime while entered. OpenAI and Google both recommend keeping long lived production API keys on a server. For V0.1 testing, use a dedicated provider key with the smallest practical permissions, quota, and spend limits. A future hardened option can use a user run local companion or provider specific short lived authorization when available.

Provider APIs can change. Recheck current provider documentation before each release. A valid model ID does not imply that FlowExtract has completed a live API smoke test for that provider.

## Known V0.1 limitations

* OCR quality varies by scan quality and language data availability. Tesseract language assets may require a network download before OCR can start, while document pixels remain in the browser OCR path.
* Exact bounding box provenance is not implemented yet. V0.1 keeps document, page text, provider, model, prediction, correction, validation, and timestamp provenance.
* Large PDFs are processed in browser memory and may be slow on low memory devices.
* Binary documents are not persisted in IndexedDB. After a reload, parsed text remains available while the embedded binary preview needs the file to be selected again.
* Direct BYOK depends on each provider continuing to permit browser requests and on the user's account configuration.

## Repository documents

* `docs/superpowers/specs/2026-09-18-flowextract-v0.1-design.md`
* `docs/superpowers/plans/2026-09-18-flowextract-v0.1-phase1.md`
* `CONTRIBUTING.md`
* `SECURITY.md`
* `CHANGELOG.md`
* `docs/deployment-cloudflare-workers.md`
* `docs/release-v0.1.md`
* `docs/release-v0.1.1.md`
* `docs/manual-ai-chat-mode.md`

## License

MIT

# FlowExtract V0.1.1

FlowExtract V0.1.1 adds a lower-friction AI Chat extraction path while keeping the existing BYOK API workflow.

## Highlights

* Added **AI Chat** and **API** extraction modes.
* AI Chat mode generates the extraction prompt locally from the current parsed document and schema.
* Users can copy the prompt into ChatGPT, Claude, Gemini, Qwen, or another AI chat and paste the JSON response back into FlowExtract.
* AI Chat mode requires no Provider API key.
* Pasted JSON uses the existing deterministic Validation, Human-in-the-Loop Review, correction, Final Value, Export, Persistence, and Eval flow.
* Manual extraction provenance records the selected chat service while the raw pasted chat response remains transient UI state.
* Legacy V0.1.0 extraction records without an `extractionMode` continue to restore as API records.
* The existing OpenAI, Anthropic, Gemini, and Qwen BYOK adapters remain available.

## Production verification

The public deployment is:

`https://flowextract.edwardxie421.workers.dev`

The V0.1.1 production gate uses Playwright against the real workers.dev origin with a synthetic local project. It verifies:

1. The deployed UI reports V0.1.1.
2. AI Chat mode is available without an API key.
3. The generated prompt contains the expected document content and schema field instructions.
4. A pasted JSON extraction is parsed and validated locally.
5. Human correction changes the reviewed Final Value while preserving the AI prediction.
6. JSON export uses the corrected Final Value.
7. API mode still exposes the runtime-only BYOK key field and provider choices.

The release is created only after dependency-free domain tests, `npm ci`, Vitest, TypeScript typecheck, production build, local Chromium smoke, and the live production smoke all succeed on the release commit.

## Privacy and security boundaries

* FlowExtract still has no application backend.
* Documents are parsed locally in the browser.
* AI Chat mode does not sign in to, automate, scrape, or read third-party AI chat sessions.
* Copying a generated prompt does not transmit it. Once the user pastes it into an external AI service, that service's privacy, retention, account, and billing policies apply.
* API keys remain page-runtime-only and are excluded from IndexedDB and project backups.
* The raw pasted AI Chat response is not persisted to the project record.
* Original PDF, PNG, and JPG binaries remain excluded from IndexedDB and project backups by default.
* Qwen region routing remains explicit with no automatic cross-region fallback.

## Provider verification status

* Qwen China (Beijing): **Live Verified**
* Qwen Singapore: **Experimental**
* Qwen Hong Kong: **Experimental**
* OpenAI: **Experimental**
* Anthropic: **Experimental**
* Gemini: **Experimental**

Experimental means the adapter and contract tests exist, while FlowExtract has not completed a real provider API smoke test for that provider or region in this release.

## Scope

V0.1.1 stays within the existing Local First, zero-fixed-cost product scope. It adds no FlowExtract backend, account system, database, cloud file storage, paid infrastructure, or FlowExtract-funded AI usage.

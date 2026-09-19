# FlowExtract V0.1 Design Specification

Date: 2026-09-18
Status: Approved from user supplied product brief

## 1. Goal

Build a zero fixed cost, local first, open source web application that converts PDF and image documents into validated structured data with a human review loop.

Primary flow:

Document -> Extract -> Validate -> Review -> Export

V0.1 is successful when a non technical user can upload a real document, define fields, use their own AI API key, review only questionable results, correct data, and export JSON, CSV, or XLSX without FlowExtract operating a server.

## 2. Non goals

V0.1 excludes accounts, subscriptions, Stripe, cloud databases, cloud file storage, team collaboration, Drive or Dropbox integrations, CRM or ERP integrations, RAG, chat, native mobile applications, complex workflow builders, FlowExtract funded model calls, and enterprise permission systems.

## 3. Fixed constraints

1. Fixed operating cost must remain USD 0 per month before real users and revenue.
2. The application must be deployable as static assets to Cloudflare Workers + Static Assets on the Free plan.
3. User documents must not be uploaded to a FlowExtract controlled server.
4. AI calls use BYOK and go directly from the browser to the provider selected by the user.
5. API keys remain in volatile UI state only. They are not persisted, logged, exported, or committed.
6. Project data is persisted locally with IndexedDB.
7. The architecture must isolate provider specific code from extraction, validation, review, persistence, and export logic.
8. README and user facing repository documentation must support English and Simplified Chinese.

## 4. Architecture

The application is a React and TypeScript single page application built by Vite.

Core modules:

* `features/documents`: file acceptance, PDF text extraction, image OCR, document metadata.
* `features/schema`: schema definitions, schema builder state, conversion to JSON Schema.
* `features/providers`: provider interface plus OpenAI, Anthropic, Gemini, and Qwen adapters, including explicit Qwen region routing.
* `features/extraction`: provider independent extraction orchestration and response normalization.
* `features/validation`: deterministic validation of AI output against field definitions and rules.
* `features/review`: editable field review model and issue focused UI.
* `features/persistence`: IndexedDB storage and project backup and restore.
* `features/export`: JSON, CSV, and XLSX serialization.
* `features/evals`: lightweight metrics derived from predictions, validation, and human corrections.

The UI composes these modules in one workspace. Business logic stays out of React components where practical.

## 5. Data model

### DocumentRecord

* id
* name
* mimeType
* size
* createdAt
* text
* pages
* sourceKind: pdf | image
* ocrUsed

### FieldDefinition

* id
* name
* key
* type: string | number | date | boolean
* required
* description
* rules
  * pattern optional
  * min optional
  * max optional

### SchemaDefinition

* id
* name
* fields
* updatedAt

### ExtractionField

* key
* prediction
* finalValue
* status: valid | warning | error | corrected
* validationIssues
* sourceText optional
* sourcePage optional
* confidence optional
* correctedByHuman

### ExtractionRecord

* id
* documentId
* schemaId
* provider
* model
* providerRegion optional
* processedAt
* rawResponse optional
* fields

### ProjectRecord

* id
* name
* updatedAt
* document metadata and parsed text
* schema
* extraction

Raw API keys and uploaded binary files are deliberately excluded from ProjectRecord in V0.1.

## 6. Document ingestion

Accepted extensions and MIME types:

* PDF
* PNG
* JPG and JPEG

For PDFs, PDF.js extracts page text in the browser. If a page has very little extractable text, the UI may offer OCR fallback. V0.1 OCR uses Tesseract.js locally in the browser. Image files are OCRed locally before AI extraction.

V0.1 prioritizes ordinary digital PDFs. OCR quality for complex scans is best effort and visibly labeled.

## 7. Schema builder

A schema contains ordered field definitions. Users can add, remove, rename, reorder later, and edit fields. V0.1 requires add, edit, and remove.

Field types:

* string
* number
* date
* boolean

Rules:

* required
* string regular expression
* numeric minimum and maximum
* date parseability
* boolean type

The schema builder rejects empty keys, duplicate keys, and invalid regular expressions before extraction.

Provider JSON Schema structural requirements are separate from the user's business `required` rule. For strict structured output compatibility, every schema key is structurally required in the provider JSON Schema. Fields that are optional in FlowExtract use a nullable JSON Schema type and may return `null`. Local validation applies the user's `required` setting to decide whether a null or missing value is an error.

## 8. Provider abstraction

All providers implement:

```ts
interface AIProvider {
  id: ProviderId;
  extract(input: ProviderExtractionInput): Promise<ProviderExtractionResult>;
}
```

`ProviderExtractionInput` includes API key, model, document text, JSON Schema, and optional provider region metadata. Provider adapters own endpoint URLs, headers, request bodies, provider response parsing, and provider-specific region resolution.

V0.1 includes browser adapters for OpenAI, Anthropic, Gemini, and Qwen. Model identifiers are editable in the UI so provider model lifecycle changes do not require a FlowExtract release. Qwen region selection is explicit and must never automatically fall back across regions after a failed request.

Provider implementation status is separate from live verification status. Qwen is Live Verified for V0.1 through a production China (Beijing) smoke test. OpenAI, Anthropic, and Gemini remain Experimental until their own live API smoke tests pass.

Provider errors are normalized into safe messages. API keys and full document text are never logged.

## 9. Extraction contract

The normalized provider result is a JSON object whose keys correspond to schema field keys. Missing values use `null`.

Providers are prompted to return only the requested fields. The response passes through JSON parsing and structural validation before becoming an ExtractionRecord.

V0.1 provenance stores provider, model, optional provider region, timestamp, document id, prediction, final value, validation issues, correction state, and optional source evidence returned by the provider. Exact bounding box provenance is deferred.

## 10. Validation

Validation is deterministic and runs locally after extraction and after every human edit.

Checks:

* output is an object
* unexpected output fields are reported as structure validation issues
* required values are present
* string values have correct type
* number values are finite numbers or numeric strings that can be normalized
* date values use a real ISO calendar date in `YYYY-MM-DD` form
* boolean values are boolean or conservative string representations
* regex pattern for strings
* minimum and maximum for numbers

Validation produces field level issues with severity and message.

## 11. Review UX

Desktop first workspace with three logical regions:

1. Document source panel showing extracted text and document metadata.
2. Structured fields panel showing editable final values.
3. Validation summary showing issue counts and field status.

Invalid or warning fields are visually marked. Users can edit final values directly. A correction changes status to corrected when the final value differs from the AI prediction.

The review screen never hides the original prediction.

## 12. Export

Exports use final reviewed values.

* JSON: object plus optional provenance envelope.
* CSV: one row, headers from schema keys, RFC style escaping.
* XLSX: one worksheet using ExcelJS.

The export module is independent from UI code and covered by tests.

## 13. Local persistence and backup

IndexedDB stores project records under a versioned database. Autosave occurs after meaningful project changes with debounce in the UI. On startup, FlowExtract restores the most recently updated local project after IndexedDB hydration completes; autosave must not run before that initial hydration finishes.

Backup exports a portable JSON file containing version, project metadata, parsed document text, schema, extraction, and validation state. Restore validates the backup format before writing it locally.

API keys and binary documents are excluded from backup.

## 14. Evals foundation

V0.1 computes simple local metrics when data exists:

* field count
* valid field count
* validation failure count
* human correction count
* field accuracy proxy after correction: unchanged predictions divided by reviewed fields

Future versions can export anonymized or user controlled Golden Dataset artifacts. V0.1 never uploads eval data automatically.

## 15. Error handling

Errors fall into ingestion, OCR, provider, parsing, validation, persistence, and export categories. User facing errors are concise and safe. Sensitive request contents and keys are never rendered into error logs.

Malformed model responses do not destroy the previous valid extraction.

## 16. Testing

Vitest covers pure modules and persistence where practical with fake IndexedDB. React UI tests cover the critical workflow state. Playwright configuration is added for later browser E2E smoke tests.

Priority automated tests:

* schema validation
* provider request and response parsing
* malformed AI response
* required field validation
* numeric and date validation
* CSV export
* JSON export
* XLSX export
* local persistence
* provider abstraction contract
* backup validation

## 17. Deployment

`npm run build` generates static assets in `dist/`. V0.1 production uses Cloudflare Workers + Static Assets with `wrangler.jsonc` pointing to `./dist` and SPA fallback enabled. Cloudflare Workers Builds connects to GitHub and deploys verified `main` commits to the free `workers.dev` hostname.

No FlowExtract runtime backend, database, paid domain, or paid SaaS is required.

## 18. V0.1 release gate

A V0.1 release requires:

1. Production build succeeds.
2. Unit tests pass.
3. Core upload to export flow works in a browser.
4. API keys are not persisted.
5. README explains BYOK privacy behavior.
6. Backup and restore work.
7. Digital PDF path is reliable enough for public testing.
8. Basic image OCR path is available and clearly marked best effort.

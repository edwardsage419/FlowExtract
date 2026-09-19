# FlowExtract V0.1 Phase 1 Implementation Plan

> Historical implementation plan. Final V0.1 deployment and provider verification status are recorded in the current design spec, `docs/release-v0.1.md`, and `docs/deployment-cloudflare-workers.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a browser-only end-to-end MVP path from document ingestion through schema definition, BYOK AI extraction, deterministic validation, human review, local persistence, and JSON/CSV/XLSX export.

**Architecture:** A Vite React TypeScript SPA with isolated feature modules. Pure domain functions handle schema, extraction normalization, validation, and export. Provider adapters make direct browser requests. IndexedDB stores non-secret project state.

**Tech Stack:** TypeScript, React, Vite, PDF.js, Tesseract.js, native IndexedDB, ExcelJS, Vitest, Testing Library, fake-indexeddb, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-18-flowextract-v0.1-design.md`

## Global Constraints

* Fixed operating cost remains USD 0 per month.
* No FlowExtract backend is introduced.
* API keys are never persisted or logged.
* User documents remain local except text explicitly sent to the selected BYOK provider.
* Provider specific request code cannot leak into validation, review, persistence, or export modules.
* V0.1 accepts PDF, PNG, JPG, and JPEG.
* README is available in English and Simplified Chinese.

---

### Task 1: Project foundation and schema domain

**Files:**
* Create package and Vite configuration.
* Create `src/features/schema/types.ts`.
* Create `src/features/schema/schema.ts`.
* Test `src/features/schema/schema.test.ts`.

**Interfaces:**
* Produces `FieldDefinition`, `SchemaDefinition`, `validateSchemaDefinition()`, and `schemaToJsonSchema()`.

- [ ] Write tests for duplicate keys, required metadata, invalid regex, and JSON Schema conversion.
- [ ] Run tests and verify failure because production functions do not exist.
- [ ] Implement minimal schema domain.
- [ ] Run tests and verify green.
- [ ] Commit.

### Task 2: Deterministic validation engine

**Files:**
* Create `src/features/validation/types.ts`.
* Create `src/features/validation/validate.ts`.
* Test `src/features/validation/validate.test.ts`.

**Interfaces:**
* Consumes `SchemaDefinition`.
* Produces `validateExtraction(schema, raw)` and normalized reviewed fields.

- [ ] Write failing tests for required, number range, date, boolean, regex, and unknown raw shape.
- [ ] Run tests and verify expected failure.
- [ ] Implement field normalization and issue generation.
- [ ] Run full validation tests.
- [ ] Commit.

### Task 3: Export module

**Files:**
* Create `src/features/export/exporters.ts`.
* Test `src/features/export/exporters.test.ts`.

**Interfaces:**
* Consumes final reviewed field values.
* Produces JSON text, CSV text, and XLSX ArrayBuffer.

- [ ] Write failing tests for JSON, CSV escaping, and XLSX workbook output.
- [ ] Verify red.
- [ ] Implement exporters.
- [ ] Verify green.
- [ ] Commit.

### Task 4: Provider abstraction and adapters

**Files:**
* Create `src/features/providers/types.ts`.
* Create provider helpers and adapters for OpenAI, Anthropic, Gemini, and Qwen.
* Test response parsing and normalized errors.

**Interfaces:**
* Produces `AIProvider`, `ProviderExtractionInput`, `ProviderExtractionResult`, `getProvider(id)`.

- [ ] Write failing contract and parser tests using injected fetch.
- [ ] Verify red.
- [ ] Implement provider adapters with editable model names.
- [ ] Verify green.
- [ ] Commit.

### Task 5: Document parsing and OCR

**Files:**
* Create `src/features/documents/types.ts`.
* Create `src/features/documents/parseDocument.ts`.
* Create PDF.js and Tesseract.js browser adapters.
* Test file acceptance and pure text assembly helpers.

**Interfaces:**
* Produces `parseDocument(file, options)` returning `DocumentRecord`.

- [ ] Write failing tests for accepted file types and page text joining.
- [ ] Verify red.
- [ ] Implement PDF extraction and image OCR.
- [ ] Verify unit tests and TypeScript build.
- [ ] Commit.

### Task 6: IndexedDB persistence and backup

**Files:**
* Create `src/features/persistence/projectStore.ts`.
* Create `src/features/persistence/backup.ts`.
* Test with fake IndexedDB.

**Interfaces:**
* Produces save, load, list, delete, export backup, and import backup operations.

- [ ] Write failing persistence and backup validation tests.
- [ ] Verify red.
- [ ] Implement versioned local storage.
- [ ] Verify green.
- [ ] Commit.

### Task 7: Review and eval domain

**Files:**
* Create `src/features/review/review.ts`.
* Create `src/features/evals/metrics.ts`.
* Add tests.

**Interfaces:**
* Produces immutable correction update and local metrics computation.

- [ ] Write failing correction and metrics tests.
- [ ] Verify red.
- [ ] Implement minimal functions.
- [ ] Verify green.
- [ ] Commit.

### Task 8: React end-to-end workspace

**Files:**
* Create `src/App.tsx`, supporting components, and CSS.
* Create main entry point.
* Add component smoke tests.

**Interfaces:**
* Composes all earlier modules without duplicating domain logic.

- [ ] Write a failing smoke test that renders the workspace and schema builder.
- [ ] Verify red.
- [ ] Implement upload, schema, provider settings, extraction, validation review, persistence, backup, and export controls.
- [ ] Verify UI test.
- [ ] Commit.

### Task 9: Repository docs and deployment configuration

**Files:**
* Create `README.md`, `README.zh-CN.md`, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`.
* Create Cloudflare Workers + Static Assets guidance and GitHub Actions CI.
* Add `playwright.config.ts` and browser smoke test.

**Interfaces:**
* Produces reproducible local development and static deployment instructions.

- [ ] Document privacy, BYOK, current limitations, and zero fixed cost deployment.
- [ ] Configure CI to install, test, typecheck, and build.
- [ ] Configure Playwright smoke path.
- [ ] Commit.

### Task 10: Verification and release readiness audit

**Files:**
* Modify only files required by discovered failures.

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run lint if configured.
- [ ] Inspect built bundle for accidental API key literals and sensitive fixtures.
- [ ] Compare implementation against spec release gate.
- [ ] Record remaining limitations in README and CHANGELOG.
- [ ] Commit final verified state.

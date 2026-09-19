# FlowExtract V0.1.1 release gate

Date: 2026-09-19

Target commit before release-finalization docs: `f262f255ea7b38141197d6c7263f381678e112c5`

Production URL:

`https://flowextract.edwardxie421.workers.dev`

## Scope

V0.1.1 adds a second extraction path while preserving the V0.1 core pipeline:

`Document -> Extract -> Validate -> Review -> Export`

### AI Chat mode

* Generates the extraction prompt locally from parsed document text and the current schema.
* Supports manual workflows with ChatGPT, Claude, Gemini, Qwen, or another AI chat.
* Requires no API key in FlowExtract.
* Imports pasted JSON into the existing deterministic Validation and Review flow.
* Records the selected manual AI service as provenance.
* Does not persist the raw pasted chat response.

### API mode

* Preserves the existing BYOK flow for OpenAI, Anthropic, Gemini, and Qwen.
* Preserves explicit Qwen region selection.
* Preserves the no automatic cross-region fallback rule.
* Keeps API keys in volatile page memory only.

## Automated release gate

The latest main CI Run #53 completed successfully for commit `f262f255ea7b38141197d6c7263f381678e112c5`.

Passed jobs:

1. Dependency-free domain tests.
2. `npm ci --no-audit --no-fund`.
3. Vitest.
4. TypeScript typecheck.
5. Vite production build.
6. Playwright Chromium browser smoke.
7. Production smoke against the live `workers.dev` deployment.

## Production smoke coverage

The production smoke test verified the live deployment and covered:

1. V0.1.1 version detection.
2. Restoration of a fictional local project from IndexedDB.
3. AI Chat mode as the active manual extraction path.
4. Locally generated extraction prompt containing the expected document and schema instructions.
5. Pasted JSON import.
6. Deterministic Validation with zero issues for the synthetic valid result.
7. Human correction from Amount `1333.8` to `1333.81`.
8. Preservation of corrected Review state.
9. JSON export using Final Value `1333.81`.
10. API mode remains available.
11. API key field remains runtime-only.
12. Qwen provider option remains available with the Beijing verification label.

The synthetic smoke project contains no private user data and no real provider credentials.

## Privacy and trust boundary

AI Chat mode does not sign in to, automate, scrape, or read a third-party AI chat account. FlowExtract only generates the prompt locally. The user chooses whether and where to paste it.

After a user pastes the generated prompt into an external AI service, that provider's privacy, retention, billing, and account policies apply.

API mode retains the V0.1 browser BYOK tradeoff. API keys are not stored in IndexedDB, project backups, repository files, CI, or Cloudflare deployment configuration.

## Provider verification

Qwen China (Beijing) remains the live-verified API provider path.

OpenAI, Anthropic, Gemini, Qwen Singapore, and Qwen Hong Kong remain Experimental until their own real API smoke tests are completed.

## Release publication

The code and production gate are ready for public V0.1.1 publication after this documentation change is merged and CI is green.

Public publication requires:

1. Git tag `v0.1.1` on the final verified main commit.
2. GitHub Release titled `FlowExtract V0.1.1`.
3. Release notes based on the V0.1.1 section of `CHANGELOG.md`.
4. The production URL above.
5. No credentials, private documents, or user data attached.

# FlowExtract V0.1.2 release gate

Date: 2026-09-19

Feature commit verified in production:

`4ec7d015402349847b137751c92c748d83c54b38`

Production URL:

`https://flowextract.edwardxie421.workers.dev`

## Scope

V0.1.2 reduces friction in the AI Chat path without turning third-party AI websites into unofficial APIs.

The core pipeline remains:

`Document -> Extract -> Validate -> Review -> Export`

### Assisted AI Chat

* One click copies the generated extraction prompt and opens the selected AI chat page.
* Supported shortcuts include ChatGPT, Claude, Gemini, and Qwen.
* After the user copies the AI response, one click reads the clipboard and immediately runs the existing import, Validation, and Review flow.
* Manual response paste remains available when clipboard permissions are unavailable or blocked.
* Clipboard access happens only after an explicit user action.
* FlowExtract does not monitor clipboard content in the background.

### Security boundary

V0.1.2 does not add:

* AI-page DOM automation.
* Cookie or authenticated session access.
* Output scraping.
* Hidden or unofficial provider APIs.
* Backend services.
* New runtime dependencies.

The user still decides whether to paste the generated prompt into an external AI service and whether to copy the response back.

### API mode

The existing BYOK API flow remains available and unchanged:

* OpenAI.
* Anthropic.
* Gemini.
* Qwen.
* Explicit Qwen region selection.
* No automatic cross-region fallback.
* API keys remain volatile page-memory state only.

## Automated release gate

Main CI Run #59 completed successfully for commit `4ec7d015402349847b137751c92c748d83c54b38`.

Passed jobs:

1. Dependency-free domain tests.
2. `npm ci --no-audit --no-fund`.
3. Vitest.
4. TypeScript typecheck.
5. Vite production build.
6. Playwright Chromium browser smoke.
7. Production smoke against the live `workers.dev` deployment.

## Production smoke coverage

The live production smoke verified:

1. V0.1.2 version detection.
2. Restoration of a fictional local project from IndexedDB.
3. AI Chat mode as the active extraction path.
4. Locally generated extraction prompt.
5. Browser clipboard permission for the FlowExtract origin.
6. Clipboard response import through **Paste from clipboard & validate**.
7. Deterministic Validation.
8. Human correction from Amount `1333.8` to `1333.81`.
9. JSON export using Final Value `1333.81`.
10. API mode remains available.
11. API key input remains empty until supplied by the user.
12. Qwen Beijing remains the live-verified provider path.

The smoke test uses fictional data and no real provider credentials.

## Public release

After this release-finalization documentation is merged and the final main CI is green, publish:

* Tag: `v0.1.2`
* Release title: `FlowExtract V0.1.2`
* Target: the final verified `main` commit
* Mark as latest release

Do not attach credentials, private documents, or user data.

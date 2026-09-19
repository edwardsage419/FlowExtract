# V0.1 release checklist

This checklist is the final gate for the first public FlowExtract release.

## Automated gate

All checks must be green on the final `main` commit:

1. `npm run test:domain`
2. `npm ci --no-audit --no-fund`
3. `npm run test:run`
4. `npm run typecheck`
5. `npm run build`
6. `npm run test:e2e`
7. Cloudflare Workers production build

Do not create the release tag while any gate is failing or pending.

## Provider verification gate

Provider adapter implementation and live provider verification are separate release facts.

* Qwen is **Live Verified** for V0.1 using Alibaba Cloud Model Studio in China (Beijing).
* OpenAI, Anthropic, and Gemini ship as **Experimental**. Their adapters and contract tests are included, but V0.1 has not completed a real API smoke test for those providers.
* The live Qwen smoke test used a fictional invoice and verified: HTTP success, strict structured output parsing, local validation, human correction, revalidation, JSON/CSV/XLSX export, IndexedDB reload, and Backup/Restore.
* The AI prediction `1333.8` remained preserved after the reviewed Final Value was corrected to `1333.81`.
* Export used Final Value consistently across JSON, CSV, and XLSX.
* Reload restored parsed text, schema, extraction, prediction, correction, and validation from IndexedDB while the API key remained empty.
* Backup/Restore preserved project data and Qwen provenance (`provider`, `model`, `providerRegion`) while excluding the API key and original binary document.
* Qwen region selection is explicit. A failed request must never trigger an automatic retry in another region.

## Provider model IDs

The editable V0.1 default model IDs were rechecked against official provider documentation on 2026-09-19:

* OpenAI: `gpt-5.6-luna`
* Anthropic: `claude-sonnet-5`
* Gemini: `gemini-3.8-flash`
* Qwen: `qwen3.8-max`

Model validity does not imply live FlowExtract verification. Recheck official provider documentation for every release.

## Repository gate

Confirm these files are present and current:

* `README.md`
* `README.zh-CN.md`
* `LICENSE`
* `CONTRIBUTING.md`
* `SECURITY.md`
* `CHANGELOG.md`
* `docs/superpowers/specs/2026-09-18-flowextract-v0.1-design.md`
* `docs/superpowers/plans/2026-09-18-flowextract-v0.1-phase1.md`
* `docs/deployment-cloudflare-workers.md`
* `docs/release-v0.1.md`
* `tests/fixtures/README.md`
* `wrangler.jsonc`

Confirm the repository contains no API keys, private documents, or user data.

## Deployment gate

Production uses Cloudflare Workers + Static Assets with Git integration.

Production URL:

`https://flowextract.edwardxie421.workers.dev`

Required deployment settings are documented in `docs/deployment-cloudflare-workers.md`.

The production deployment must come from the verified `main` commit. Do not configure user AI API keys as Cloudflare environment variables.

## Release gate

After the final `main` CI and production deployment are green:

1. Create Git tag `v0.1.0` from that exact verified `main` commit.
2. Create a GitHub Release titled `FlowExtract V0.1.0`.
3. Use the V0.1.0 section of `CHANGELOG.md` as the release notes basis.
4. Include `https://flowextract.edwardxie421.workers.dev` in the release.
5. State the Local First, browser BYOK, provider verification, and Qwen region boundaries clearly.
6. State that OpenAI, Anthropic, and Gemini are Experimental in V0.1.
7. Attach no private documents, API keys, test credentials, or user data.

## Post-release observation

Track real user feedback without expanding V0.1 scope immediately. Record recurring requests around document types, fields, OCR failures, extraction errors, review time, correction rate, repeat usage, provider availability, and willingness to pay as candidates for V0.2.

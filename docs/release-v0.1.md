# V0.1 release checklist

This checklist is the final gate for the first public FlowExtract release.

## Automated gate

All checks must be green on `main`:

1. `npm run test:domain`
2. `npm ci --no-audit --no-fund`
3. `npm run test:run`
4. `npm run typecheck`
5. `npm run build`
6. `npm run test:e2e`

## Provider verification gate

Provider adapter implementation and live provider verification are separate release facts.

* OpenAI, Anthropic, and Gemini may ship as **Experimental** when their contract tests pass but a real API call has not been completed.
* Qwen is the V0.1 live verification target. It remains **Experimental** until the production deployment completes a real BYOK smoke test.
* A live Qwen smoke test must use a public or fictional fixture and must verify: HTTP success, structured output parsing, local validation, review correction, revalidation, and JSON/CSV/XLSX export.
* API keys must never be committed to GitHub, stored in CI secrets for this smoke test, copied into project backups, or shared in screenshots.
* Qwen region selection must be explicit. A failed request must never trigger an automatic retry in another region.
* The selected provider region is provenance and must be retained with the extraction record.

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
* `docs/deployment-cloudflare-pages.md`
* `tests/fixtures/README.md`

Confirm the repository contains no API keys, private documents, or user data.

## Deployment gate

Create the Cloudflare Pages project with Git integration and deploy `main` using the settings in `docs/deployment-cloudflare-pages.md`.

Use the free `pages.dev` hostname. Do not purchase a domain for V0.1.

Perform the clean browser verification from the deployment guide.

## Release gate

After deployment verification:

1. Create Git tag `v0.1.0` from the verified `main` commit.
2. Create a GitHub Release titled `FlowExtract V0.1.0`.
3. Use the V0.1 section of `CHANGELOG.md` as the release notes basis.
4. Include the live `pages.dev` URL in the release.
5. State the Local First and BYOK security boundaries clearly.
6. Attach no private documents, API keys, or test credentials.

## Post release observation

Track real user feedback without expanding V0.1 scope immediately. Record recurring requests around document types, fields, OCR failures, review time, repeat usage, and willingness to pay as candidates for V0.2.

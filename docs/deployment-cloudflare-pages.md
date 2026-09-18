# Cloudflare Pages deployment

FlowExtract V0.1 is designed to run as a static browser application with no FlowExtract backend.

## Cost boundary

Use the Cloudflare Free plan and the generated `pages.dev` hostname. Do not add a paid domain, database, server, Pages Functions, Workers, storage product, analytics SaaS, or FlowExtract funded AI account for V0.1.

Cloudflare documents a Free plan for Pages. As of September 2026, the Free plan allows 500 builds per month with one build at a time. Static asset requests are free and unlimited. Verify current Cloudflare limits before changing the deployment model.

## Git integration

Connect Cloudflare Pages to the public GitHub repository:

`edwardsage419/FlowExtract`

Use these settings:

```text
Production branch: main
Root directory: /
Build command: npm run build
Build output directory: dist
```

The repository includes `.node-version` with Node.js 22 so the Pages build runtime is pinned independently of the platform default.

Do not configure API keys as Cloudflare environment variables. FlowExtract BYOK keys are entered by the user at runtime and are intentionally absent from the deployment environment.

## First deployment verification

After Cloudflare reports a successful deployment, verify the generated `pages.dev` site in a clean browser profile.

1. The FlowExtract heading and Document, Schema, AI Extraction, and Review sections render.
2. A public fixture PDF or image can be selected.
3. A schema field can be added and edited.
4. Refreshing the page clears any API key entered in the current session.
5. Project state can be saved locally and restored from IndexedDB.
6. JSON and CSV export work without provider access.
7. XLSX export downloads a valid workbook.
8. Browser developer tools show no request to a FlowExtract application backend.

For a provider smoke test, use a dedicated low quota test key and a non-sensitive fixture. Never paste a production credential into an issue, commit, log, screenshot, or chat.

## Security headers

`public/_headers` is deployed with the static assets. Review it whenever external provider endpoints, OCR assets, or third party libraries change.

## Rollback

If a release deployment is faulty, stop further product changes, identify the last known good Git commit, and redeploy that revision from Cloudflare Pages. Keep deployment history tied to Git commits so rollback remains reproducible.

## References

Cloudflare Pages limits:
https://developers.cloudflare.com/pages/platform/limits/

Cloudflare Pages Git integration:
https://developers.cloudflare.com/pages/get-started/git-integration/

Cloudflare Pages build image:
https://developers.cloudflare.com/pages/configuration/build-image/

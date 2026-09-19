# Cloudflare Workers + Static Assets deployment

FlowExtract V0.1 is deployed as a static browser application on Cloudflare Workers using Static Assets. It has no FlowExtract application backend, database, server-side AI proxy, or server-side credential store.

## Production deployment

Repository:

`edwardsage419/FlowExtract`

Production URL:

`https://flowextract.edwardxie421.workers.dev`

Cloudflare Workers Builds is connected to GitHub. Production deploys are created from `main`.

Build settings:

```text
Production branch: main
Root directory: /
Build command: npm run build
Deploy command: npx wrangler deploy
Node version: 22
```

Preview builds may use `npx wrangler versions upload`. Production promotion must come from the verified `main` branch.

The repository contains `wrangler.jsonc`:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "flowextract",
  "compatibility_date": "2026-09-18",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

The Vite production build writes static files to `dist/`. No Worker `main` script is configured.

## Cost boundary

V0.1 stays on Cloudflare's Free plan and uses the generated `workers.dev` hostname. Do not add a paid domain, database, object storage, AI proxy, analytics SaaS, or FlowExtract-funded AI account before product validation requires it.

Cloudflare documents static-asset requests for Workers as free and unlimited. If the architecture later adds a Worker script or other Cloudflare products, re-check current pricing and limits before deployment.

## Security boundary

Do not configure user AI API keys as Cloudflare environment variables, repository secrets, or deployment credentials.

Users enter BYOK credentials in the browser at runtime. Keys remain in volatile page memory and are cleared on reload. Parsed document text is sent directly from the browser to the provider selected by the user; Cloudflare does not proxy AI extraction requests.

For Qwen, the user-selected region determines the Alibaba Cloud endpoint. FlowExtract does not automatically retry the same document in another region.

## Production verification

After a successful production deployment, verify the `workers.dev` site:

1. FlowExtract renders the Document, Schema, AI Extraction, Review, and Export workflow.
2. A public or synthetic PDF can be parsed locally.
3. Schema fields can be created and edited.
4. AI Chat mode generates the expected local prompt.
5. Assisted AI Chat can import a copied response through **Paste from clipboard & validate** when browser permission is granted.
6. Manual response paste remains usable when clipboard permission is unavailable or blocked.
7. API mode remains available and API keys are empty after a page reload.
8. Parsed document text, schema, extraction, validation, and human corrections restore from IndexedDB.
9. The original uploaded binary is not restored from IndexedDB.
10. JSON, CSV, and XLSX exports use Final Value.
11. Backup and Restore preserve project data and corrections but exclude credentials and the original binary document.
12. Browser developer tools show no FlowExtract application backend receiving document text or provider credentials.

Release history:

* V0.1.0 used a fictional invoice with Qwen China (Beijing) for the real BYOK extraction smoke.
* V0.1.2 added automated live-production coverage for Assisted AI Chat clipboard import, deterministic validation, human correction, Final Value JSON export, and API-mode regression.
* Final V0.1.2 main CI Run #61 passed against `https://flowextract.edwardxie421.workers.dev` on commit `505cd30d227dc9919ef71b5451836f1b5ab1a319`.

## Rollback

If a production deployment is faulty, stop further release work, identify the last known-good Git commit, and redeploy that revision through Workers Builds. Keep deployment history tied to Git commits so rollback remains reproducible.

## References

Cloudflare Workers Static Assets:
https://developers.cloudflare.com/workers/static-assets/

Cloudflare Workers Builds Git integration:
https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/

Workers Builds configuration:
https://developers.cloudflare.com/workers/ci-cd/builds/configuration/

Static Assets billing and limitations:
https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/

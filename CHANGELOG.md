# Changelog / 更新记录

## V0.1.0 — 2026-09-19

English:

* Added the V0.1 specification and modular Local First architecture.
* Added browser-side PDF.js text extraction and Tesseract.js OCR fallback for scans and images.
* Added schema building for string, number, date, and boolean fields, plus Required, regex, minimum, maximum, strict ISO date, malformed output, and unknown-field validation.
* Added provider-independent extraction orchestration with BYOK adapters for OpenAI, Anthropic, Gemini, and Qwen.
* Added explicit Qwen region routing for China (Beijing), Singapore, and Hong Kong (China), with no automatic cross-region fallback.
* Added provider verification metadata. Qwen is V0.1 Live Verified; OpenAI, Anthropic, and Gemini remain Experimental until their own real API smoke tests pass.
* Rechecked the V0.1 default model IDs against official provider documentation on 2026-09-19: `gpt-5.6-luna`, `claude-sonnet-5`, `gemini-3.8-flash`, and `qwen3.8-max`.
* Added deterministic local validation immediately after AI prediction and after human correction.
* Added Human-in-the-Loop Review that preserves AI Prediction, Final Value, correction state, validation result, provider, model, region, and processing timestamp.
* Added JSON, CSV, and XLSX export from Final Value.
* Added IndexedDB autosave and startup restoration of the most recently updated project.
* Fixed startup hydration so a new blank project cannot autosave before IndexedDB restoration completes.
* Added versioned portable JSON backup and restore. API keys and original binary documents remain excluded.
* Added local eval metrics derived from validation and human correction state.
* Added React review workspace, Vitest, dependency-free domain tests, TypeScript typecheck, production build verification, and Playwright Chromium smoke tests.
* Deployed the public V0.1 build through Cloudflare Workers + Static Assets at `https://flowextract.edwardxie421.workers.dev`.
* Completed a real production Qwen China (Beijing) smoke test with a fictional invoice: extraction, structured output, validation, human correction, revalidation, JSON/CSV/XLSX export, IndexedDB reload, and Backup/Restore all passed. The API key was not persisted or included in the backup.

中文：

* 建立 V0.1 SPEC 和模块化 Local First 架构。
* 建立浏览器端 PDF.js 文本提取，以及扫描件和图片的 Tesseract.js OCR fallback。
* 建立 String、Number、Date、Boolean Schema，以及 Required、Regex、Minimum、Maximum、严格 ISO 日期、Malformed Output、Unknown Fields 验证。
* 建立与 Provider 无关的 Extraction 编排，并接入 OpenAI、Anthropic、Gemini、Qwen BYOK Adapter。
* 建立 Qwen 中国大陆（北京）、新加坡、中国香港显式地域路由，禁止自动跨地域 fallback。
* 建立 Provider Verification Metadata。Qwen 在 V0.1 中为 Live Verified；OpenAI、Anthropic、Gemini 在各自真实 API Smoke Test 完成前保持 Experimental。
* 2026-09-19 根据官方文档重新核对 V0.1 默认模型 ID：`gpt-5.6-luna`、`claude-sonnet-5`、`gemini-3.8-flash`、`qwen3.8-max`。
* AI Prediction 生成后立即执行本地确定性 Validation，人工修订后基于 Final Value 重新 Validation。
* 建立 Human-in-the-Loop Review，保留 AI Prediction、Final Value、Correction、Validation、Provider、Model、Region 和处理时间。
* JSON、CSV、XLSX 均使用 Final Value 导出。
* 建立 IndexedDB 自动保存，并在启动时恢复最近更新项目。
* 修复启动 Hydration 竞态，避免 IndexedDB 恢复完成前保存空白新项目。
* 建立版本化 Project Backup / Restore；API Key 和原始二进制文档均不进入备份。
* 建立基于 Validation 和 Human Correction 的本地 Evals。
* 建立 React Review 工作区、无依赖 Domain Tests、Vitest、TypeScript Typecheck、Production Build 和 Playwright Chromium Smoke。
* 公共 V0.1 使用 Cloudflare Workers + Static Assets 部署：`https://flowextract.edwardxie421.workers.dev`。
* 已使用虚构 Invoice 在生产环境完成 Qwen 中国大陆（北京）真实 Smoke Test：Extraction、Structured Output、Validation、Human Correction、Revalidation、JSON/CSV/XLSX、IndexedDB Reload、Backup/Restore 全部通过；API Key 未持久化，也未进入 Backup。

### Verification / 验证

The final release gate requires and has automated coverage for:

1. Dependency-free domain tests.
2. Reproducible dependency install with `npm ci`.
3. Vitest suite.
4. TypeScript project typecheck.
5. Vite production build.
6. Playwright Chromium smoke test.
7. Cloudflare Workers production build.

The production BYOK smoke test is manual by design because FlowExtract does not persist provider credentials in the repository, CI, IndexedDB, or backup files.

最终发布门禁包含无依赖 Domain Tests、`npm ci`、Vitest、TypeScript Typecheck、Vite Production Build、Playwright Chromium Smoke 和 Cloudflare Workers Production Build。真实 BYOK Smoke Test 保持人工执行，因为 FlowExtract 不在仓库、CI、IndexedDB 或 Backup 中保存 Provider 凭据。

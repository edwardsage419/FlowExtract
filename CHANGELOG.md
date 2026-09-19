# Changelog / 更新记录

## V0.1.2 — Unreleased

English:

* Added Assisted AI Chat: one click copies the generated extraction prompt and opens the selected AI chat page.
* Added user-triggered clipboard import that immediately runs the existing parse, Validation, and Review flow.
* Kept manual response paste as a fallback when clipboard permissions are unavailable or blocked.
* Clipboard access occurs only after an explicit user action. FlowExtract does not monitor clipboard content in the background.
* Added no AI-page DOM automation, cookie or session access, scraping, backend service, or new dependency.

中文：

* 增加 Assisted AI Chat：一次点击复制生成的 Extraction Prompt，并打开用户选择的 AI Chat 页面。
* 增加用户主动触发的 Clipboard Import，读取后立即进入现有 Parse、Validation 和 Review 流程。
* Clipboard 权限不可用或被阻止时，继续保留手工粘贴 Response 的兜底路径。
* Clipboard 只在用户明确点击时读取或写入，FlowExtract 不会在后台监听剪贴板。
* 不增加 AI 页面 DOM 自动化、Cookie 或 Session 读取、网页抓取、Backend 或新依赖。

## V0.1.1 — 2026-09-19

English:

* Added selectable AI Chat and API extraction modes.
* Added local prompt generation for manual ChatGPT, Claude, Gemini, Qwen, and other AI chat workflows.
* Added manual JSON import with malformed output handling, unknown-field checks, and the existing deterministic field validation.
* Added manual extraction provenance without storing the raw pasted chat response.
* Kept the existing BYOK API flow and provider region controls unchanged.
* Added a production Playwright release gate against the live `workers.dev` deployment covering V0.1.1 version detection, manual AI Chat import, validation, human correction, Final Value JSON export, and API mode regression.
* Production smoke Run #53 passed on commit `f262f255ea7b38141197d6c7263f381678e112c5`.

中文：

* 增加可选择的 AI Chat 与 API 两种 Extraction 模式。
* 增加适用于 ChatGPT、Claude、Gemini、Qwen 和其他 AI Chat 的本地 Prompt 生成。
* 增加手工 JSON 导入，并继续使用现有 Malformed Output、Unknown Fields 和字段 Validation。
* 增加 Manual Extraction Provenance，原始粘贴 Chat Response 不写入持久化项目数据。
* 保持现有 BYOK API 流程和 Provider Region 控制不变。
* 增加针对真实 `workers.dev` 部署的 Production Playwright Release Gate，覆盖 V0.1.1 版本检测、Manual AI Chat 导入、Validation、人工 Correction、Final Value JSON Export 和 API 模式回归。
* Production Smoke Run #53 已在提交 `f262f255ea7b38141197d6c7263f381678e112c5` 上通过。

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

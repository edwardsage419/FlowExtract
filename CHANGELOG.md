# Changelog / 更新记录

## V0.1.0 Release Candidate

English:

* Added V0.1 specification and modular local first architecture.
* Added schema builder domain and JSON Schema generation.
* Added deterministic validation for required, type, regex, numeric range, strict ISO calendar dates, boolean rules, and unexpected output fields.
* Added BYOK adapters for OpenAI, Anthropic, and Gemini, including OpenAI `store: false` and Gemini `responseJsonSchema`.
* Added PDF.js text extraction and Tesseract.js local OCR fallback.
* Added human correction state, provenance fields, and local eval metrics.
* Added IndexedDB project storage and portable project backup and restore.
* Added JSON, CSV, and XLSX export.
* Added React review workspace and Cloudflare Pages deployment configuration.
* Added dependency free domain, Vitest, persistence, component, TypeScript, production build, and Playwright smoke verification.

中文：

* 建立 V0.1 SPEC 和模块化 Local First 架构。
* 建立 Schema 域模型和 JSON Schema 生成。
* 建立 Required、类型、正则、数字范围、严格 ISO 日期、布尔值和未知输出字段确定性验证。
* 建立 OpenAI、Anthropic、Gemini BYOK 适配器，包括 OpenAI `store: false` 和 Gemini `responseJsonSchema`。
* 建立 PDF.js 文本提取和 Tesseract.js 本地 OCR fallback。
* 建立人工修订状态、provenance 字段和本地 Evals。
* 建立 IndexedDB 项目存储与便携备份恢复。
* 建立 JSON、CSV、XLSX 导出。
* 建立 React Review 工作区和 Cloudflare Pages 部署配置。
* 建立无依赖核心域、Vitest、持久化、组件、TypeScript、生产构建和 Playwright smoke 验证。

### Verification / 验证

GitHub Actions now performs the full V0.1 release gate on Node.js 22:

1. Dependency free domain tests.
2. Reproducible dependency install with `npm ci`.
3. Vitest suite.
4. TypeScript project typecheck.
5. Vite production build.
6. Playwright Chromium smoke test.

The full gate passed on the public `main` branch during release preparation on September 18, 2026.

GitHub Actions 现在使用 Node.js 22 执行完整 V0.1 发布门禁，包括核心域测试、`npm ci`、Vitest、TypeScript 类型检查、Vite 生产构建和 Playwright Chromium smoke。2026 年 9 月 18 日公开仓库 `main` 分支已通过完整流程。

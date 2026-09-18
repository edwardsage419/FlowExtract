# Changelog / 更新记录

## Unreleased V0.1

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
* Added unit, dependency free domain, persistence, component, and Playwright smoke tests.

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
* 建立核心域、持久化、组件和 Playwright smoke 测试。

### Verification note / 验证说明

The current execution environment cannot resolve `registry.npmjs.org`, so npm dependencies, Vitest, Playwright, TypeScript project build, and Vite production build have not yet been executed here. Dependency free Node 22 domain tests are executed separately. This limitation must be cleared before tagging V0.1.

当前执行环境无法解析 `registry.npmjs.org`，因此这里暂时无法安装 npm 依赖，也无法执行 Vitest、Playwright、完整 TypeScript 项目构建和 Vite 生产构建。无依赖的 Node 22 核心域测试已经单独执行。正式打 V0.1 Tag 前必须清除这一验证缺口。

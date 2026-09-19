# Contributing / 贡献指南

FlowExtract V0.1 prioritizes the smallest reliable local first document extraction loop. Keep changes focused on document ingestion, schema, provider abstraction, validation, review, persistence, export, testing, privacy, and reliability. Avoid adding accounts, billing, cloud storage, collaboration, RAG, or unrelated integrations without a separate product decision.

FlowExtract V0.1 优先保证最小可靠的 Local First 文档提取闭环。提交内容应集中在文档输入、Schema、Provider 抽象、Validation、Review、本地持久化、Export、测试、隐私和可靠性。账号、支付、云存储、协作、RAG 和其他外围集成需要单独的产品决策，不应直接扩大 V0.1 范围。

## Development / 开发

Use Node.js 22 or newer. Use `npm ci` when reproducing CI or validating a release candidate.

```bash
npm install
npm run test:domain
npm run test:run
npm run typecheck
npm run build
npm run test:e2e
```

Before merging a release-bound change, the GitHub CI gate must pass Domain Tests, dependency installation, Vitest, TypeScript typecheck, production build, and Chromium smoke. Main also runs the live `workers.dev` production smoke.

使用 Node.js 22 或更高版本。复现 CI 或验证 Release Candidate 时使用 `npm ci`。进入 Release 的修改必须通过 Domain Tests、依赖安装、Vitest、TypeScript Typecheck、Production Build 和 Chromium Smoke；main 还会执行真实 `workers.dev` Production Smoke。

Add tests before implementation changes. Keep provider specific behavior inside `src/features/providers`. Never commit API keys, real sensitive documents, or production customer data.

实现新功能或修复前先增加测试。Provider 特有逻辑必须留在 `src/features/providers`。严禁提交 API Key、真实敏感文档或生产客户数据。

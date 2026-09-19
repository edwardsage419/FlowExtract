# FlowExtract

Local First 的 AI 辅助文档数据提取、验证与人工复核工具。

[English](README.md)

## 试用 FlowExtract 与反馈

在线版本：https://flowextract.edwardxie421.workers.dev

如果你正在使用真实文档测试 FlowExtract，请通过 [GitHub Issues](https://github.com/edwardsage419/FlowExtract/issues/new/choose) 提交 Bug 或真实使用反馈。

请勿在公开 Issue 中提交 API Key、凭据、完整 Provider Response 或敏感文档正文。如需提供复现文件，请使用公开、虚构或已脱敏的示例。

FlowExtract 是一个开源浏览器应用，用于把 PDF 和文档图片转换成可以人工复核的结构化数据。当前 V0.1.x 继续控制范围：上传文档，定义 Schema，通过 AI Chat 或自己的 AI Provider API Key 完成初始提取，在本地执行确定性验证，只修正可疑字段，然后导出 JSON、CSV 或 XLSX。

## V0.1 工作流

`Document -> Extract -> Validate -> Review -> Export`

### Extraction 模式

FlowExtract 提供两种提取方式，两条路径最终都进入同一套 Validation、Review、Final Value、Export 和本地 Evals：

* **AI Chat**：在本地生成包含当前文档和 Schema 的 Prompt，由用户自行复制到 ChatGPT、Claude、Gemini、Qwen 或其他 AI Chat，再把 JSON 结果粘贴回 FlowExtract。无需 API Key。FlowExtract 不会自动操作或读取用户的 AI Chat 会话。
* **API**：保留现有自动化 BYOK 流程，支持 OpenAI、Anthropic、Gemini、Qwen。Provider 可能消耗 API 配额或产生费用。

Manual AI Chat 导入后仍会保留 AI Prediction，并把用户选择的 Chat Service 记录为 Provenance。用户粘贴的原始 Chat Response 只在当前页面编辑状态中存在，不写入 Project Record。

Review 是产品重点。AI 先给出预测，确定性 Validation Rules 检查缺失值、格式错误和范围异常，用户同时查看来源文本、AI prediction 和 final value，只处理需要人工介入的字段。

## 当前 V0.1 范围

输入目标：

* 普通数字 PDF，使用 PDF.js 在浏览器中提取文本
* 扫描 PDF，对低文本页面自动使用本地 OCR
* PNG
* JPG 和 JPEG

Schema 支持 `string`、`number`、`date`、`boolean`，并支持 Required、正则格式、数字最小值和最大值。

BYOK Provider 已建立 OpenAI、Anthropic、Gemini、Qwen（阿里云百炼 / Model Studio）适配器。模型名称可以直接编辑，避免 Provider 更新模型后必须重新发布 FlowExtract。Qwen 已在 V0.1 中使用阿里云百炼中国大陆（北京）地域完成真实 API 端到端验证。OpenAI、Anthropic、Gemini 仍标记为 Experimental：适配器和 Contract Tests 已具备，但本次 Release 尚未完成真实 API Smoke Test。

导出支持 JSON、CSV、XLSX。项目数据保存在 IndexedDB，同时提供可移植 JSON 项目备份和恢复。

## 隐私模型

V0.1 没有 FlowExtract 应用后端。

文档在浏览器本地解析。OCR 使用 Tesseract.js 在本地执行。AI Chat 模式在本地生成 Prompt，由用户自行决定何时、向哪个 AI Chat 粘贴。API 模式由浏览器把解析后的文档文本直接发送给用户选择的 AI Provider。两种方式都不经过 FlowExtract 自己的服务器。

API Key 只保存在当前页面的 React 内存状态中，不写入 IndexedDB、项目备份、源代码或日志。刷新页面后 Key 会消失。

项目备份包含解析文本、Schema、AI 提取结果、验证状态和人工修改，不包含原始二进制文档和 API Key。

需要注意，BYOK 浏览器直连意味着浏览器会直接与第三方 AI API 通信。处理敏感文档前，应先确认所选 Provider 的隐私、数据保留、计费和 API Key 政策。

## 技术架构

应用是 React、TypeScript、Vite 构建的纯静态 SPA。

```text
src/features/
  documents/     文件检查、PDF.js 解析、本地 OCR
  schema/        字段定义和 JSON Schema
  providers/     OpenAI、Anthropic、Gemini、Qwen 适配器
  extraction/    与 Provider 无关的提取编排
  validation/    本地确定性验证
  review/        人工修改状态
  persistence/   IndexedDB 和项目备份
  export/        JSON、CSV、XLSX
  evals/         本地质量指标
```

Provider 相关代码与 Validation、Review、Persistence、Export 分离。

## 本地开发

要求 Node.js 22 或更高版本以及 npm。

```bash
npm install
npm run dev
```

完整验证：

```bash
npm run test:domain
npm run test:run
npm run typecheck
npm run build
npm run test:e2e
```

`npm run test:domain` 使用 Node 22 执行无依赖核心域测试，在 npm 依赖暂时无法安装时仍可运行。

## Cloudflare Workers 免费部署

FlowExtract 不需要应用后端。V0.1 公共环境实际使用 Cloudflare Workers + Static Assets，并通过 Git 集成自动部署。

```text
Production branch: main
Build command: npm run build
Deploy command: npx wrangler deploy
Static assets: ./dist
Node version: 22
```

生产地址：`https://flowextract.edwardxie421.workers.dev`

仓库中的 `wrangler.jsonc` 把 `./dist` 配置为 SPA 静态资源。V0.1 继续使用免费的 `workers.dev` 地址，不增加付费域名、数据库、服务端 AI 代理或 FlowExtract 自己承担费用的 AI 账户。

## Provider 说明

UI 中的默认模型名称只是便利默认值，用户可以修改。V0.1 默认模型 ID 已于 2026-09-19 根据各 Provider 官方文档重新核对：`gpt-5.6-luna`、`claude-sonnet-5`、`gemini-3.8-flash`、`qwen3.8-max`。

OpenAI 使用 Responses API 的结构化 JSON 输出，并显式发送 `store: false`。Anthropic 使用 Messages API 和 structured output，并在浏览器适配器中加入其浏览器直连 Header。Gemini 使用 `generateContent` 和 `responseJsonSchema`。Qwen 使用阿里云 Model Studio 的 OpenAI-compatible Chat Completions 和严格 JSON Schema 输出。Qwen Region 必须由用户明确选择；某个地域失败时，FlowExtract 不会把文档自动重试到其他地域。

浏览器 BYOK 是 V0.1 在零后端约束下采用的明确取舍。API Key 不会嵌入应用，也会在刷新页面后清除，但输入期间页面运行时仍可以访问该 Key。OpenAI 和 Google 的官方安全说明都建议生产环境的长期 API Key 放在服务端。V0.1 测试应使用独立 Provider Key，并尽量限制权限、额度和消费上限。后续可增加由用户自己运行的本地 companion，或在 Provider 支持时采用短期授权。

Provider API 会变化，每次 Release 前都需要重新核对官方文档。模型 ID 有效并不等于 FlowExtract 已完成该 Provider 的真实 API Smoke Test。

## V0.1 已知限制

* OCR 效果受扫描质量和语言数据影响。Tesseract 语言资源首次使用时可能需要联网下载，但文档像素仍在浏览器 OCR 路径中处理。
* 暂未实现字段级 bounding box provenance。当前记录文档、页面文本、Provider、Model、Prediction、Correction、Validation 和时间戳。
* 大型 PDF 在浏览器内存中处理，低内存设备可能较慢。
* 原始二进制文档不持久化到 IndexedDB。刷新后解析文本仍可恢复，原文件预览需要重新选择文件。
* BYOK 浏览器直连依赖各 Provider 持续允许浏览器请求，同时取决于用户自己的 Provider 账户配置。

## 许可证

MIT


## 部署与发布文档

* `docs/deployment-cloudflare-workers.md`
* `docs/release-v0.1.md`

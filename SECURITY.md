# Security / 安全

## Reporting / 报告方式

Do not open a public issue containing API keys, private documents, credentials, or exploitable sensitive details. For the first public release, use GitHub's private security advisory feature when available.

不要在公开 Issue 中提交 API Key、私人文档、凭据或可直接利用的敏感细节。公开发布后优先使用 GitHub Private Security Advisory。

## V0.1 trust boundary / V0.1 信任边界

FlowExtract has no application backend. Documents are parsed locally. Parsed text is sent directly to the user's selected AI provider only when the user starts extraction. For Qwen, the user explicitly selects the provider region and FlowExtract never automatically retries the same document in another region after failure. API keys remain in volatile browser state and must never enter IndexedDB, backups, logs, fixtures, screenshots, or repository files.

FlowExtract 没有应用后端。文档在本地解析。只有用户主动执行提取时，解析后的文本才会直接发送给用户选择的 AI Provider。Qwen 地域由用户明确选择，FlowExtract 不会在请求失败后自动把同一文档重试到其他地域。API Key 只能存在于浏览器临时状态，禁止进入 IndexedDB、备份、日志、测试 fixtures、截图和仓库文件。

## Logging / 日志

Production code should avoid logging document text, provider responses that may contain document content, and authorization headers.

生产代码应避免记录文档文本、可能包含文档信息的 Provider 响应以及认证 Header。

## Manual AI Chat trust boundary / Manual AI Chat 信任边界

AI Chat mode generates the extraction prompt entirely in the browser. FlowExtract does not open authenticated sessions, read cookies, automate third-party chat interfaces, or submit the prompt on the user's behalf. The user decides whether to copy the prompt and paste it into an external AI service. The generated prompt contains parsed document content, so the selected AI service's privacy and data-retention policies apply after the user pastes it there. The raw pasted chat response remains transient UI state; the project persists only parsed extraction data, validation, corrections, and manual service provenance.

AI Chat 模式完全在浏览器中生成 Extraction Prompt。FlowExtract 不读取 Cookie、不接管登录 Session、不自动操作第三方聊天页面，也不代替用户发送 Prompt。用户自行决定是否复制 Prompt 并粘贴到外部 AI 服务。Prompt 包含解析后的文档内容，因此用户粘贴后应遵循对应 AI 服务的隐私和数据保留政策。原始粘贴 Chat Response 只作为临时 UI 状态存在，项目只持久化解析后的 Extraction 数据、Validation、Correction 和 Manual Service Provenance。

## Browser BYOK threat model / 浏览器 BYOK 威胁模型

V0.1 accepts a provider key at runtime because the project has no FlowExtract backend. The key is never committed or persisted, but any secret present in a browser page is accessible to that page runtime. OpenAI and Google recommend server-side handling for long-lived production keys. Use a dedicated low-limit key for V0.1 testing and revoke it if exposure is suspected.

V0.1 在运行时接收用户自己的 Provider Key，因为项目没有 FlowExtract 后端。Key 不会提交到仓库，也不会持久化，但浏览器页面中的秘密在输入期间仍可被页面运行时访问。OpenAI 和 Google 都建议长期生产 Key 使用服务端保管。V0.1 测试应使用独立、低额度的 Key，如怀疑泄露应立即撤销。

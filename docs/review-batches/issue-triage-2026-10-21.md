# 2026-10-21 新连接器评估进度

本记录由 Codex 在维护者授权下整理，不冒充具名人工批准；以下候选尚未上架。

## #38 Vostride 公开文档 MCP

- 官方文档：https://vostride.com/docs/agent-qa/mcp#public-documentation-mcp
- 端点：https://vostride.com/mcp ，免鉴权 Streamable HTTP。
- 独立运行时间：2026-10-21T03:04:20.051Z。
- 执行者：Codex；客户端：仓库 `run-runtime-acceptance.mjs` / `dsh-registry-runtime-acceptance` 1.0.0。
- initialize：`vostride-docs` 1.2.0，协议 2025-06-18。
- tools/list：4 个工具。旧申请中的 3 个工具及官网列表不能作为固定实时数量。
- 仅调用 `read_agent_qa_page({"path":"/docs/agent-qa/mcp"})`；只读注解通过检查，工具返回成功，凭据扫描通过。
- 响应 SHA-256：`eb7a84c1dc60072cc6cb5aa17ce2543f20ae1922f1acac73a56400f4da86e4e5`。
- 未保存原始返回、会话标识或凭据；未执行本地 QA 测试，未读取用户仓库，未注册或购买服务。

这是协议与单次只读调用烟测，不是 DSH Desktop UI 验收，也不证明所有工具都只读。
正式收录仍需：核对完整实时工具范围与服务条款（不能用源码许可证替代托管服务条款）、
建立候选记录和中文卡片、确认本地 QA 执行能力不被混入卡片、具名维护者批准及 CI。
建议卡片名称为「Vostride · Agent QA 文档」，分类「开发工具」，示例只搜索/阅读公开文档。

## #50 Firefox DevTools

官方来源：https://github.com/mozilla/firefox-devtools-mcp

优先评估本地 stdio；官方要求 Node.js >=20.19.0 和本地 Firefox 100+。
使用独立浏览器配置，不接入日常 Cookie/登录会话；优先评估 `--tool-preset slim`，
不默认启用脚本、特权上下文或任意路径写入。免 API Key 不意味着无本机权限。
下一步为固定官方包版本、核验许可证/参数与隔离方式，然后在独立环境对 example.com
完成工具发现和读取验收。当前未安装或运行该包，不能声明 DSH 已兼容。

## #35 Hyperconsciousness

官方来源：https://github.com/louis030195/hyperconsciousness

本地存储、设备身份和限时 grant 不等于匿名 Hosted MCP。
需要重新核对最新分发方式及 stdio 参数，设计用户自填的命令路径/存储路径/grant，
不能把维护者本机路径、真实 grant 或密钥提交到 Registry。
只用隔离的合成数据与只读 grant 验收；grant 不提供 OS 进程沙箱，返回给模型的明文需披露。
当前未执行安装、创建存储或授权操作，暂保留为 P2 适配设计。

## 既有 PR

截至本次复核，#44 / #49 / #46 head 与 2026-10-20 审核相同，均仍需修改。
不重复发出相同整改要求，不调用写入、预订、支付或付费截图工具。
CI 批准只是允许运行检查，不表示验收或合并批准。

# Exa 网络搜索 MCP：OAuth 运行验收（提交者执行，待维护者复核）

> 历史报告：本报告不再作为当前匿名卡片的上架依据，也不代表维护者接受 OAuth 或计费 Agent。现行范围和新验收见 [2026-10-17 匿名验收](../exa-2026-10-17/exa-search.md)。原始报告保留仅供追溯。

验收日期：2026-10-14。执行人：`SunshineR04`（贡献者）。候选描述：`connectors/exa-search.json`。

> 本报告由提交者在自己的 Exa 账户上执行，用于给维护者提供可复核的原始材料；按本仓库流程，
> `candidates/records/exa-search.json` 的 `review.decision` 等人工批准字段仍由维护者填写。
> 报告中不含账号、邮箱、Client ID、Token、Cookie 或授权 URL 参数。

## 公开来源与协议预检

- Official MCP Registry 的 [`ai.exa/exa` 3.4.1](https://registry.modelcontextprotocol.io/v0.1/servers/ai.exa%2Fexa/versions/3.4.1) 状态为 `active`（published/updated `2026-09-23T00:29:56.602357Z`），远程传输为 `streamable-http`，端点为 `https://mcp.exa.ai/mcp`，仓库为 `exa-labs/exa-mcp-server`。
- 厂商官方文档 [Exa MCP](https://exa.ai/docs/get-started/exa-mcp) 公布同一端点与工具清单，并说明 `tools` URL 参数是**精确替换**语义（显式列表会覆盖默认工具，需把想要的工具全部列出）。
- 无凭据 `initialize` 返回预期的 HTTP 401 OAuth challenge；Protected Resource Metadata 与 Authorization Server Metadata 均可读取。授权服务器 `https://auth.exa.ai` 公开 `authorization` / `token` / `registration` / `revocation` 四个端点，动态客户端注册签发 **public client（`none`）**，支持 PKCE `S256`，`scope` 为 `mcp:tools`。
- 许可：官方仓库 `LICENSE` 为 MIT（Copyright (c) 2025 Exa Labs）；托管服务的使用受[服务条款](https://exa.ai/terms)约束。

## 工具面（`?tools=` 为精确替换，实测）

| 调用 URL | 无凭据 `tools/list` | 持有凭据 `tools/list` |
| --- | --- | --- |
| `https://mcp.exa.ai/mcp` | 2 个：`web_search_exa`、`web_fetch_exa` | 3 个：上述 + `agent_run` |
| 卡片采用的 `?tools=web_search_exa,web_fetch_exa,web_search_advanced_exa,agent_run` | `initialize` 401（列表含需授权的 `agent_run`） | **4 个工具全部可见** |

`agent_run` 属计量能力，必须带凭据；这也是把 `agent_run` 放进卡片 tool 列表后匿名探测得到
HTTP 401 的原因（探测仍判 `pass`，因为 OAuth 面全部可发现）。卡片未包含任何凭据。

## DSH OAuth 与工具发现

- 在 DSH Desktop（内置浏览器、同源运行环境）通过描述卡片安装连接器，授权流程完成 DCR + PKCE。
- 脱敏核验结果：issuer 为 `https://auth.exa.ai`，`token_endpoint_auth_method` 为 `none`，scope 为
  `mcp:tools`，授权资源为 `https://mcp.exa.ai/mcp`；Access Token 与 Refresh Token 均存在，Access Token 有效期约 60 分钟。
- `initialize` 与 `tools/list` 成功，协议会话发现 1 个 Server、4 个工具；`serverInfo` 报告
  `exa-search-server 3.4.2`（Official Registry 条目此时仍为 3.4.1）。
- 执行了一次只读调用 `web_search_exa`（2 条结果），返回厂商文档页面内容，未做任何写入或破坏性操作。

### 卡片声明的 OAuth 资源标识

卡片的 `servers[0].url` 带 `?tools=` 查询串，因此显式声明了
`oauthResource: https://mcp.exa.ai/mcp`，让 OAuth 的 `resource` 参数与调用 URL 解耦。
该字段自 `dsh-mcp-connector 0.2.71` 起受支持（`servers[].oauthResource` 在 HTTP OAuth 连接器上被保留）；
使用旧版本插件时该字段会被忽略，授权记录会退化为带查询串的 URL。

## 计量、配额与安全边界

- `web_search_exa` / `web_fetch_exa` / `web_search_advanced_exa` 可按账户套餐使用；`agent_run` 为多步调研，按用量计费。
- 卡片不含 Token、API Key、Cookie 或带值的鉴权 Header；真实凭据只保存在用户 DSH 本机。
- 本报告与候选记录均未记录任何账号标识、邮箱、Client ID、Token 或授权 URL 参数。

## 未覆盖事项（留给维护者复核）

- 未执行计量的 `agent_run`；其结构化输出与 Connect 数据源行为未在本报告中验证。
- 未对不同套餐下的配额上限与限流做对照测试。
- 未在 0.2.71 之前的插件版本上验证 `oauthResource` 被忽略时的刷新行为（该退化路径的差异见上游说明）。

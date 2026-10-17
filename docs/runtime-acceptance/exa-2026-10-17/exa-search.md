# Exa 匿名基础搜索验收

执行时间：2026-10-17T03:27:35.752Z。执行者：Codex 自动化协议级验收，非人工批准。

## 上架范围

维护者要求不引入任务付费能力，因此移除 OAuth 配置、oauthResource、agent_run 及预算示例。旧贡献者 OAuth 报告不再作为当前卡片的验收依据。

端点：https://mcp.exa.ai/mcp?tools=web_search_exa,web_fetch_exa,web_search_advanced_exa

仅发送 Content-Type、Accept 和 MCP 协议/会话头；没有 Authorization、x-api-key、Cookie 或登录流程。

官方说明：https://exa.ai/docs/get-started/exa-mcp

Keyless 为免费限流使用，不代表永久免费或无限量。显式 tools 参数限制本次工具范围；遇到限流应等待后重试，不得自动登录或切换至付费 Agent。开源许可不等于托管服务永久免费。

## 实际观测

- initialize：HTTP 200，protocolVersion=2025-03-26，serverInfo.name=exa-search-server，version=3.5.0。
- tools/list：HTTP 200，恰好 web_search_exa、web_search_advanced_exa、web_fetch_exa 三项。
- 三个工具均标注 readOnlyHint=true、destructiveHint=false；列表不含 agent_run。
- tools/call web_search_exa：HTTP 200，JSON-RPC result 非错误，返回一条官方文档结果。

实际搜索参数：

```json
{
  "query": "Exa official documentation describing the Exa MCP server and anonymous keyless usage",
  "objective": "Find official Exa MCP documentation; only public documentation, no account or paid agent usage.",
  "numResults": 1
}
```

返回结果标题为 Exa MCP - Exa，URL 为 https://exa.ai/docs/get-started/exa-mcp；原始结果确认 Keyless 无需登录或 API Key、免费但限流。为避免复制大段第三方内容，只记录结果标题、URL 与结论。

## 验收边界

本次通过的是匿名协议握手、工具发现和一次基础搜索。不声称已验证 DSH UI、长期稳定性、限流恢复、网页抓取或高级检索实际调用。没有运行研究 Agent、提交付款、连接计费账户或读取用户私有数据。

Registry 源记录版本 3.4.1 保留其原始来源日期；本次实际服务端版本为 3.5.0，两者不混同。

review.decision 保持 pending；人工批准须由维护者审阅后填写。服务端未来可能调整工具或免费策略，届时须复核，不能以本次验收作永久保证。

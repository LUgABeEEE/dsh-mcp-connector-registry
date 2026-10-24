# DataSinking #49 / Vostride #38 条款复核

本次只读取公开文档及已有验收记录；没有注册账号、购买套餐或重新调用业务工具。
没有新供应商回复时不重复发送同样的修改要求。两项都不能标记为审核通过。

## DataSinking

- PR head 仍为 `3f36ae6d765e1bcf12945f516e6970e16ac88dd9`。
- <https://datasink.ing/terms> 第 3 节仍要求 API Key；第 5 节有免费计划限额，
  不能据此推出匿名 MCP 已获许可。
- <https://datasink.ing/pricing> 区分按 Key 的免费限额与访客共享池；这是有用信息，
  但没有明确说明当前匿名 MCP 的适用授权和限额，不能将网页访客等同匿名 API 用户。
- <https://datasink.ing/docs> 的 MCP 配置仍使用 Key，明确支持 Authorization Bearer；
  不推荐将真实 Key 放进 URL、Prompt、提交或评论。
- 最小收口路径：供应商给出官方匿名 MCP 使用范围/限额说明；或确认改为 Bearer 卡片，
  用获授权账号做最小真实验收。现有匿名章节读取证据不能替代 Key 路径验收。
- 此前 CI 已运行，缺候选档案的问题已修复；剩余条款、最终选定与人工批准门禁仍在。

## Vostride

- <https://vostride.com/docs/agent-qa/mcp> 明确区分免鉴权公开文档 MCP 与本地执行服务。
  公共文档不能替用户执行 QA 或读取仓库。
- 2026-10-24 对 <https://vostride.com/terms> 的请求得到 HTTP 404。
  只表示该路径不可用，不证明没有其他服务条款。
- 文档及历史现场工具范围不同，仍需核对完整工具列表；卡片继续不写固定数量。
- 既有隐私页和源码许可证不替代托管服务使用、费用或限额规则。
- 最小收口路径：供应商提供适用官方规则链接，核对完整工具范围后再完成 Desktop
  回归与具名批准。现有 `published=false` 文档草案保持未发布。

这些缺口需要供应商事实说明或实际宿主环境，不应通过调整分数、填写虚构 reviewer
或只重跑相同 CI 消除。

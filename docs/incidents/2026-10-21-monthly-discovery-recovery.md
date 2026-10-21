# 月度发现报告恢复与防回归

## 已确认原因

Issue #19 的 2026-09-01 快照没有更新，是因为 2026-10-01 的月度运行
[36849087021](https://github.com/duhu2000/dsh-mcp-connector-registry/actions/runs/36849087021)
在读取 Official MCP Registry 时超时：第 1 页成功，后续请求重试 3 次仍失败。
同日每日运行 36840558255 也遇到上游超时。这不是候选自动上架失败。

主分支之后已增加超时、重试和部分结果保存。2026-10-21 另行触发当前主分支的
[月度补跑 39536565827](https://github.com/duhu2000/dsh-mcp-connector-registry/actions/runs/39536565827)。
已核验 Issue #19 于 2026-10-21T03:07:14Z 更新，Source snapshot 为
2026-10-21T03:04:54.484Z，生成 10 个待人工审核候选；这不表示候选已获上架批准。

## 本次保护

- 月度生成器只接受明确 `source.complete: true` 的全量快照，拒绝增量窗口、
  缺失完整性字段、错误时间和缺失候选数组；拒绝发生在写入输出之前。
- `--allow-partial` 仍保留排障产物，但月度工作流遇到不完整快照会明确失败，
  写入运行摘要，而不是跳过更新后显示成功。
- 不完整结果不会覆盖最后一次有效的月度 Issue。不降低候选筛选或人工验收门槛。

## 恢复步骤

1. 查看失败步骤与 `monthly-data-mcp-review-batch` artifact。不要把增量日报作为全量月报输入。
2. 确认上游恢复后，运行 `gh workflow run discovery.yml --ref main -f mode=monthly`。
3. 核验 `monthly` job 成功、报告完整且 Source snapshot 更新；候选不足四项时保留阻塞提示，不能凑数。
4. 核验只更新已有带 marker 的月报 Issue，没有重复建 Issue；候选仍需独立审核与真实运行验收。

Registry 是 `private: true` 的目录仓库；本修复不改变插件运行时，不需要 npm 发版。


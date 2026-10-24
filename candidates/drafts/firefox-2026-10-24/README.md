# Firefox #50 上架准备包

状态：**2026-10-24 用户已明确批准兼容启动方案及限定 macOS 验收范围；正式候选记录与卡片已补齐，等待最终 CI 和条件合并**。
此目录保留历史验收过程，不参与 catalog 构建。正式描述符位于
[`connectors/firefox-devtools.json`](../../../connectors/firefox-devtools.json)，审核记录位于
[`candidates/records/firefox-devtools.json`](../../records/firefox-devtools.json)。

## 已核对来源

- [官方固定版本说明](https://github.com/mozilla/firefox-devtools-mcp/blob/ab64abc8e554f003b52197e4576902ac9bd6dda5/README.md)。
- [MIT 许可证](https://github.com/mozilla/firefox-devtools-mcp/blob/ab64abc8e554f003b52197e4576902ac9bd6dda5/LICENSE-MIT)；也可选择 Apache-2.0。
- [profile 实现](https://github.com/mozilla/firefox-devtools-mcp/blob/ab64abc8e554f003b52197e4576902ac9bd6dda5/src/firefox/profile.ts)与
  [浏览器启动实现](https://github.com/mozilla/firefox-devtools-mcp/blob/ab64abc8e554f003b52197e4576902ac9bd6dda5/src/firefox/core.ts)。
- 固定包 `@mozilla/firefox-devtools-mcp@0.10.6`，不自动升级到 latest。

草案使用 `pages` 而非默认 basic，避免默认包含脚本执行能力。现配置使用固定包及
本仓库维护的兼容启动器，已在 macOS Desktop 验证新建临时 profile。没有硬编码
维护者本机路径，不修改系统 PATH、第三方源码或个人浏览器；此启动器不是 Mozilla
官方代码，须额外人工复核。`--no-auto-profile` 与 `--no-connect-existing` 显式限制复用。

## 已有证据与限制

- [2026-10-22 stdio 脱敏报告](../../../docs/review-batches/firefox-2026-10-22.runtime.json)：
  6 个工具，单次 `get_page_text` 成功；只证明 pages 发现与正文读取。
- [DSH Web UI 历史记录](https://github.com/duhu2000/dsh-mcp-connector-registry/issues/50#issuecomment-6335607886)：
  插件 0.2.76，固定包 0.10.6，Firefox 158.0.1，合成正文 99 字符。
  这是历史评论证据，不是本次重新执行结果，也不是独立 Desktop 结果。
- 2026-10-24 复核时，历史 UI 临时附件目录已不存在；不能重新核验或声称仍保留截图。
  已提交仓库的 stdio 报告仍在。后续证据应放专用持久目录，脱敏后提交摘要。
- 用户随后安装并打开独立 DSH Desktop，已完成一次原生应用回归，见
  [2026-10-24 Desktop 报告](../../../docs/review-batches/firefox-desktop-2026-10-24.json)。
  宿主 0.2.1-rc.2，原生 `dsh-app://app/`；Desktop 插件原为 0.2.62，
  虽清单声明 0.2.76，实际安装及 UI 仍为旧版。正常安装固定 0.2.76 并重启后，
  空白面板恢复，显示 114 张市场卡片。未改 Web profile，原依赖清单未变，锁文件已更新。
- 在全新验收 workspace 中，UI 导入显式专用 profile 配置，发现 6 个 pages 工具。
  首次 `get_page_text({"maxLength":2000})` 原始返回 `Error: Request timed out`；
  驱动初始化后一次相同调用成功，原始输出含合成标记及 `[full content, 127 chars]`。
  失败和成功分别记录，不能将首次启动可靠性记为通过。没有调用其它工具或传 `saveTo`。
  此阶段结束后已从 UI 停用测试连接，并核对 MCP/Geckodriver/Firefox 进程退出。
- 后续默认配置阶段：同一隔离连接在停用状态下改为草案精确的 npx 参数，保留项目范围，
  然后启用。锁屏由用户手动解锁后，原生界面显示已连接；11:33–11:34 的一次
  `navigate_page`（仅本地合成测试页面）原始返回 `Error: Request timed out`，
  未执行后续 `get_page_text`，也未自行重试或访问外部网站。初始化期间观察到
  `geckodriver --version` 子进程，随后未观察到 Firefox 进程；根因尚未确定，
  不能宣称默认 profile 隔离、配置等价性或首次启动可靠性通过。
- 默认配置阶段结束后，已通过 UI 停用临时连接（状态“已停用”、开关为 0），
  03:37:38 UTC 进程核对无测试 MCP/Geckodriver/Firefox 残留；原有连接未修改。

## Desktop 回归清单（均不得预填通过）

1. 记录独立应用名称、版本、DSH profile、插件版本；不能用 localhost Web 页面代替。
2. 为本轮建立专用持久验收目录、全新 Firefox profile、无脚本/无外部资源的合成页面。
   保留当前连接基线，不读取或导出已有凭据，不停用其他连接。
3. 从 Desktop 的连接器 UI 导入固定版本临时 stdio 配置，仅当前验收 workspace 生效。
   记录实际命令、参数与依赖版本；本机路径只留本地。
4. 发现 pages 工具并核对名称、注解；不把全部工具标为只读。
5. 仅调用 `get_page_text({"maxLength":2000})`，不传 `saveTo`；展开原始输入输出，
   核对合成标记、正文非空、响应哈希与凭据扫描，而非只采信模型总结。
6. 核对正式草案的启动参数/profile 行为，必要时补一次等价配置回归；不能把不同配置
   的成功结果直接当作卡片通过。不得连接现有个人浏览器来规避启动问题。
7. 停用本次临时连接，确认测试进程退出、原连接未改动。截图仅含测试界面；
   不上传聊天列表、其他会话、绝对路径或 profile 内容。
8. 补正式 candidate 记录；具名维护者阅读证据后明确批准，最终 head CI 通过再合并。
   合并后另核验 main CI、生成目录和 CDN，不能把合并等同上线。

## npx 修复及最终同参数回归

见 [修复后报告](../../../docs/review-batches/firefox-npx-fix-2026-10-24.json)。上述失败保留为历史证据。

- 根因定位到本机 npm PATH 驱动发现路径：Selenium Manager 0.4.36 在带 npm `.bin`
  的 PATH 下卡住；npm geckodriver 6.0.2 的 CLI 在转发 `--version` 前调用下载逻辑。
  相同离线诊断普通 PATH 下不到 1 秒找到现有驱动；npm PATH 下 20 秒截止仍不返回，
  `SE_SKIP_DRIVER_IN_PATH` 对照也未解决。不把某个网络域名被拦截作为已证明根因。
- [兼容启动器源码](../../../scripts/firefox-npx-bootstrap.cjs)只在当前进程移除含
  geckodriver shim 的 npm `.bin`，然后加载固定官方包，拒绝版本不符和入口逃逸。
  由 `node scripts/build-firefox-draft.mjs` 生成描述符中的 Node 内联参数；测试确保源码
  与参数一致。不依赖 shell、不运行远程脚本，不将 OS sandbox 或完整供应链校验作为承诺。
- 12:18（北京时间）原生 Desktop：使用草案精确参数、about:blank、无 cwd/env 覆盖，
  新进程启动后 `navigate_page` 到本地合成页、`get_page_text({"maxLength":2000})`
  均成功，整轮显示 15 秒；原始输入/输出已展开核对，正文 127 字符，哈希见报告。
  观察到全新 `rust_mozprofile` 临时目录，不是早先显式 profile 或日常用户 profile。
- 已在 UI 停用测试连接，04:21:08 UTC 核对测试进程均退出，原有连接未改动。
- 本次是**已有依赖缓存下的新进程启动**，不是全新机器或空缓存安装；Windows/Linux
  Desktop 未测。首次包/驱动下载仍需要网络，不能宣称全面离线可用或三平台验收通过。

## 批准与正式上架门禁

用户在本会话明确批准：“批准该兼容启动方案，按已说明的 macOS 验收范围继续补齐正式候选记录，
完成最终上架检查；全部通过后合并 PR #54，并核验市场卡片上线。”
[批准转录](https://github.com/duhu2000/dsh-mcp-connector-registry/pull/54#issuecomment-6380255895)
明确标记由 Codex 记录，不冒充独立 GitHub 人工 review。

正式卡片与已验收启动参数的 SHA-256 保持一致。历史报告中的 pending/失败是当时状态，
没有回写为人工批准或删除失败证据。仅将描述符迁入正式目录、更新文案及验收状态；
源码保留历史注释以保持参数字节一致，生成脚本沿用原文件名但改为输出正式描述符。
首次下载、Windows/Linux 仍未验收。最终精确 head CI、冲突及审核反馈检查通过后才合并；
另行检查 main CI、目录/CDN 一致性和 Desktop 市场卡片，不把合并视为上线。

# Firefox #50 上架准备包

状态：**未发布、人工批准 pending、独立 DSH Desktop 验收未完成**。
此目录不参与 catalog 构建；不得直接复制为正式卡片。

## 已核对来源

- [官方固定版本说明](https://github.com/mozilla/firefox-devtools-mcp/blob/ab64abc8e554f003b52197e4576902ac9bd6dda5/README.md)。
- [MIT 许可证](https://github.com/mozilla/firefox-devtools-mcp/blob/ab64abc8e554f003b52197e4576902ac9bd6dda5/LICENSE-MIT)；也可选择 Apache-2.0。
- [profile 实现](https://github.com/mozilla/firefox-devtools-mcp/blob/ab64abc8e554f003b52197e4576902ac9bd6dda5/src/firefox/profile.ts)与
  [浏览器启动实现](https://github.com/mozilla/firefox-devtools-mcp/blob/ab64abc8e554f003b52197e4576902ac9bd6dda5/src/firefox/core.ts)。
- 固定包 `@mozilla/firefox-devtools-mcp@0.10.6`，不自动升级到 latest。

草案使用 `pages` 而非默认 basic，避免默认包含脚本执行能力。尚需验证该共享启动配置
在 Desktop 下使用独立 profile；当前历史通过记录使用的是显式专用 profile，不代表
不带 profile 参数的草案已被验收。正式卡片与最终验收参数必须一致；若需用户配置
本地路径，先验证界面配置路径，不能把维护者本机绝对路径硬编码到目录。

## 已有证据与限制

- [2026-10-22 stdio 脱敏报告](../../../docs/review-batches/firefox-2026-10-22.runtime.json)：
  6 个工具，单次 `get_page_text` 成功；只证明 pages 发现与正文读取。
- [DSH Web UI 历史记录](https://github.com/duhu2000/dsh-mcp-connector-registry/issues/50#issuecomment-6335607886)：
  插件 0.2.76，固定包 0.10.6，Firefox 158.0.1，合成正文 99 字符。
  这是历史评论证据，不是本次重新执行结果，也不是独立 Desktop 结果。
- 2026-10-24 复核时，历史 UI 临时附件目录已不存在；不能重新核验或声称仍保留截图。
  已提交仓库的 stdio 报告仍在。后续证据应放专用持久目录，脱敏后提交摘要。
- 本轮应用清单、系统及用户 Applications 和 Spotlight 查询未定位独立 DSH Desktop。
  只能记录“未定位”，不能断言其他位置没有安装；已请求用户提供应用路径或打开应用。

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

当前不请求上架批准：独立 Desktop 测试和共享配置等价性仍缺失。

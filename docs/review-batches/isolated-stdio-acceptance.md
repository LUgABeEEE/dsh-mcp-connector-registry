# 隔离 stdio 候选验收（#50 / #35）

本文件是可复现验收准备，不是人工批准或 DSH Desktop 验收记录。
所有本地进程均继承操作系统用户权限；独立目录、只读注解和 grant 都不是 OS 沙箱。

## Firefox DevTools（#50）

- 官方来源：<https://github.com/mozilla/firefox-devtools-mcp>。
- 评估源码：`ab64abc8e554f003b52197e4576902ac9bd6dda5`；包固定为
  `@mozilla/firefox-devtools-mcp@0.10.6`，许可证 `MIT OR Apache-2.0`。
- 需要 Node.js >=20.19.0、本地 Firefox；包及 geckodriver 首次准备可能需要联网。
- 将固定包安装到专用目录，禁止使用未固定的 `@latest` 作为验收依据。
  可先使用 `npm install --prefix <测试依赖目录> --ignore-scripts --no-audit --no-fund @mozilla/firefox-devtools-mcp@0.10.6`。
- 执行（路径需替换为操作者自己的绝对路径）：

```sh
node scripts/run-firefox-preflight.mjs \
  --package-root /absolute/test-dependencies/node_modules/@mozilla/firefox-devtools-mcp \
  --firefox-path /absolute/path/to/firefox \
  --output /absolute/test-output/firefox-report.json
```

脚本每次创建全新临时目录，固定 `--headless --tools pages`，只打开脚本在
`127.0.0.1` 随机端口生成的无脚本、无外部资源合成页面，完成后关闭监听。
不使用日常 profile、`--connect-existing`、Android 清数据模式、
特权上下文、证书绕过或任意路径保存。仅调用 `get_page_text({"maxLength":2000})`，
正文必须包含固定的合成标记才通过；没有内容断言的 `isError=false` 不够。
`pages` 模块仍暴露写操作，验收脚本不调用它们；市场卡片不得宣称整个服务只读。

通用 stdio 预检在调用前要求 `readOnlyHint=true` 且 `destructiveHint!=true`。
注解仍需结合源码和参数人工核对，例如 `saveTo` 可以把只读浏览器结果写入文件，
本验收明确不传此参数。报告只保存类型、字符数、哈希与断言状态，不保存原始页面正文。
工具描述、stderr、会话标识也不入报告。临时 profile/log 留在本机，复核后单独清理，
不上传或提交。真实运行通过仍需完成 DSH 配置/UI 回归及具名维护者批准才能上架。

### 2026-10-22 实测记录

执行者为 Codex 自动验收，不代表具名人工批准。macOS，Node.js 25.9.0，
Firefox 158.0.1，官方 MCP 0.10.6；npm 安装禁用生命周期脚本。
包 dist integrity：`sha512-7wy4nSuNd5lR6KO55uS0bLH08B5ZFLX0L4AxsyKIcwLYBpuR7GX4WAm0MNcsUg+yFt/eRcMmud/DivjTPNvVeA==`。

首次对 example.com 的断言失败：站点返回多语言说明而非旧的 `Example Domain`。
诊断只读调用确认非空正文，不把失败运行改写为通过，也不依赖该站点继续测试。
随后独立本机合成页面验收于 **2026-10-22T07:01:15.966Z** 通过：
发现 6 个 pages 工具，仅调用 `get_page_text`，返回文本 95 字符，固定标记匹配，
凭据扫描通过。结果 SHA-256：
`a17f10c2f4140b0982d0aa6e7833dc74f0108683a71f6343ecaa66cb546fba76`。
见 [脱敏运行报告](firefox-2026-10-22.runtime.json)。检查未发现残留测试 MCP/geckodriver 进程。
未操作日常 Firefox，未执行 DSH Desktop UI 回归，未正式上架。

## Hyperconsciousness（#35）


- 官方来源：<https://github.com/louis030195/hyperconsciousness>。
- 核对源码：`50a3144309785085e4e704c9f16c2132a6fbf408`。
- 贡献者说明：<https://github.com/duhu2000/dsh-mcp-connector-registry/issues/35#issuecomment-6307388104>。
- 当前为 Rust 源码分发路径：在专用 checkout 固定上述 SHA 后执行
  `cargo build --release --locked`；不伪装为 npm 包，不执行会自动更新的安装脚本。
- 当前本机未配置 Rust/Cargo；本轮只准备流程，不宣称已构建或已验收。

后续获准配置环境后，使用全新 `hc-demo`，仅录入合成的 demo note。
按官方 `hc start --dir`、`hc write --tags demo --sensitivity normal --dir`、
`hc id --dir` 流程准备，再用 `hc grant <device> --kinds note --tags demo
--sensitivity normal --days 1 --dir <store>` 创建限时只读 grant（不加 `--write`）。
grant、存储路径和设备标识仅留本机，不贴到 Issue/PR，不使用真实知识库。

DSH 本地配置结构（**占位示例，不能直接上架或运行**）：

```json
{
  "mcpServers": {
    "hyperconsciousness-demo": {
      "type": "stdio",
      "command": "/absolute/build/target/release/hc",
      "args": ["mcp", "--as", "<LOCAL_READ_ONLY_GRANT>", "--dir", "/absolute/isolated/hc-demo"],
      "cwd": "/absolute/isolated/hc-demo"
    }
  }
}
```

先发现工具并核对最新 schema/注解，再限定合成 note 做 `search` / `recent` / `record`
只读验收；不调用 `request_access`、`use_secret`、`remember` 等提权/密钥/写入功能。
读取内容会成为模型上下文，必须披露该边界。当前 Registry 尚需确认可配置本地路径和
grant 的界面，不把维护者机器上的绝对路径或 grant 硬编码成共享卡片。

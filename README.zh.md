<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/npm-launcher/readme.png" width="400" alt="npm-launcher" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/npm-launcher/actions"><img src="https://github.com/mcp-tool-shop-org/npm-launcher/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/npm-launcher"><img src="https://img.shields.io/npm/v/@mcptoolshop/npm-launcher" alt="npm version"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/npm-launcher"><img src="https://codecov.io/gh/mcp-tool-shop-org/npm-launcher/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="https://github.com/mcp-tool-shop-org/npm-launcher/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License"></a>
  <a href="https://mcp-tool-shop-org.github.io/npm-launcher/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

适用于 npm 的通用 GitHub 发布二进制启动器。它从 GitHub 发布中下载特定于平台的二进制文件，将其缓存在本地，验证 SHA256 校验和，并使用完整的参数传递功能运行它们。

构建的目的是让 Python 命令行工具（或任何编译后的二进制文件）实现零依赖的 `npx` 分发。

## 安全与威胁模型

npm-launcher 下载并执行二进制文件。以下是它访问的内容以及它不访问的内容：

- **网络：** 仅使用 HTTPS 连接到 `github.com` 和 GitHub 的 CDN。没有其他目标地址。
- **文件系统：** 仅写入本地缓存（`~/.cache/mcptoolshop/` 或 `%LOCALAPPDATA%\mcptoolshop\`）。不修改系统文件或读取缓存之外的文件。
- **验证：** 每个二进制文件都会与同一发布中的 `checksums-<version>.txt` 文件中的 SHA256 进行检查。如果不匹配，则中止执行并删除下载的文件。
- **无遥测。** 不处理任何敏感信息。不存储或传输任何凭据。
- **权限：** 除了正常的用户文件系统访问权限和出站 HTTPS 之外，不需要其他权限。

## 工作原理

```
npx @mcptoolshop/sovereignty tutorial
        │
        ▼
  wrapper sets config JSON
        │
        ▼
  npm-launcher resolves platform (linux-x64, darwin-arm64, etc.)
        │
        ▼
  checks local cache (~/.cache/mcptoolshop/<tool>/<version>/)
        │
        ├─ cached → run binary
        │
        └─ not cached:
             fetch checksums-<version>.txt from GitHub Release
             download <tool>-<version>-<os>-<arch>[.exe]
             verify SHA256
             cache + chmod +x
             run binary
```

## 安装

```bash
npm install @mcptoolshop/npm-launcher
```

此软件包是一个用于包装软件包的库——最终用户安装包装器（例如 `npx @mcptoolshop/sovereignty`），而不是直接安装此软件包。

需要 Node.js 18 或更高版本。CI 测试使用 Node 20 和 22。

## 配置约定

包装器通过 `MCPTOOLSHOP_LAUNCH_CONFIG` 传递纯 JSON。没有函数，也没有任何特殊处理。

| 字段 | 必需 | 示例 | 描述 |
|------------|----------|------------------------|--------------------------------------|
| `toolName` | 是 | `"sovereignty"`        | 二进制文件基本名称 |
| `owner`    | 是 | `"mcp-tool-shop-org"`  | GitHub 组织/用户 |
| `repo`     | 是 | `"sovereignty"`        | GitHub 仓库名称 |
| `version`  | 是 | `"1.4.0"`              | 语义版本（没有 `v` 前缀） |
| `tag`      | no       | `"v1.4.0"`             | Git 标签（默认为 `v<version>`） |
| `quiet`    | no       | `true`                 | 抑制进度消息 |

## 资源命名约定

已锁定。所有工具都遵循相同的模式：

```
<toolName>-<version>-<os>-<arch><ext>
```

| 平台 | 示例资源 |
|---------------|--------------------------------------|
| Linux x64 | `sovereignty-1.4.0-linux-x64`        |
| macOS ARM | `sovereignty-1.4.0-darwin-arm64`     |
| macOS Intel | `sovereignty-1.4.0-darwin-x64`       |
| Windows x64 | `sovereignty-1.4.0-win-x64.exe`     |

校验和文件：`checksums-<version>.txt`（GNU coreutils 格式）。

## 编写包装器

一个包装器是一个小的 npm 软件包（约 3 个文件）：

**package.json：**
```json
{
  "name": "@mcptoolshop/sovereignty",
  "version": "1.4.0",
  "bin": { "sovereignty": "bin/sovereignty.js" },
  "dependencies": { "@mcptoolshop/npm-launcher": "^1.2.0" }
}
```

**bin/sovereignty.js：**
```js
#!/usr/bin/env node
process.env.MCPTOOLSHOP_LAUNCH_CONFIG = JSON.stringify({
  toolName: "sovereignty",
  owner: "mcp-tool-shop-org",
  repo: "sovereignty",
  version: "1.4.0",
});
require("@mcptoolshop/npm-launcher/bin/mcptoolshop-launch.js");
```

有关完整的包装器模板，请参阅 `examples/sovereignty/` 和 `examples/xrpl-camp/`，有关 PyInstaller CI 工作流程，请参阅 `examples/ci/release-binaries.yml`。

## 环境变量

| 变量 | 效果 |
|----------|--------|
| `MCPTOOLSHOP_LAUNCHER_QUIET=1` | 抑制进度消息（错误仍然会打印） |

## 启动器标志

通过包装器，所有参数都传递到工具，包括 `--version` 和 `--help`，因此 `npx @mcptoolshop/<tool> --version` 会打印工具的版本（自 1.2.0 起）。该工具还会将其自身名称作为 `argv[0]`，因此其帮助信息显示的是 `Usage: <tool> ...`，而不是缓存的文件名。

启动器保留三个标志供自身使用：

| 标志 | 效果 |
|------|--------|
| `--launcher-version` | 打印启动器的版本，带或不带包装器 |
| `--print-cache-path` | 打印配置的工具的二进制文件缓存的位置 |
| `--clear-cache` | 删除配置的工具的缓存二进制文件 |

在没有包装器配置的情况下独立运行，启动器还会响应 `--version`/`-V` 和 `--help`/`-h`。

## 支持的平台

- Linux x64
- macOS ARM64（Apple Silicon）
- macOS x64（Intel）
- Windows x64

## 缓存位置

| OS      | 路径 |
|---------|----------------------------------------------|
| Linux | `$XDG_CACHE_HOME/mcptoolshop/<tool>/<version>/`（默认 `~/.cache/mcptoolshop/`） |
| macOS | `$XDG_CACHE_HOME/mcptoolshop/<tool>/<version>/`（默认 `~/.cache/mcptoolshop/`） |
| Windows | `%LOCALAPPDATA%\mcptoolshop\<tool>\<version>\` |

---

由 <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> 构建

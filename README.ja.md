<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/npm-launcher/readme.png" width="400" alt="npm-launcher" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/npm-launcher/actions"><img src="https://github.com/mcp-tool-shop-org/npm-launcher/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/npm-launcher"><img src="https://img.shields.io/npm/v/@mcptoolshop/npm-launcher" alt="npm version"></a>
  <a href="https://github.com/mcp-tool-shop-org/npm-launcher/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License"></a>
  <a href="https://mcp-tool-shop-org.github.io/npm-launcher/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

npm用の汎用的なGitHubリリースバイナリランチャー。プラットフォーム固有のバイナリをGitHubリリースからダウンロードし、ローカルにキャッシュし、SHA256チェックサムを検証し、すべての引数をそのまま渡して実行します。

Python CLI（またはコンパイルされたバイナリ）が、依存関係なしで`npx`配布できるように構築されています。

## セキュリティと脅威モデル

npm-launcherはバイナリをダウンロードして実行します。以下に、アクセスするものとアクセスしないものを示します。

- **ネットワーク:** HTTPSのみ。`github.com`とGitHubのCDNに接続します。それ以外の宛先はありません。
- **ファイルシステム:** ローカルキャッシュ（`~/.cache/mcptoolshop/`または`%LOCALAPPDATA%\mcptoolshop\`）にのみ書き込みます。システムファイルを変更したり、キャッシュ外のファイルを読み取ったりすることはありません。
- **検証:** すべてのバイナリは、同じリリースの`checksums-<version>.txt`ファイルにあるSHA256と比較してチェックされます。不一致の場合、実行は中止され、ダウンロードされたファイルは削除されます。
- **テレメトリは行いません。** 機密情報の処理も行いません。資格情報は保存または送信されません。
- **権限:** 通常のユーザーのファイルシステムアクセスとアウトバウンドHTTPS以上の権限は必要ありません。

## 仕組み

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

## インストール

```bash
npm install @mcptoolshop/npm-launcher
```

このパッケージは、ラッパーパッケージ用のライブラリです。エンドユーザーは、このパッケージを直接インストールするのではなく、ラッパー（例：`npx @mcptoolshop/sovereignty`）をインストールします。

## 設定契約

ラッパーは、純粋なJSONを`MCPTOOLSHOP_LAUNCH_CONFIG`経由で渡します。関数や特殊な処理はありません。

| フィールド | 必須 | 例 | 説明 |
|------------|----------|------------------------|--------------------------------------|
| `toolName` | はい | `"sovereignty"`        | バイナリの基本名 |
| `owner`    | はい | `"mcp-tool-shop-org"`  | GitHub org/user |
| `repo`     | はい | `"sovereignty"`        | GitHub リポジトリ名 |
| `version`  | はい | `"1.4.0"`              | Semver（`v`プレフィックスなし） |
| `tag`      | no       | `"v1.4.0"`             | Gitタグ（デフォルトは`v<version>`） |
| `quiet`    | no       | `true`                 | 進行状況メッセージを抑制 |

## アセットの命名規則

固定。すべてのツールは同じパターンに従います。

```
<toolName>-<version>-<os>-<arch><ext>
```

| プラットフォーム | 例：アセット |
|---------------|--------------------------------------|
| Linux x64 | `sovereignty-1.4.0-linux-x64`        |
| macOS ARM | `sovereignty-1.4.0-darwin-arm64`     |
| macOS Intel | `sovereignty-1.4.0-darwin-x64`       |
| Windows x64 | `sovereignty-1.4.0-win-x64.exe`     |

チェックサムファイル：`checksums-<version>.txt`（GNU coreutils形式）。

## ラッパーの作成

ラッパーは、小さなnpmパッケージ（約3ファイル）です。

**package.json:**
```json
{
  "name": "@mcptoolshop/sovereignty",
  "version": "1.4.0",
  "bin": { "sovereignty": "bin/sovereignty.js" },
  "dependencies": { "@mcptoolshop/npm-launcher": "^1.0.0" }
}
```

**bin/sovereignty.js:**
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

完全なラッパーテンプレートについては、`examples/sovereignty/`と`examples/xrpl-camp/`を参照し、PyInstaller CIワークフローについては、`examples/ci/release-binaries.yml`を参照してください。

## 環境変数

| 変数 | 効果 |
|----------|--------|
| `MCPTOOLSHOP_LAUNCHER_QUIET=1` | 進行状況メッセージを抑制（エラーは引き続き表示されます） |

## サポートされているプラットフォーム

- Linux x64
- macOS ARM64 (Apple Silicon)
- macOS x64 (Intel)
- Windows x64

## キャッシュの場所

| OS      | パス |
|---------|----------------------------------------------|
| Linux | `~/.cache/mcptoolshop/<tool>/<version>/`     |
| macOS | `~/.cache/mcptoolshop/<tool>/<version>/`     |
| Windows | `%LOCALAPPDATA%\mcptoolshop\<tool>\<version>\` |

---

MCP Tool Shopによって構築されました <a href="https://mcp-tool-shop.github.io/"></a>

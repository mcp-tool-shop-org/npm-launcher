<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
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

Lançador binário genérico GitHub para npm. Faz o download de binários específicos da plataforma a partir de GitHub Releases, armazena-os em cache localmente, verifica os SHA256 checksums e executa-os com total passagem de argumentos.

Criado para que as CLIs Python (ou qualquer binário compilado) tenham uma distribuição sem dependências `npx`.

## Segurança e Modelo de Ameaças

O npm-launcher faz o download e executa binários. Veja o que ele acessa e o que não:

- **Rede:** Apenas HTTPS, para `github.com` e a CDN de GitHub. Nenhum outro destino.
- **Sistema de arquivos:** Escreve apenas no cache local (`~/.cache/mcptoolshop/` ou `%LOCALAPPDATA%\mcptoolshop\`). Não modifica arquivos do sistema nem lê fora do cache.
- **Verificação:** Cada binário é verificado em relação a SHA256 a partir de um arquivo `checksums-<version>.txt` na mesma versão. Incompatibilidades interrompem a execução e excluem o arquivo baixado.
- **Sem telemetria.** Sem tratamento de segredos. Sem credenciais armazenadas ou transmitidas.
- **Permissões:** Nenhuma necessária além do acesso normal ao sistema de arquivos do usuário e HTTPS de saída.

## Como Funciona

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

## Instalação

```bash
npm install @mcptoolshop/npm-launcher
```

Este pacote é uma biblioteca para pacotes de wrapper — os usuários finais instalam o wrapper (por exemplo, `npx @mcptoolshop/sovereignty`), e não este diretamente.

## Contrato de Configuração

Os wrappers passam JSON puro via `MCPTOOLSHOP_LAUNCH_CONFIG`. Sem funções, sem truques.

| Campo | Obrigatório | Exemplo | Descrição |
|------------|----------|------------------------|--------------------------------------|
| `toolName` | sim | `"sovereignty"`        | Nome base do binário |
| `owner`    | sim | `"mcp-tool-shop-org"`  | GitHub org/usuário |
| `repo`     | sim | `"sovereignty"`        | GitHub nome do repositório |
| `version`  | sim | `"1.4.0"`              | Semver (sem prefixo `v`) |
| `tag`      | no       | `"v1.4.0"`             | Tag Git (o padrão é `v<version>`) |
| `quiet`    | no       | `true`                 | Suprimir mensagens de progresso |

## Convenção de Nomenclatura de Ativos

Bloqueado. Todas as ferramentas seguem o mesmo padrão:

```
<toolName>-<version>-<os>-<arch><ext>
```

| Plataforma | Exemplo de Ativo |
|---------------|--------------------------------------|
| Linux x64 | `sovereignty-1.4.0-linux-x64`        |
| macOS ARM | `sovereignty-1.4.0-darwin-arm64`     |
| macOS Intel | `sovereignty-1.4.0-darwin-x64`       |
| Windows x64 | `sovereignty-1.4.0-win-x64.exe`     |

Arquivo de checksums: `checksums-<version>.txt` (formato GNU coreutils).

## Criando um Wrapper

Um wrapper é um pequeno pacote npm (~3 arquivos):

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

Veja `examples/sovereignty/` e `examples/xrpl-camp/` para modelos completos de wrapper e `examples/ci/release-binaries.yml` para um fluxo de trabalho PyInstaller CI.

## Variáveis de Ambiente

| Variável | Efeito |
|----------|--------|
| `MCPTOOLSHOP_LAUNCHER_QUIET=1` | Suprimir mensagens de progresso (erros ainda são exibidos) |

## Plataformas Suportadas

- Linux x64
- macOS ARM64 (Apple Silicon)
- macOS x64 (Intel)
- Windows x64

## Localização do Cache

| OS      | Caminho |
|---------|----------------------------------------------|
| Linux | `~/.cache/mcptoolshop/<tool>/<version>/`     |
| macOS | `~/.cache/mcptoolshop/<tool>/<version>/`     |
| Windows | `%LOCALAPPDATA%\mcptoolshop\<tool>\<version>\` |

---

Criado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>

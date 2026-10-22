<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

Launcher binario generico GitHub per npm. Scarica i binari specifici per la piattaforma da GitHub Releases, li memorizza nella cache localmente, verifica gli hash SHA256 e li esegue con il passaggio completo degli argomenti.

Progettato in modo che le CLI Python (o qualsiasi binario compilato) ottengano una distribuzione senza dipendenze `npx`.

## Sicurezza e modello di minaccia

npm-launcher scarica ed esegue i binari. Ecco cosa tocca e cosa non tocca:

- **Rete:** solo HTTPS, verso `github.com` e la CDN di GitHub. Nessun'altra destinazione.
- **Filesystem:** scrive solo nella cache locale (`~/.cache/mcptoolshop/` o `%LOCALAPPDATA%\mcptoolshop\`). Non modifica i file di sistema né legge al di fuori della cache.
- **Verifica:** ogni binario viene controllato rispetto a SHA256 da un file `checksums-<version>.txt` nella stessa versione. In caso di discrepanze, l'esecuzione viene interrotta e il file scaricato viene eliminato.
- **Nessun telemetria.** Nessuna gestione di segreti. Nessuna credenziale memorizzata o trasmessa.
- **Autorizzazioni:** nessuna richiesta oltre all'accesso normale al filesystem dell'utente e all'HTTPS in uscita.

## Come funziona

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

## Installazione

```bash
npm install @mcptoolshop/npm-launcher
```

Questo pacchetto è una libreria per pacchetti wrapper: gli utenti finali installano il wrapper (ad esempio, `npx @mcptoolshop/sovereignty`), non questo direttamente.

Richiede Node.js 18 o versioni successive. I test CI utilizzano Node 20 e 22.

## Contratto di configurazione

I wrapper passano il JSON puro tramite `MCPTOOLSHOP_LAUNCH_CONFIG`. Nessuna funzione, nessuna magia.

| Campo | Obbligatorio | Esempio | Descrizione |
|------------|----------|------------------------|--------------------------------------|
| `toolName` | sì | `"sovereignty"`        | Nome base del binario |
| `owner`    | sì | `"mcp-tool-shop-org"`  | GitHub org/utente |
| `repo`     | sì | `"sovereignty"`        | GitHub nome del repository |
| `version`  | sì | `"1.4.0"`              | Semver (senza prefisso `v`) |
| `tag`      | no       | `"v1.4.0"`             | Tag Git (impostazione predefinita su `v<version>`) |
| `quiet`    | no       | `true`                 | Sopprimi i messaggi di avanzamento |

## Convenzione di denominazione degli asset

Bloccato. Tutti gli strumenti seguono lo stesso schema:

```
<toolName>-<version>-<os>-<arch><ext>
```

| Piattaforma | Esempio di asset |
|---------------|--------------------------------------|
| Linux x64 | `sovereignty-1.4.0-linux-x64`        |
| macOS ARM | `sovereignty-1.4.0-darwin-arm64`     |
| macOS Intel | `sovereignty-1.4.0-darwin-x64`       |
| Windows x64 | `sovereignty-1.4.0-win-x64.exe`     |

File di checksum: `checksums-<version>.txt` (formato GNU coreutils).

## Scrittura di un wrapper

Un wrapper è un piccolo pacchetto npm (~3 file):

**package.json:**
```json
{
  "name": "@mcptoolshop/sovereignty",
  "version": "1.4.0",
  "bin": { "sovereignty": "bin/sovereignty.js" },
  "dependencies": { "@mcptoolshop/npm-launcher": "^1.2.0" }
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

Per modelli di wrapper completi, vedere `examples/sovereignty/` e `examples/xrpl-camp/`, e per un flusso di lavoro CI PyInstaller, vedere `examples/ci/release-binaries.yml`.

## Variabili d'ambiente

| Variabile | Effetto |
|----------|--------|
| `MCPTOOLSHOP_LAUNCHER_QUIET=1` | Sopprimi i messaggi di avanzamento (gli errori vengono comunque visualizzati) |

## Flag del launcher

Tramite un wrapper, ogni argomento viene passato allo strumento, inclusi `--version` e `--help`, quindi `npx @mcptoolshop/<tool> --version` stampa la versione dello strumento (dalla versione 1.2.0). Lo strumento visualizza anche il proprio nome come `argv[0]`, quindi la sua guida visualizza `Usage: <tool> ...` anziché il nome del file memorizzato nella cache.

Il launcher mantiene tre flag per sé:

| Flag | Effetto |
|------|--------|
| `--launcher-version` | Stampa la versione del launcher, con o senza un wrapper |
| `--print-cache-path` | Stampa dove è memorizzato nella cache il binario dello strumento configurato |
| `--clear-cache` | Rimuovi i binari memorizzati nella cache dello strumento configurato |

Eseguito autonomamente, senza la configurazione di un wrapper, il launcher risponde anche a `--version`/`-V` e `--help`/`-h`.

## Piattaforme supportate

- Linux x64
- macOS ARM64 (Apple Silicon)
- macOS x64 (Intel)
- Windows x64

## Posizione della cache

| OS      | Percorso |
|---------|----------------------------------------------|
| Linux | `$XDG_CACHE_HOME/mcptoolshop/<tool>/<version>/` (impostazione predefinita `~/.cache/mcptoolshop/`) |
| macOS | `$XDG_CACHE_HOME/mcptoolshop/<tool>/<version>/` (impostazione predefinita `~/.cache/mcptoolshop/`) |
| Windows | `%LOCALAPPDATA%\mcptoolshop\<tool>\<version>\` |

---

Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>

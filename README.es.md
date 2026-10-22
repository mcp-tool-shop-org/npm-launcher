<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

Lanzador binario genérico GitHub para npm. Descarga binarios específicos de la plataforma de GitHub Releases, los almacena en caché localmente, verifica SHA256 sumas de comprobación y los ejecuta con el paso completo de argumentos.

Diseñado para que las CLI de Python (o cualquier binario compilado) obtengan una distribución sin dependencias `npx`.

## Seguridad y modelo de amenazas

npm-launcher descarga y ejecuta binarios. Esto es lo que afecta y lo que no:

- **Red:** Solo HTTPS, a `github.com` y al CDN de GitHub. No hay otros destinos.
- **Sistema de archivos:** Escribe solo en la caché local (`~/.cache/mcptoolshop/` o `%LOCALAPPDATA%\mcptoolshop\`). No modifica los archivos del sistema ni lee fuera de la caché.
- **Verificación:** Cada binario se verifica con SHA256 a partir de un archivo `checksums-<version>.txt` en la misma versión. Las discrepancias interrumpen la ejecución y eliminan el archivo descargado.
- **Sin telemetría.** No se gestionan secretos. No se almacenan ni se transmiten credenciales.
- **Permisos:** No se requieren permisos más allá del acceso normal al sistema de archivos del usuario y la salida HTTPS.

## Cómo funciona

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

## Instalación

```bash
npm install @mcptoolshop/npm-launcher
```

Este paquete es una biblioteca para paquetes de envoltura; los usuarios finales instalan el paquete de envoltura (por ejemplo, `npx @mcptoolshop/sovereignty`), no este directamente.

Requiere Node.js 18 o posterior. Las pruebas de CI utilizan Node 20 y 22.

## Contrato de configuración

Los paquetes de envoltura pasan JSON puro a través de `MCPTOOLSHOP_LAUNCH_CONFIG`. No hay funciones, ni magia.

| Campo | Obligatorio | Ejemplo | Descripción |
|------------|----------|------------------------|--------------------------------------|
| `toolName` | sí | `"sovereignty"`        | Nombre base del binario |
| `owner`    | sí | `"mcp-tool-shop-org"`  | GitHub org/usuario |
| `repo`     | sí | `"sovereignty"`        | GitHub nombre del repositorio |
| `version`  | sí | `"1.4.0"`              | Semver (sin prefijo `v`) |
| `tag`      | no       | `"v1.4.0"`             | Etiqueta de Git (por defecto, `v<version>`) |
| `quiet`    | no       | `true`                 | Suprimir los mensajes de progreso |

## Convención de nomenclatura de activos

Bloqueado. Todas las herramientas siguen el mismo patrón:

```
<toolName>-<version>-<os>-<arch><ext>
```

| Plataforma | Ejemplo de activo |
|---------------|--------------------------------------|
| Linux x64 | `sovereignty-1.4.0-linux-x64`        |
| macOS ARM | `sovereignty-1.4.0-darwin-arm64`     |
| macOS Intel | `sovereignty-1.4.0-darwin-x64`       |
| Windows x64 | `sovereignty-1.4.0-win-x64.exe`     |

Archivo de sumas de comprobación: `checksums-<version>.txt` (formato GNU coreutils).

## Creación de un paquete de envoltura

Un paquete de envoltura es un pequeño paquete npm (~3 archivos):

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

Consulte `examples/sovereignty/` y `examples/xrpl-camp/` para obtener plantillas completas de paquetes de envoltura, y `examples/ci/release-binaries.yml` para un flujo de trabajo de CI PyInstaller.

## Variables de entorno

| Variable | Efecto |
|----------|--------|
| `MCPTOOLSHOP_LAUNCHER_QUIET=1` | Suprimir los mensajes de progreso (los errores siguen mostrándose) |

## Indicadores del lanzador

A través de un paquete de envoltura, cada argumento se envía a la herramienta, incluidos `--version` y `--help`, por lo que `npx @mcptoolshop/<tool> --version` imprime la versión de la herramienta (a partir de la versión 1.2.0). La herramienta también ve su propio nombre como `argv[0]`, por lo que su ayuda muestra `Usage: <tool> ...` en lugar del nombre del archivo almacenado en caché.

El lanzador mantiene tres indicadores para sí mismo:

| Indicador | Efecto |
|------|--------|
| `--launcher-version` | Imprime la versión del lanzador, con o sin un paquete de envoltura |
| `--print-cache-path` | Imprime dónde se almacena en caché el binario de la herramienta configurada |
| `--clear-cache` | Elimina los binarios almacenados en caché de la herramienta configurada |

Al ejecutarse por sí solo, sin la configuración de un paquete de envoltura, el lanzador también responde a `--version`/`-V` y `--help`/`-h`.

## Plataformas compatibles

- Linux x64
- macOS ARM64 (Apple Silicon)
- macOS x64 (Intel)
- Windows x64

## Ubicación de la caché

| OS      | Ruta |
|---------|----------------------------------------------|
| Linux | `$XDG_CACHE_HOME/mcptoolshop/<tool>/<version>/` (por defecto, `~/.cache/mcptoolshop/`) |
| macOS | `$XDG_CACHE_HOME/mcptoolshop/<tool>/<version>/` (por defecto, `~/.cache/mcptoolshop/`) |
| Windows | `%LOCALAPPDATA%\mcptoolshop\<tool>\<version>\` |

---

Creado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>

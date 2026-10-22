<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

Lanceur binaire générique GitHub pour npm. Télécharge les binaires spécifiques à la plateforme à partir de GitHub Releases, les met en cache localement, vérifie les sommes de contrôle SHA256 et les exécute en transmettant tous les arguments.

Conçu pour que les interfaces de ligne de commande Python (ou tout autre binaire compilé) bénéficient d’une distribution sans dépendances `npx`.

## Sécurité et modèle de menace

npm-launcher télécharge et exécute des binaires. Voici ce qu’il touche et ce qu’il ne touche pas :

- **Réseau :** uniquement HTTPS, vers `github.com` et le CDN de GitHub. Aucune autre destination.
- **Système de fichiers :** écrit uniquement dans le cache local (`~/.cache/mcptoolshop/` ou `%LOCALAPPDATA%\mcptoolshop\`). Ne modifie pas les fichiers système et ne lit pas en dehors du cache.
- **Vérification :** chaque binaire est vérifié par rapport à SHA256 à partir d’un fichier `checksums-<version>.txt` dans la même version. Les incohérences interrompent l’exécution et suppriment le fichier téléchargé.
- **Pas de télémétrie.** Pas de gestion des secrets. Aucun identifiant stocké ou transmis.
- **Autorisations :** aucune autorisation supplémentaire n’est requise au-delà de l’accès normal au système de fichiers de l’utilisateur et de la connexion HTTPS sortante.

## Fonctionnement

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

## Installation

```bash
npm install @mcptoolshop/npm-launcher
```

Ce paquet est une bibliothèque pour les paquets d’enveloppe : les utilisateurs finaux installent l’enveloppe (par exemple, `npx @mcptoolshop/sovereignty`), et non directement ce paquet.

Nécessite Node.js 18 ou une version ultérieure. Les tests CI utilisent Node 20 et 22.

## Contrat de configuration

Les enveloppes transmettent du JSON pur via `MCPTOOLSHOP_LAUNCH_CONFIG`. Pas de fonctions, pas de magie.

| Champ | Obligatoire | Exemple | Description |
|------------|----------|------------------------|--------------------------------------|
| `toolName` | oui | `"sovereignty"`        | Nom de base du binaire |
| `owner`    | oui | `"mcp-tool-shop-org"`  | GitHub org/user |
| `repo`     | oui | `"sovereignty"`        | GitHub nom du dépôt |
| `version`  | oui | `"1.4.0"`              | Semver (sans préfixe `v`) |
| `tag`      | no       | `"v1.4.0"`             | Balise Git (par défaut, `v<version>`) |
| `quiet`    | no       | `true`                 | Supprimer les messages de progression |

## Convention de nommage des ressources

Bloqué. Tous les outils suivent le même modèle :

```
<toolName>-<version>-<os>-<arch><ext>
```

| Plateforme | Exemple de ressource |
|---------------|--------------------------------------|
| Linux x64 | `sovereignty-1.4.0-linux-x64`        |
| macOS ARM | `sovereignty-1.4.0-darwin-arm64`     |
| macOS Intel | `sovereignty-1.4.0-darwin-x64`       |
| Windows x64 | `sovereignty-1.4.0-win-x64.exe`     |

Fichier de sommes de contrôle : `checksums-<version>.txt` (format GNU coreutils).

## Création d’une enveloppe

Une enveloppe est un petit paquet npm (environ 3 fichiers) :

**package.json :**
```json
{
  "name": "@mcptoolshop/sovereignty",
  "version": "1.4.0",
  "bin": { "sovereignty": "bin/sovereignty.js" },
  "dependencies": { "@mcptoolshop/npm-launcher": "^1.2.0" }
}
```

**bin/sovereignty.js :**
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

Consultez `examples/sovereignty/` et `examples/xrpl-camp/` pour obtenir des modèles d’enveloppe complets, et `examples/ci/release-binaries.yml` pour un flux de travail CI PyInstaller.

## Variables d’environnement

| Variable | Effet |
|----------|--------|
| `MCPTOOLSHOP_LAUNCHER_QUIET=1` | Supprimer les messages de progression (les erreurs sont toujours affichées) |

## Options du lanceur

Grâce à une enveloppe, chaque argument est transmis à l’outil, y compris `--version` et `--help`, de sorte que `npx @mcptoolshop/<tool> --version` affiche la version de l’outil (depuis la version 1.2.0). L’outil voit également son propre nom en tant que `argv[0]`, de sorte que son aide affiche `Usage: <tool> ...` au lieu du nom du fichier mis en cache.

Le lanceur conserve trois options pour lui-même :

| Option | Effet |
|------|--------|
| `--launcher-version` | Afficher la version du lanceur, avec ou sans enveloppe |
| `--print-cache-path` | Afficher l’emplacement où le binaire de l’outil configuré est mis en cache |
| `--clear-cache` | Supprimer les binaires mis en cache de l’outil configuré |

Lorsqu’il est exécuté seul, sans la configuration d’une enveloppe, le lanceur répond également à `--version`/`-V` et `--help`/`-h`.

## Plateformes prises en charge

- Linux x64
- macOS ARM64 (Apple Silicon)
- macOS x64 (Intel)
- Windows x64

## Emplacement du cache

| OS      | Chemin |
|---------|----------------------------------------------|
| Linux | `$XDG_CACHE_HOME/mcptoolshop/<tool>/<version>/` (par défaut `~/.cache/mcptoolshop/`) |
| macOS | `$XDG_CACHE_HOME/mcptoolshop/<tool>/<version>/` (par défaut `~/.cache/mcptoolshop/`) |
| Windows | `%LOCALAPPDATA%\mcptoolshop\<tool>\<version>\` |

---

Créé par <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>

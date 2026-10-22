<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

Lanceur binaire générique GitHub pour npm. Télécharge les binaires spécifiques à la plateforme à partir de GitHub Releases, les met en cache localement, vérifie les sommes de contrôle SHA256 et les exécute en transmettant tous les arguments.

Conçu pour que les interfaces en ligne de commande Python (ou tout autre binaire compilé) bénéficient d’une distribution sans dépendances `npx`.

## Sécurité et modèle de menace

npm-launcher télécharge et exécute des binaires. Voici ce qu’il touche et ce qu’il ne touche pas :

- **Réseau :** uniquement HTTPS, vers `github.com` et le CDN de GitHub. Aucune autre destination.
- **Système de fichiers :** écrit uniquement dans le cache local (`~/.cache/mcptoolshop/` ou `%LOCALAPPDATA%\mcptoolshop\`). Ne modifie pas les fichiers système et ne lit pas en dehors du cache.
- **Vérification :** chaque binaire est vérifié par rapport à SHA256 à partir d’un fichier `checksums-<version>.txt` dans la même version. Les incohérences interrompent l’exécution et suppriment le fichier téléchargé.
- **Pas de télémétrie.** Pas de gestion des secrets. Aucune information d’identification stockée ou transmise.
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

Ce paquet est une bibliothèque pour les paquets d’enveloppement : les utilisateurs finaux installent le paquet d’enveloppement (par exemple, `npx @mcptoolshop/sovereignty`), et non celui-ci directement.

## Contrat de configuration

Les paquets d’enveloppement transmettent du JSON pur via `MCPTOOLSHOP_LAUNCH_CONFIG`. Pas de fonctions, pas de magie.

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

Fichier des sommes de contrôle : `checksums-<version>.txt` (format GNU coreutils).

## Création d’un paquet d’enveloppement

Un paquet d’enveloppement est un petit paquet npm (environ 3 fichiers) :

**package.json :**
```json
{
  "name": "@mcptoolshop/sovereignty",
  "version": "1.4.0",
  "bin": { "sovereignty": "bin/sovereignty.js" },
  "dependencies": { "@mcptoolshop/npm-launcher": "^1.0.0" }
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

Voir `examples/sovereignty/` et `examples/xrpl-camp/` pour obtenir des modèles de paquet d’enveloppement complets, et `examples/ci/release-binaries.yml` pour un flux de travail CI PyInstaller.

## Variables d’environnement

| Variable | Effet |
|----------|--------|
| `MCPTOOLSHOP_LAUNCHER_QUIET=1` | Supprimer les messages de progression (les erreurs sont toujours affichées) |

## Plateformes prises en charge

- Linux x64
- macOS ARM64 (Apple Silicon)
- macOS x64 (Intel)
- Windows x64

## Emplacement du cache

| OS      | Chemin |
|---------|----------------------------------------------|
| Linux | `~/.cache/mcptoolshop/<tool>/<version>/`     |
| macOS | `~/.cache/mcptoolshop/<tool>/<version>/`     |
| Windows | `%LOCALAPPDATA%\mcptoolshop\<tool>\<version>\` |

---

Créé par <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>

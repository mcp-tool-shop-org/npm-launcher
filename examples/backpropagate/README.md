<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/backpropagate/readme.png" alt="Backpropagate" width="400">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@mcptoolshop/backpropagate"><img src="https://img.shields.io/npm/v/@mcptoolshop/backpropagate" alt="npm version"></a>
  <a href="https://github.com/mcp-tool-shop-org/backpropagate/actions/workflows/release-binaries.yml"><img src="https://github.com/mcp-tool-shop-org/backpropagate/actions/workflows/release-binaries.yml/badge.svg" alt="Release Binaries"></a>
  <a href="https://github.com/mcp-tool-shop-org/backpropagate/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/backpropagate/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

Headless LLM fine-tuning CLI with smart defaults. Train, export, and serve models from a single command. Zero-dependency npm distribution powered by [@mcptoolshop/npm-launcher](https://www.npmjs.com/package/@mcptoolshop/npm-launcher).

## Install

**macOS / Windows** — zero-dependency binary via npm:

```bash
npx @mcptoolshop/backpropagate info
```

Or install globally:

```bash
npm install -g @mcptoolshop/backpropagate
```

**Linux** — install via pip (PyTorch is too large for a single-file binary):

```bash
pipx install backpropagate
# or: pip install backpropagate
```

The npm package downloads a platform-specific binary from GitHub Releases, verifies its SHA256 checksum, and caches it locally. Subsequent runs start instantly.

## Usage

```bash
# Show system info (GPU, Python, PyTorch, CUDA)
backpropagate info

# Fine-tune a model
backpropagate train --model unsloth/Qwen2.5-7B-Instruct-bnb-4bit --data my_data.jsonl --steps 100

# Multi-run training with SLAO merging
backpropagate multi-run --model meta-llama/Llama-3-8B --data train.jsonl --runs 5

# Export to GGUF for Ollama
backpropagate export ./my-model --format gguf --quantization q4_k_m --ollama

# Launch web UI
backpropagate ui

# View/modify configuration
backpropagate config --show
```

## Features

- **Smart Defaults** — Auto-configures hyperparameters based on your hardware and dataset
- **VRAM-Aware** — Automatic batch sizing and GPU memory management
- **Multi-Run SLAO** — Prevents catastrophic forgetting during long training runs
- **One-Click Export** — GGUF export with automatic Ollama registration
- **Windows-First** — Tested and optimized for Windows, Linux, and macOS
- **Headless** — Built for CI/CD pipelines and automated workflows

## GPU Training

The npm-distributed binary uses CPU-only PyTorch to keep download sizes manageable. For GPU-accelerated training, install via pip instead:

```bash
pip install backpropagate[standard]
```

The npm binary is ideal for `info`, `config`, `export`, `ui`, and CPU-based inference. For production GPU training workloads, use the pip distribution.

## How It Works

This package is a thin wrapper around [@mcptoolshop/npm-launcher](https://www.npmjs.com/package/@mcptoolshop/npm-launcher). On first run it:

1. Detects your platform (darwin-arm64, win-x64)
2. Downloads the matching binary from [GitHub Releases](https://github.com/mcp-tool-shop-org/backpropagate/releases)
3. Verifies the SHA256 checksum
4. Caches the binary locally (~/.cache/mcptoolshop/ or %LOCALAPPDATA%\mcptoolshop\)
5. Runs the binary with full argument passthrough

On Linux, the package exits with a message directing you to `pipx install backpropagate` instead. PyTorch's native libraries (~1.5GB on x86_64) make a single-file binary impractical for GitHub release distribution.

## Cache Management

```bash
# Show where binaries are cached
backpropagate --print-cache-path

# Clear cached binaries
backpropagate --clear-cache
```

## Links

- [Source Code](https://github.com/mcp-tool-shop-org/backpropagate)
- [PyPI Package](https://pypi.org/project/backpropagate/)
- [Landing Page](https://mcp-tool-shop-org.github.io/backpropagate/)
- [Changelog](https://github.com/mcp-tool-shop-org/backpropagate/blob/main/CHANGELOG.md)

## License

MIT

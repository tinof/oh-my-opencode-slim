# 👑 oh-my-opencode-slim

> **Fork Notice:** This is a fork of [alvinunreal/oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim) maintained by [@tinof](https://github.com/tinof). This fork focuses on achieving **Claude Code-level capabilities** by deeply integrating Serena MCP, MorphLLM MCP, and advanced project parsing hooks.

A lightweight, high-performance agent orchestration plugin for [OpenCode AI](https://opencode.com/). Built for speed, efficiency, and advanced reasoning.

---

## 🗺️ What's Different in this Fork? (The Parity Plan)

The original `oh-my-opencode-slim` is an excellent foundation for multi-agent orchestration. This fork implements the **[OpenCode Parity Plan](opencode-parity-plan.md)** — a comprehensive strategy for closing the gap between OpenCode and industry-leading AI coding tools like Claude Code and Cursor.

We achieve this through three main pillars:

### 1. Advanced MCP Integrations
Instead of relying purely on bash commands and grep, this fork is designed to seamlessly integrate with high-end MCP servers:
- **[Serena MCP](https://github.com/kris-mikael/serena)**: Unlocks LSP-aware structural navigation (go-to-definition, find references, safe renames, insert-after-symbol).
- **[MorphLLM MCP](https://github.com/MorphL-AI/morph-mcp)**: Provides WarpGrep semantic code search and lightning-fast FastApply file edits that eliminate context pollution.

### 2. Core Plugin Modifications
We've modified the core `oh-my-opencode` logic to handle context smarter:
- **@explorer rewrite:** Re-tuned to prioritize Serena AST/LSP searches over raw bash `grep`.
- **Dynamic Phase Hooks:** New hooks that automatically fire at specific points (e.g., forcing a high-level codebase scan when a project is first opened).
- **Smart Compaction:** Aggressive context pruning to keep prompts lean when tools return massive file dumps or JSON objects.

### 3. Advanced Custom Commands
Added dedicated slash commands for advanced workflows:
- `/trace`: Automated deep-dives using LSP to map out function call chains.
- `/map`: Automatically generates and updates `codemap.md`, a repository atlas.
- `/review-arch`: Dedicated architectural review tool for large refactors.

See the [full plan](opencode-parity-plan.md) for the implementation roadmap and gap analysis.

---

## ⚡ Installation

### For OpenCode Users

**Option 1: Direct Install (Recommended)**
Open the command palette in OpenCode (`Cmd+Shift+P` / `Ctrl+Shift+P`) and type:
```bash
/install https://github.com/tinof/oh-my-opencode-slim
```

**Option 2: Manual Config**
Add to your `~/.config/opencode/opencode.jsonc`:
```json
{
  "plugin": ["https://github.com/tinof/oh-my-opencode-slim"]
}
```

### For LLM Agents

Paste this into any coding agent:

```
Install and configure by following the instructions here:
https://raw.githubusercontent.com/tinof/oh-my-opencode-slim/refs/heads/master/README.md
```

---

## 📚 Documentation

- [Agent Pantheon](docs/agents.md) - Learn about the different agents (@orchestrator, @explorer, @oracle, @librarian, @designer, @fixer)
- [Local Development](docs/development.md) - How to build and test this plugin locally
- [Configuration](docs/configuration.md) - Advanced plugin configuration

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

<div align="center">
  <h1>🏛️ Po-po-code</h1>
  <p><b>Advanced Multi-Agent Orchestration for OpenCode <i>(Claude Code Edition)</i></b></p>
  <p><i>"Po po!" (Greek: Πω πω!) — An expression of astonishment or surprise.</i></p>
  <p>A highly specialized fork of <a href="https://github.com/alvinunreal/oh-my-opencode-slim">oh-my-opencode-slim</a>, reverse-engineering the internal architecture of Anthropic's Claude Code CLI to solve LLM context flooding.</p>
  <p><b>Status:</b> <i>Alpha — architecture and roadmap defined; Claude Code parity work is in progress.</i></p>
  <p><small>Published npm package: <code>po-po-code</code></small></p>
</div>

---

## 📖 The Philosophy: Protect the Orchestrator

Open-source coding agents typically dump every available tool and context file into a single model's prompt.
If you are using a brilliant reasoning model like **Codex 5.3** as your Orchestrator, feeding it 50 Chrome DevTools MCP schemas, 2MB screenshots, and raw server logs will cause **Context Flooding**. The model forgets instructions, slows down, and burns your token budget.

**Po-po-code** aims to restructure how agents communicate using the architectural patterns reflected in Anthropic's Claude Code (including leaked internals and the Monitor & Advisor tool direction):

### ✨ Core Architectural Upgrades

🛡️ **Context Firewalls (Domain Agents)** — *Roadmap (see [parity plan](opencode-parity-plan.md), Phase A).*
Heavy MCPs stay off the Orchestrator. Instead of giving Codex the `chrome-devtools` MCP directly, a dedicated domain agent (today **`@designer`**, target rename **`@browser`**) runs on a large-context model (e.g. Gemini 3.1 Pro), absorbs visual/DOM noise internally, and returns only a dense text summary to the Orchestrator.

🤝 **The Advisor Pattern (Synchronous Delegation)** — *Roadmap (Phase B).*
Replace awkward async-only delegation with **Advisor**-style calls: the Orchestrator delegates to a sub-agent and, when `run_in_background` is false, receives the result inline without leaving the conversational loop. Today, background tasks exist; unified `delegate_task` with sync mode is planned.

👀 **The Monitor Tool (Event-Driven Wakeups)** — *Roadmap (Phase C).*
Avoid token-heavy polling loops. The Monitor tool will let the Orchestrator attach a detached script (e.g. `tail -f | grep 'Error'`); on match, OpenCode injects a `<system-reminder>` to wake the Orchestrator.

---

## 🏛️ Agent Roles

| Agent | Model (copilot preset) | Role & isolated MCPs |
| :--- | :--- | :--- |
| **@orchestrator** | `gpt-5.3-codex` | **The Brain.** Answers simple queries; delegates heavy work. *No heavy MCPs — pristine context.* |
| **@browser** | `gemini-3.1-pro-preview` | **Visual / UI path.** Holds `chrome-devtools` behind a context firewall. |
| **@ops** | `gemini-3-flash-preview` | **Execution / ops path.** Builds, logs, `bash`, `monitor`. |
| **@explorer** | `gemini-3-flash-preview` | **Codebase scout.** Holds `serena`, `morph-mcp`. |
| **@designer** | `gemini-3.1-pro-preview` | **UI/UX specialist.** Design frameworks and implementation. |
| **@oracle** | `claude-opus-4.6` | **Deep reasoning** for hard bugs and architecture. |

---

## 📦 Installation & Setup

### Quick Start

```bash
bunx po-po-code@latest install
```

The installer defaults to the **copilot** preset (Codex orchestrator + Gemini sub-agents via GitHub Copilot). To use a different provider:

```bash
bunx po-po-code@latest install --preset=openai
bunx po-po-code@latest install --preset=copilot
bunx po-po-code@latest install --preset=kimi
bunx po-po-code@latest install --preset=zai-plan
```

### Configuration files

Config files (JSONC supported) are written to:

- **User:** `~/.config/opencode/po-po-code.jsonc`
- **Project:** `.opencode/po-po-code.jsonc`

Project config overrides user config. See [docs/configuration.md](docs/configuration.md) for the full layering story.

### Copilot preset (default)

The `copilot` preset keeps the Orchestrator lean while sub-agents use large-context Gemini models for context firewalls:

```jsonc
{
  "preset": "copilot",
  "agents": {
    "orchestrator": {
      "model": "github-copilot/gpt-5.3-codex",
      "temperature": 1,
      "variant": "high",
      "mcps": [] // Pristine context
    },
    "browser": {
      "model": "google/gemini-3.1-pro-preview",
      "temperature": 1,
      "mcps": ["chrome-devtools"] // Context firewall
    },
    "ops": {
      "model": "github-copilot/gemini-3-flash-preview",
      "temperature": 1,
      "mcps": []
    },
    "explorer": {
      "model": "github-copilot/gemini-3-flash-preview",
      "temperature": 1,
      "mcps": ["serena", "morph-mcp"]
    }
  }
}
```

To override individual agents without changing presets, add entries under `"agents"` — they merge on top of the active preset.

---

## 🗺️ Roadmap (Claude Code Parity)

Detailed tasks live in [opencode-parity-plan.md](opencode-parity-plan.md). Summary:

| Phase | Focus | Notes |
| :--- | :--- | :--- |
| **A** | Domain agents & context firewalls | Rename `designer`→`browser`, `fixer`→`ops`; orchestrator prompt firewall rules. |
| **B** | Advisor pattern | `delegate_task` with `run_in_background`; sync delegation path. |
| **C** | Monitor tool | Detached scripts, stdout triggers, `<system-reminder>` wakeups. |
| **D** | System reminders & caching | `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`; hooks use `<system-reminder>` consistently. |
| **E** | Memory & cost | Tiered `CLAUDE.md` hierarchy; cost visibility for large-context sub-agents. |

---

## 🛠️ Usage Examples (Target Flows)

These illustrate the **intended** UX once Phases A–C land; behavior today follows the current tools and background-task model.

### The Monitor Pattern

> "Start the NextJS dev server. Monitor the output, and wake up to fix any TypeScript errors that appear in the logs."

**Target:** the ops-path agent runs the dev server, attaches a Monitor to stdout, and wakes the Orchestrator when a trigger matches — without LLM polling loops.

### The Context Firewall Pattern

> "Check why the login button isn't working on localhost:3000."

**Target:** the Orchestrator delegates to the browser-path agent, which uses Chrome DevTools and returns a short text diagnosis (e.g. a CORS error) so the Orchestrator never ingests a multi-megabyte screenshot.

---

## 🙏 Credits & Upstream

**Po-po-code** is a specialized, heavily opinionated fork of **[oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim)**, which itself descends from **[oh-my-opencode](https://github.com/alvinunreal/oh-my-opencode)** created by Alvin and the Boring Dystopia Development team.

While the upstream project focuses on a broad, highly customizable agent suite with TUI multiplexing, **Po-po-code** strips away generic roles to focus on replicating the tight, autonomous, CLI-native developer experience of Anthropic's Claude Code using context firewalls and the parity roadmap above.

Huge thanks to the original contributors for building the foundation and hook system that makes this architectural direction possible.

---

<p align="center"><i>"To make every token valuable, to make every cache hit, and to make every layer of extension a seamless integration."</i></p>

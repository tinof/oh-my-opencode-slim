# OpenCode + oh-my-opencode-slim: Claude Code Parity Plan

**Author:** Tino (with Claude analysis)
**Date:** April 2026
**Target Stack:** Python, Rust, NextJS, Linux Server Ops
**Platform:** OpenCode with oh-my-opencode-slim plugin

---

## Executive Summary

This plan addresses orchestration friction and context flooding observed when comparing `oh-my-opencode-slim` to Anthropic's **Claude Code** (based on its source code leak and the newly announced Monitor & Advisor tools).

Initially, this project treated multi-agent delegation strictly as asynchronous "background tasks," which caused hesitation in the Orchestrator. Furthermore, exposing heavy MCPs (like Chrome DevTools with 50+ tools and 2MB screenshots) directly to the Orchestrator caused severe context flooding. 

This updated architecture pivots to:
1. **Context Firewalls:** Domain-specific sub-agents (e.g., `@browser`, `@ops`) that consume heavy MCP outputs (using Gemini's 1M-token multimodal context) and return only dense text summaries to the Orchestrator (Codex 5.3).
2. **The Advisor Pattern:** Synchronous sub-agent delegation for fluid, inline consultation.
3. **The Monitor Tool:** Event-driven script polling that wakes the Orchestrator up, replacing token-heavy LLM polling loops.

---

# Part 1: Current Architecture State

## 1.1 Tool Integration Layer
*   **Serena MCP:** Structural Code Navigation (LSP-level go-to-definition, references).
*   **MorphLLM Plugin** (`@morphllm/opencode-morph-plugin`): WarpGrep codebase/GitHub search + `morph_edit` (FastApply) + automatic context compaction. Installed as an Opencode plugin (not an MCP server).

## 1.2 Plugin Modifications (Active)
*   **Explorer Agent:** Broad-to-narrow search workflow defined.
*   **Orchestrator:** Basic delegation logic implemented.
*   **Project Context Hook:** Auto-detects `AGENTS.md` and `codemap.md` at session start.

---

# Part 2: The "Leak-Informed" & "Monitor" Gaps

### Gap 1: Context Flooding vs. Context Firewalls
**What happens now:** Heavy MCPs (like Chrome DevTools) flood the Orchestrator's context with huge schemas, base64 images, and massive logs, paralyzing Codex 5.3.
**The Fix:** Add `@browser` for heavy MCPs, rename `@fixer` to `@ops`, and strictly repurpose `@designer` as a UI/UX specialist with exclusive access to heavy design frameworks. This prevents the Orchestrator from loading 50 Chrome tools or massive typography/CSS rule markdown files.

### Gap 2: LLM Polling vs. Event-Driven Wakeups (The Monitor Tool)
**What happens now:** The Orchestrator has to write loops to check if a server is up or if a build failed, burning tokens.
**The Fix:** Anthropic's new "Monitor tool". The Orchestrator delegates a detached bash script (`tail -f | grep 'Error'`). When the condition is met, the script pipes an event back to OpenCode, injecting a `<system-reminder>` to "wake up" the Orchestrator.

### Gap 3: Pure Async vs. Advisor Pattern (Sync Delegation)
**What happens now:** `background_task` forces all delegation into an async task manager, making it clunky for quick lookups.
**The Fix:** A unified `delegate_task` tool with `run_in_background: boolean`. If false, the sub-agent executes synchronously, acting as an inline "Advisor".

### Gap 4: System Prompt Caching Boundaries
**What happens now:** Prompts append linearly, causing cache misses when dynamic state changes.
**The Fix:** Split prompts into static/dynamic parts using `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`.

### Gap 5: Context Injection Standard (`<system-reminder>`)
**What happens now:** Ad-hoc text appending for project context.
**The Fix:** Universal use of `<system-reminder>` tags for all injected context (memory, git status, monitor alerts).

### Gap 6: Skill-Binding (Context Bloat from Global Skills)
**What happens now:** Installing a skill globally bloats the Orchestrator's context window with large skill prompts and tool definitions that are only relevant to a specific domain.
**The Fix:** Skill-Binding Strategy. Bind specific skills exclusively to sub-agents (e.g., `impeccable` to `@designer`). The Orchestrator automates delegation to the sub-agent instead of executing the skill itself, keeping its own context lean.

---

# Part 3: Forward Roadmap

## Phase A: Domain Agents & Context Firewalls ✅ Complete
- [x] Created `@browser` agent (`src/agents/browser.ts`) with exclusive `chrome-devtools` MCP access.
- [x] Renamed `@fixer` → `@ops` (`src/agents/ops.ts`) for builds, logs, bash, and monitoring.
- [x] Repurposed `@designer` as the exclusive owner of the `impeccable` design skill suite.
- [x] Merged `@librarian` into `@explorer` (Context7, grep.app access moved to explorer).
- [x] Updated `constants.ts` (`SUBAGENT_NAMES`, `DEFAULT_MODELS`, `ORCHESTRATABLE_AGENTS`, `SUBAGENT_DELEGATION_RULES`), `agent-mcps.ts`, schema, tests, and orchestrator prompt.
- [x] Removed old `fixer`/`librarian` agent files and all references.
- [x] Orchestrator prompt enforces Context Firewall: "NEVER consume raw screenshots or heavy logs yourself."
- [x] Orchestrator MCP default set to `[]` (strict firewall — no MCPs leak to the Orchestrator).

## Phase B: The Advisor Pattern ✅ Complete
- [x] Created `src/tools/delegate.ts` with `delegate_task` tool.
- [x] Implemented `delegate_task` schema: `description`, `prompt`, `agent`, and `run_in_background`.
- [x] Synchronous execution for `run_in_background: false` (Advisor mode) using `extractSessionResult`.
- [x] Deleted `src/tools/background.ts` — fully superseded by `delegate.ts`.
- [x] Orchestrator prompt documents `delegate_task` usage (Advisor vs. background mode).

## Phase C: The Monitor Tool ✅ Complete
- [x] Created `src/tools/monitor.ts` with `create_monitor` tool.
- [x] Schema: `script` (bash command), `trigger_condition` (stdout regex), `event_name`.
- [x] Spawns a detached Node `child_process`. On match, injects `<system-reminder> MONITOR ALERT: [event_name] ... </system-reminder>` into the active session via the OpenCode SDK.
- [x] Orchestrator prompt documents `create_monitor` usage (event-driven wakeups, no polling loops).

## Phase D: Standardizing System Reminders & Caching (Medium Priority)
- [ ] Update hooks (`project-context`, `post-edit-nudge`) to use `<system-reminder>`.
- [ ] Implement `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` in system prompts.

## Phase E: Hierarchical Memory & Cost Tracking (Low Priority)
- [ ] Update project context to support 4-tier `CLAUDE.md` hierarchy.
- [ ] Implement recursive cost tracking for 1M-token Gemini sub-agents.
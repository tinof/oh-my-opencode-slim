# Agent Coding Guidelines

This document provides guidelines for AI agents operating in this repository.

## Project Overview

**oh-my-opencode-slim** - A lightweight agent orchestration plugin for OpenCode, a slimmed-down fork of oh-my-opencode. Built with TypeScript, Bun, and Biome. This fork (maintained by [@tinof](https://github.com/tinof)) includes the [OpenCode Parity Plan](opencode-parity-plan.md) for achieving Claude Code-level capabilities.

## Commands

| Command | Description |
|---------|-------------|
| `bun run build` | Build TypeScript to `dist/` (both index.ts and cli/index.ts) |
| `bun run typecheck` | Run TypeScript type checking without emitting |
| `bun test` | Run all tests with Bun |
| `bun run lint` | Run Biome linter on entire codebase |
| `bun run format` | Format entire codebase with Biome |
| `bun run check` | Run Biome check with auto-fix (lint + format + organize imports) |
| `bun run check:ci` | Run Biome check without auto-fix (CI mode) |
| `bun run dev` | Build and run with OpenCode |

**Running a single test:** Use Bun's test filtering with the `-t` flag:
```bash
bun test -t "test-name-pattern"
```

## Code Style

### General Rules
- **Formatter/Linter:** Biome (configured in `biome.json`)
- **Line width:** 80 characters
- **Indentation:** 2 spaces
- **Line endings:** LF (Unix)
- **Quotes:** Single quotes in JavaScript/TypeScript
- **Trailing commas:** Always enabled

### TypeScript Guidelines
- **Strict mode:** Enabled in `tsconfig.json`
- **No explicit `any`:** Generates a linter warning (disabled for test files)
- **Module resolution:** `bundler` strategy
- **Declarations:** Generate `.d.ts` files in `dist/`

### Imports
- Biome auto-organizes imports on save (`organizeImports: "on"`)
- Let the formatter handle import sorting
- Use path aliases defined in TypeScript configuration if present

### Naming Conventions
- **Variables/functions:** camelCase
- **Classes/interfaces:** PascalCase
- **Constants:** SCREAMING_SNAKE_CASE
- **Files:** kebab-case for most, PascalCase for React components

### Error Handling
- Use typed errors with descriptive messages
- Let errors propagate appropriately rather than catching silently
- Use Zod for runtime validation (already a dependency)

### Git Integration
- Biome integrates with git (VCS enabled)
- Commits should pass `bun run check:ci` before pushing

## Project Structure

```
oh-my-opencode-slim/
├── src/
│   ├── agents/          # Agent system prompts (orchestrator, librarian, fixer, etc.)
│   ├── background/      # Background task manager + tmux session manager
│   ├── config/          # Plugin configuration schema, loader, agent-MCP mappings
│   ├── hooks/           # Event hooks (JSON error recovery, post-read nudge, etc.)
│   ├── mcp/             # Built-in MCP configs (linkup, context7, grep_app)
│   ├── skills/          # Agent skills (included in package publish)
│   ├── tools/           # Tool definitions (background tasks, LSP, etc.)
│   ├── utils/           # Utilities (tmux, logging, etc.)
│   ├── cli/             # CLI entry point (src/cli/index.ts)
│   └── index.ts         # Main plugin export + event wiring
├── dist/                # Built JavaScript and declarations
├── biome.json           # Biome configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project manifest and scripts
```

## Key Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `@opencode-ai/sdk` - OpenCode AI SDK
- `zod` - Runtime validation
- `vscode-jsonrpc` / `vscode-languageserver-protocol` - LSP support

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LINKUP_API_KEY` | Yes | API key for Linkup MCP (web search + URL fetching) |
| `CONTEXT7_API_KEY` | Optional | API key for Context7 MCP (higher rate limits for library docs) |

## Built-in MCP Architecture

The plugin manages three built-in MCPs that are distributed to sub-agents:

| MCP | Endpoint | Tools | Description |
|-----|----------|-------|-------------|
| `linkup` | `mcp.linkup.so` | `linkup-search`, `linkup-fetch` | Real-time web search + URL content extraction |
| `context7` | `mcp.context7.com` | `resolve-library-id`, `query-docs` | Library documentation + code examples |
| `grep_app` | `mcp.grep.app` | `searchGitHub` | Code search across 1M+ public GitHub repos |

### Agent MCP Distribution

| Agent | MCPs | Rationale |
|-------|------|-----------|
| **Orchestrator** | `linkup` | URL fetching for targeted reads; web search when delegation is overkill |
| **@librarian** | `linkup`, `context7`, `grep_app` | Full research stack: web search, library docs, GitHub examples |
| **@oracle** | `linkup` | Independent web research for architectural decisions |
| **@fixer** | _(none)_ | Execution-only, no research allowed |
| **@explorer** | _(none)_ | Local codebase tools only (warpgrep, Serena, ast_grep) |
| **@designer** | _(none)_ | UI/UX implementation only |

Configuration: `src/config/agent-mcps.ts` (defaults), overridable per-user via plugin config.

## Background Task Timeouts

Background tasks have per-agent timeouts and stall detection (`src/background/background-manager.ts`).

### Default Timeouts

| Agent | Timeout | Rationale |
|-------|---------|-----------|
| @fixer | 3 min | Execution-only, should be fast |
| @explorer, @librarian, @designer | 5 min | Standard research/work |
| @oracle | 10 min | Deep analysis |

### Stall Detection

If a background task has no tool activity for **2 minutes**, it's automatically cancelled. Activity is tracked via the `tool.execute.after` hook in `src/index.ts`.

### Configuration

Timeouts are configurable via the plugin's `background` config:
```jsonc
{
  "background": {
    "agentTimeouts": { "fixer": 180000, "explorer": 300000 },
    "stallTimeoutMs": 120000
  }
}
```

## Development Workflow

1. Make code changes
2. Run `bun run check:ci` to verify linting and formatting
3. Run `bun run typecheck` to verify types
4. Run `bun test` to verify tests pass
5. Commit changes

## Tmux Session Lifecycle Management

When working with tmux integration, understanding the session lifecycle is crucial for preventing orphaned processes and ghost panes.

### Session Lifecycle Flow

```
Task Launch:
  session.create() → tmux pane spawned → task runs

Task Completes Normally:
  session.status (idle) → extract results → session.abort()
  → session.deleted event → tmux pane closed

Task Cancelled:
  cancel() → session.abort() → session.deleted event
  → tmux pane closed

Session Deleted Externally:
  session.deleted event → task cleanup → tmux pane closed
```

### Key Implementation Details

**1. Graceful Shutdown (src/utils/tmux.ts)**
```typescript
// Always send Ctrl+C before killing pane
spawn([tmux, "send-keys", "-t", paneId, "C-c"])
await delay(250)
spawn([tmux, "kill-pane", "-t", paneId])
```

**2. Session Abort Timing (src/background/background-manager.ts)**
- Call `session.abort()` AFTER extracting task results
- This ensures content is preserved before session termination
- Triggers `session.deleted` event for cleanup

**3. Event Handlers (src/index.ts)**
Both handlers must be wired up:
- `backgroundManager.handleSessionDeleted()` - cleans up task state
- `tmuxSessionManager.onSessionDeleted()` - closes tmux pane

### Testing Tmux Integration

After making changes to session management:

```bash
# 1. Build the plugin
bun run build

# 2. Run from local fork (in ~/.config/opencode/opencode.jsonc):
# "plugin": ["file:///path/to/oh-my-opencode-slim"]

# 3. Launch test tasks
@explorer count files in src/
@librarian search for Bun documentation

# 4. Verify no orphans
ps aux | grep "opencode attach" | grep -v grep
# Should return 0 processes after tasks complete
```

### Common Issues

**Ghost panes remaining open:**
- Check that `session.abort()` is called after result extraction
- Verify `session.deleted` handler is wired in src/index.ts

**Orphaned opencode attach processes:**
- Ensure graceful shutdown sends Ctrl+C before kill-pane
- Check that tmux pane closes before process termination

## Pre-Push Code Review

Before pushing changes to the repository, always run a code review to catch issues like:
- Duplicate code
- Redundant function calls
- Race conditions
- Logic errors

### Using `/review` Command (Recommended)

OpenCode has a built-in `/review` command that automatically performs comprehensive code reviews:

```bash
# Review uncommitted changes (default)
/review

# Review specific commit
/review <commit-hash>

# Review branch comparison
/review <branch-name>

# Review PR
/review <pr-url-or-number>
```

**Why use `/review` instead of asking @oracle manually?**
- Standardized review process with consistent focus areas (bugs, structure, performance)
- Automatically handles git operations (diff, status, etc.)
- Context-aware: reads full files and convention files (AGENTS.md, etc.)
- Delegates to specialized @build subagent with proper permissions
- Provides actionable, matter-of-fact feedback

### Workflow Before Pushing

1. **Make your changes**
   ```bash
   # ... edit files ...
   ```

2. **Stage changes**
   ```bash
   git add .
   ```

3. **Run code review**
   ```
   /review
   ```

4. **Address any issues found**

5. **Run checks**
   ```bash
   bun run check:ci
   bun test
   ```

6. **Commit and push**
   ```bash
   git commit -m "..."
   git push origin <branch>
   ```

**Note:** The `/review` command found issues in our PR #127 (duplicate code, redundant abort calls) that neither linter nor tests caught. Always use it before pushing!

## Common Patterns

- This is an OpenCode plugin - most functionality lives in `src/`
- The CLI entry point is `src/cli/index.ts`
- The main plugin export is `src/index.ts`
- Skills are located in `src/skills/` (included in package publish)
- Background task management is in `src/background/`
- Tmux utilities are in `src/utils/tmux.ts`

## OpenCode Parity Plan

This fork includes the **OpenCode Parity Plan** (`opencode-parity-plan.md`), a roadmap for closing the gap between OpenCode and Claude Code. Key integrations:

- **Serena MCP** — LSP-powered structural navigation (go-to-definition, find-references, rename)
- **MorphLLM MCP** — WarpGrep semantic search + FastApply file edits
- **Plugin enhancements** — Explorer rewrite, Orchestrator hardening, dynamic hooks, Opencode-DCP context compaction

Agents should be aware of the parity plan when making architectural decisions in this codebase.

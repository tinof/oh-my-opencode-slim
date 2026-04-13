# MCP Servers

Built-in Model Context Protocol (MCP) servers ship with po-po-code and give agents access to external tools — web search, library documentation, and code search.

---

## Built-in MCPs

| MCP | Purpose | Endpoint |
|-----|---------|----------|
| `linkup` | Real-time web search and URL content extraction via [Linkup](https://linkup.so) | `https://mcp.linkup.so/mcp` |
| `context7` | Official library documentation (up-to-date) | `https://mcp.context7.com/mcp` |
| `grep_app` | GitHub code search via grep.app | `https://mcp.grep.app` |

### Linkup Setup

Linkup requires an API key passed as a query parameter. Po-po-code handles the wiring automatically — just set the environment variable:

```bash
export LINKUP_API_KEY="your-api-key-here"  # add to ~/.zshrc to persist
```

Sign up at [linkup.so](https://linkup.so) — the free tier includes **$5 of credits per month**, which in practice is enough for heavy daily use.

---

## Default Permissions Per Agent

| Agent | Default MCPs |
|-------|-------------|
| `orchestrator` | none (strict context firewall) |
| `browser` | `chrome-devtools` |
| `ops` | none |
| `designer` | none |
| `oracle` | `serena`, `linkup`, `context7` |
| `explorer` | `serena`, `context7`, `grep_app` |

---

## Configuring MCP Access

Control which MCPs each agent can use via the `mcps` array in your config (`~/.config/opencode/po-po-code.jsonc` or `.opencode/po-po-code.jsonc`):

| Syntax | Meaning |
|--------|---------|
| `["*"]` | All MCPs |
| `["*", "!context7"]` | All MCPs except `context7` |
| `["linkup", "context7"]` | Only listed MCPs |
| `[]` | No MCPs |
| `["!*"]` | Deny all MCPs |

**Rules:**
- `*` expands to all available MCPs
- `!item` excludes a specific MCP
- Conflicts (e.g. `["a", "!a"]`) → deny wins

**Example:**

```jsonc
{
  "agents": {
    "orchestrator": {
      "mcps": []
    },
    "oracle": {
      "mcps": ["serena", "linkup", "context7"]
    },
    "explorer": {
      "mcps": ["serena", "context7", "grep_app", "linkup"]
    }
  }
}
```

---

## Disabling MCPs Globally

To disable specific MCPs for all agents regardless of config, add them to `disabled_mcps` at the root of your config:

```json
{
  "disabled_mcps": ["linkup"]
}
```

This is useful when you want to cut external network calls entirely (e.g. air-gapped environments or cost control).

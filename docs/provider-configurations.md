# Provider Configurations

po-po-code uses **OpenAI** as the default provider. This document shows how to configure alternative providers by editing your plugin config file.

## Config File Location

Edit `~/.config/opencode/po-po-code.jsonc` (or `.json`).

## Default: OpenAI

The installer generates this configuration automatically:

```json
{
  "preset": "openai",
  "presets": {
    "openai": {
      "orchestrator": { "model": "openai/gpt-5.4", "variant": "high", "skills": ["*"], "mcps": [] },
      "oracle": { "model": "openai/gpt-5.4", "variant": "high", "skills": [], "mcps": ["serena", "linkup", "context7"] },
      "explorer": { "model": "openai/gpt-5.4-mini", "variant": "low", "skills": [], "mcps": ["serena", "context7", "grep_app"] },
      "designer": { "model": "openai/gpt-5.4-mini", "variant": "medium", "skills": ["agent-browser"], "mcps": [] },
      "browser": { "model": "openai/gpt-5.4-mini", "variant": "low", "skills": [], "mcps": ["chrome-devtools"] },
      "ops": { "model": "openai/gpt-5.4-mini", "variant": "low", "skills": [], "mcps": [] }
    }
  }
}
```

## Kimi For Coding

To use Kimi, add a `kimi` preset and set it as active:

```json
{
  "preset": "kimi",
  "presets": {
    "kimi": {
      "orchestrator": { "model": "kimi-for-coding/k2p5", "variant": "high", "skills": ["*"], "mcps": [] },
      "oracle": { "model": "kimi-for-coding/k2p5", "variant": "high", "skills": [], "mcps": ["serena", "linkup", "context7"] },
      "explorer": { "model": "kimi-for-coding/k2p5", "variant": "low", "skills": [], "mcps": ["serena", "context7", "grep_app"] },
      "designer": { "model": "kimi-for-coding/k2p5", "variant": "medium", "skills": ["agent-browser"], "mcps": [] },
      "browser": { "model": "kimi-for-coding/k2p5", "variant": "low", "skills": [], "mcps": ["chrome-devtools"] },
      "ops": { "model": "kimi-for-coding/k2p5", "variant": "low", "skills": [], "mcps": [] }
    }
  }
}
```

Then authenticate:
```bash
opencode auth login
# Select "Kimi For Coding" provider
```

## GitHub Copilot

To use GitHub Copilot:

```json
{
  "preset": "copilot",
  "presets": {
    "copilot": {
      "orchestrator": { "model": "github-copilot/claude-opus-4.6", "variant": "high", "skills": ["*"], "mcps": [] },
      "oracle": { "model": "github-copilot/claude-opus-4.6", "variant": "high", "skills": [], "mcps": ["serena", "linkup", "context7"] },
      "explorer": { "model": "github-copilot/grok-code-fast-1", "variant": "low", "skills": [], "mcps": ["serena", "context7", "grep_app"] },
      "designer": { "model": "github-copilot/gemini-3.1-pro-preview", "variant": "medium", "skills": ["agent-browser"], "mcps": [] },
      "browser": { "model": "github-copilot/gemini-3.1-pro-preview", "variant": "low", "skills": [], "mcps": ["chrome-devtools"] },
      "ops": { "model": "github-copilot/claude-sonnet-4.6", "variant": "low", "skills": [], "mcps": [] }
    }
  }
}
```

Then authenticate:
```bash
opencode auth login
# Select "github-copilot" provider
```

## ZAI Coding Plan

To use ZAI Coding Plan with GLM 5:

```json
{
  "preset": "zai-plan",
  "presets": {
    "zai-plan": {
      "orchestrator": { "model": "zai-coding-plan/glm-5", "variant": "high", "skills": ["*"], "mcps": [] },
      "oracle": { "model": "zai-coding-plan/glm-5", "variant": "high", "skills": [], "mcps": ["serena", "linkup", "context7"] },
      "explorer": { "model": "zai-coding-plan/glm-5", "variant": "low", "skills": [], "mcps": ["serena", "context7", "grep_app"] },
      "designer": { "model": "zai-coding-plan/glm-5", "variant": "medium", "skills": ["agent-browser"], "mcps": [] },
      "browser": { "model": "zai-coding-plan/glm-5", "variant": "low", "skills": [], "mcps": ["chrome-devtools"] },
      "ops": { "model": "zai-coding-plan/glm-5", "variant": "low", "skills": [], "mcps": [] }
    }
  }
}
```

Then authenticate:
```bash
opencode auth login
# Select "zai-coding-plan" provider
```

## Mixing Providers

You can mix models from different providers across agents. Create a custom preset:

```json
{
  "preset": "my-mix",
  "presets": {
    "my-mix": {
      "orchestrator": { "model": "openai/gpt-5.4", "skills": ["*"], "mcps": [] },
      "oracle": { "model": "openai/gpt-5.4", "variant": "high", "skills": [], "mcps": ["serena", "linkup", "context7"] },
      "explorer": { "model": "github-copilot/grok-code-fast-1", "variant": "low", "skills": [], "mcps": ["serena", "context7", "grep_app"] },
      "designer": { "model": "kimi-for-coding/k2p5", "variant": "medium", "skills": ["agent-browser"], "mcps": [] },
      "browser": { "model": "kimi-for-coding/k2p5", "variant": "low", "skills": [], "mcps": ["chrome-devtools"] },
      "ops": { "model": "openai/gpt-5.4-mini", "variant": "low", "skills": [], "mcps": [] }
    }
  }
}
```

## Switching Presets

**Method 1: Edit the config file** — Change the `preset` field to match a key in your `presets` object.

**Method 2: Environment variable** (takes precedence over config file):
```bash
export PO_PO_CODE_PRESET=my-mix
opencode
```

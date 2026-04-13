# Author's Preset

This is the exact configuration the author runs day-to-day. It mixes three providers to get the best model for each role at the lowest cost: **OpenAI** for reasoning-heavy orchestration, **Fireworks AI (Kimi K2P5)** for fast/cheap breadth work, and **GitHub Copilot** for design.

---

## The Config

```jsonc
{
  "preset": "best",
  "presets": {
    "best": { "orchestrator": { "model": "openai/gpt-5.4", "skills": [ "*" ], "mcps": [ "*"] },
      "oracle": { "model": "openai/gpt-5.4", "variant": "high", "skills": [], "mcps": [] },
      "explorer": { "model": "fireworks-ai/accounts/fireworks/routers/kimi-k2p5-turbo", "variant": "low", "skills": [], "mcps": ["serena", "context7", "grep_app"] },
      "designer": { "model": "github-copilot/gemini-3.1-pro-preview", "skills": [ "agent-browser" ], "mcps": [] },
      "ops": { "model": "fireworks-ai/accounts/fireworks/routers/kimi-k2p5-turbo", "variant": "low", "skills": [], "mcps": [] },
      "browser": { "model": "github-copilot/gemini-3.1-pro-preview", "skills": [], "mcps": ["chrome-devtools"] }
    }
  },
  "multiplexer": {
    "type": "auto",
    "layout": "main-vertical",
    "main_pane_size": 60
  }
}
```

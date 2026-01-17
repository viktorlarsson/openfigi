---
"openfigi-mcp": patch
---

Fix workspace:* dependency resolution when publishing to npm

Uses bun publish which properly resolves workspace protocol references to actual version numbers.

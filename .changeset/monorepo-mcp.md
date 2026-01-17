---
"openfigi-sdk": minor
"openfigi-mcp": minor
---

Convert to monorepo structure with Turborepo and add MCP server package

- Restructure project as a monorepo using Turborepo for build orchestration
- Move existing SDK code to `packages/openfigi-sdk`
- Add new `openfigi-mcp` package providing Model Context Protocol server for OpenFIGI API
- MCP server exposes `map_identifiers` and `search` tools for AI assistants
- Update CI workflows and build configuration for monorepo setup

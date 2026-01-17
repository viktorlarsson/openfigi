# openfigi-mcp

## 0.3.0

### Minor Changes

- 0e5d6ec: feat: Smart ticker search with automatic securityType2 detection

  **SDK Changes:**

  - `searchByTicker` now automatically tries multiple `securityType2` values (Common Stock, Preference, Depositary Receipt, ETP) when no explicit type is specified
  - This fixes issues where preference shares (e.g., VOW3 GY, P911 GY) or other security types were not found
  - Users can still specify an explicit `securityType2` in the options to override auto-detection

  **MCP Changes:**

  - `search_by_ticker` tool now exposes `securityType2` as an optional parameter
  - `batch_search_auto_detect` now tries both "Common Stock" and "Preference" types for tickers, improving hit rate for batch operations
  - Updated tool descriptions to document the smart search behavior

  **Example:**

  ```typescript
  // Auto-detects security type (now finds preference shares automatically)
  const result = await searchByTicker("VOW3", "GY");

  // Or specify explicitly
  const result = await searchByTicker("VOW3", "GY", {
    securityType2: "Preference",
  });
  ```

### Patch Changes

- Updated dependencies [0e5d6ec]
  - openfigi-sdk@1.3.0

## 0.2.4

### Patch Changes

- eb180e9: Add MCP Registry support with mcpName field and server.json

## 0.2.3

### Patch Changes

- 4217cb1: Add fetch polyfill for Node.js 16+ compatibility using undici

## 0.2.2

### Patch Changes

- 57ce9f9: Add Node.js shebang for proper CLI execution via npx

## 0.2.1

### Patch Changes

- caab2bf: Fix publishing to use bun publish which properly resolves workspace:\* dependencies
- 123a66f: Fix workspace:\* dependency resolution when publishing to npm

  Uses bun publish which properly resolves workspace protocol references to actual version numbers.

## 0.2.0

### Minor Changes

- b28304c: Convert to monorepo structure with Turborepo and add MCP server package

  - Restructure project as a monorepo using Turborepo for build orchestration
  - Move existing SDK code to `packages/openfigi-sdk`
  - Add new `openfigi-mcp` package providing Model Context Protocol server for OpenFIGI API
  - MCP server exposes `map_identifiers` and `search` tools for AI assistants
  - Update CI workflows and build configuration for monorepo setup

### Patch Changes

- Updated dependencies [b28304c]
  - openfigi-sdk@1.2.0

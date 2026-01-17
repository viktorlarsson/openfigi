# openfigi-mcp

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

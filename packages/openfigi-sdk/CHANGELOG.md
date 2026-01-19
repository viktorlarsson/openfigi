# openfigi-sdk

## 1.3.1

### Patch Changes

- 451eeee: Add README.md to published package

## 1.3.0

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

## 1.2.0

### Minor Changes

- b28304c: Convert to monorepo structure with Turborepo and add MCP server package

  - Restructure project as a monorepo using Turborepo for build orchestration
  - Move existing SDK code to `packages/openfigi-sdk`
  - Add new `openfigi-mcp` package providing Model Context Protocol server for OpenFIGI API
  - MCP server exposes `map_identifiers` and `search` tools for AI assistants
  - Update CI workflows and build configuration for monorepo setup

## 1.1.1

### Patch Changes

- 0bea007: Add flexible string support to IdType and optionType fields

  - Add `(string & {})` pattern to `IdType` for flexible type inference when constructing MappingRequest arrays
  - Add `(string & {})` pattern to `optionType` field for consistency
  - Update test to validate empty idValue instead of invalid idType
  - Fixes TypeScript error when using string literals in request arrays without explicit typing

## 1.1.0

### Minor Changes

- b84bce5: Allow arbitrary strings for all API parameter types while preserving autocomplete

  This change updates all typed API parameters (ExchCode, Currency, MicCode, SecurityType, SecurityType2, MarketSector, StateCode) to accept arbitrary strings in addition to the known values. This provides:

  - Full autocomplete support for all known OpenFIGI API values
  - Forward compatibility if OpenFIGI adds new values without requiring SDK updates
  - Flexible runtime validation that accepts any string

  TypeScript types now use the `(string & {})` pattern, and Zod validators use `.or(z.string())`.

## 1.0.8

### Patch Changes

- 9f0c7f6: Migrate build tooling from tsup to tsdown and linting from biome to oxlint
- b937a0a: Added nodenext support

## 1.0.6

### Patch Changes

- 74fe787: getting the changeset to work

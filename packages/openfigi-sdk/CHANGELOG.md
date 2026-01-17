# openfigi-sdk

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

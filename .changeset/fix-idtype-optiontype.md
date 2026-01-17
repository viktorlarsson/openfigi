---
"openfigi-sdk": patch
---

Add flexible string support to IdType and optionType fields

- Add `(string & {})` pattern to `IdType` for flexible type inference when constructing MappingRequest arrays
- Add `(string & {})` pattern to `optionType` field for consistency
- Update test to validate empty idValue instead of invalid idType
- Fixes TypeScript error when using string literals in request arrays without explicit typing

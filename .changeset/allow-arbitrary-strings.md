---
"openfigi-sdk": minor
---

Allow arbitrary strings for all API parameter types while preserving autocomplete

This change updates all typed API parameters (ExchCode, Currency, MicCode, SecurityType, SecurityType2, MarketSector, StateCode) to accept arbitrary strings in addition to the known values. This provides:

- Full autocomplete support for all known OpenFIGI API values
- Forward compatibility if OpenFIGI adds new values without requiring SDK updates
- Flexible runtime validation that accepts any string

TypeScript types now use the `(string & {})` pattern, and Zod validators use `.or(z.string())`.

---
"openfigi-sdk": minor
"openfigi-mcp": minor
---

feat: Smart ticker search with automatic securityType2 detection

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
const result = await searchByTicker('VOW3', 'GY')

// Or specify explicitly
const result = await searchByTicker('VOW3', 'GY', { securityType2: 'Preference' })
```

---
"openfigi-mcp": patch
---

fix: support Bloomberg-style ticker format with Equity suffix

The identifier parser now correctly handles Bloomberg Terminal formats like:
- `P911 GY Equity`
- `VOW3 GY Equity`
- `AAPL US Equity`

The "Equity" suffix (and other market sectors like Corp, Govt, Curncy, etc.) is now stripped automatically, extracting just the ticker and exchange code.

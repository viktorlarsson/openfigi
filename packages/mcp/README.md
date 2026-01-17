# openfigi-mcp

MCP (Model Context Protocol) server for the OpenFIGI API. Map financial identifiers to FIGIs directly from Claude and other MCP-compatible AI assistants.

## Features

- **Search by identifier type**: ISIN, CUSIP, SEDOL, Ticker, Bloomberg ID
- **Auto-detection**: Automatically detect identifier types from text/CSV data
- **Ticker + Exchange**: Parse formats like `AAPL US`, `ABLI SS`, `VOD LN`
- **Batch operations**: Process up to 100 identifiers in a single request
- **Not Found reporting**: Clear indicators when identifiers don't exist
- **Reference resources**: Access identifier types, exchange codes, security types

## Installation

### Using npx (easiest)

No installation required - just configure Claude Desktop:

```json
{
  "mcpServers": {
    "openfigi": {
      "command": "npx",
      "args": ["openfigi-mcp"],
      "env": {
        "OPENFIGI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Global Installation

```bash
npm install -g openfigi-mcp
```

```json
{
  "mcpServers": {
    "openfigi": {
      "command": "openfigi-mcp",
      "env": {
        "OPENFIGI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Config file location:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

## Available Tools

### Search Tools

| Tool | Description | Example |
|------|-------------|---------|
| `search_by_isin` | Search by ISIN | `US0378331005` (Apple) |
| `search_by_cusip` | Search by CUSIP | `037833100` (Apple) |
| `search_by_sedol` | Search by SEDOL | `2046251` (Apple) |
| `search_by_ticker` | Search by ticker | `AAPL` with exchCode `US` |
| `search_by_bloomberg_id` | Search by Bloomberg ID | `BBG000B9XRY4` |

### Auto-Detection Tools

| Tool | Description |
|------|-------------|
| `search_auto_detect` | Auto-detect identifier type and search a single identifier |
| `parse_identifiers` | Parse CSV/text and detect identifier types (no API call) |
| `batch_search_auto_detect` | Parse and search multiple identifiers in one request |

### Utility Tools

| Tool | Description |
|------|-------------|
| `batch_mapping` | Map up to 100 identifiers with explicit types |
| `validate_identifier` | Validate identifier format without searching |
| `get_rate_limit_status` | Check current API rate limit status |

## Auto-Detection Examples

### Tickers with Exchange Codes

The tools recognize the Bloomberg Terminal format `TICKER EXCHANGE`:

```
Ticker
ABLI SS
ABSO SS
AAPL US
VOD LN
7203 JP
```

Common exchange codes:

| Code | Exchange |
|------|----------|
| `US` | United States |
| `SS` | Stockholm (Nasdaq Stockholm) |
| `LN` | London |
| `GY` | Germany (Xetra) |
| `JP` | Japan |
| `HK` | Hong Kong |
| `FP` | France (Euronext Paris) |

### Mixed Identifiers

The tools auto-detect different identifier types:

```
US0378331005      → ISIN [high confidence]
BBG000B9XRY4      → Bloomberg ID [high confidence]
AAPL US           → Ticker with exchange [high confidence]
037833100         → CUSIP [medium confidence]
2046251           → SEDOL [medium confidence]
AAPL              → Ticker [low confidence]
```

### Not Found Handling

When identifiers don't exist in OpenFIGI, the output clearly indicates:

**Single search:**
```
Detected type: TICKER (Exchange: SS) [high confidence]

⚠️ NOT FOUND: "BLABLABLA" on exchange SS returned no results.

No results found
```

**Batch search:**
```
Detected 3 identifiers:
  - Ticker: 3

[1] TICKER: AAPL [US]
Result 1:
  FIGI: BBG000B9XRY4
  Name: APPLE INC
  ...

---

[2] TICKER: INVALID [SS] ⚠️ NOT FOUND
No results found

---

[3] TICKER: MSFT [US]
Result 1:
  FIGI: BBG000BPH459
  ...

---
Results: 2 found, 1 not found

⚠️ Not found:
  - INVALID [SS]
```

## Available Resources

Access reference data via MCP resources:

| Resource URI | Description |
|--------------|-------------|
| `openfigi://identifier-types` | List of supported identifier types (ID_ISIN, ID_CUSIP, etc.) |
| `openfigi://exchange-codes` | Common exchange codes (US, SS, LN, etc.) |
| `openfigi://security-types` | Security type values (Common Stock, ETF, etc.) |
| `openfigi://market-sectors` | Market sector values (Equity, Corp, etc.) |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENFIGI_API_KEY` | Your OpenFIGI API key | No (but recommended) |

## API Key

Get your free API key at [openfigi.com/api](https://www.openfigi.com/api).

| | Without API Key | With API Key |
|---|-----------------|--------------|
| Rate Limit | 25 req/min | 250 req/min |

## License

MIT

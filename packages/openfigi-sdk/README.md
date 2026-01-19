# openfigi-sdk

Type-safe TypeScript SDK for the [OpenFIGI API](https://www.openfigi.com/api). Map financial identifiers (ISIN, CUSIP, SEDOL, Ticker, Bloomberg ID) to FIGIs.

## Installation

```bash
npm install openfigi-sdk
```

## Quick Start

```typescript
import { searchByISIN, searchByTicker, createClient } from 'openfigi-sdk'

// Search by ISIN (no API key required for basic usage)
const result = await searchByISIN('US0378331005')
console.log(result.data?.[0].figi) // BBG000B9XRY4

// Search by ticker with exchange code
const apple = await searchByTicker('AAPL', 'US')

// With API key for higher rate limits
const client = createClient({ apiKey: 'your-api-key' })
await client.searchByISIN('US0378331005')
```

## Features

- **Type-safe**: Full TypeScript support with Zod schema validation
- **Multiple identifier types**: ISIN, CUSIP, SEDOL, Ticker, Bloomberg ID
- **Smart ticker search**: Auto-detects security types (Common Stock, Preference, ETF, etc.)
- **Batch operations**: Map up to 100 identifiers in a single request
- **Rate limit handling**: Built-in retry logic with exponential backoff
- **Validation utilities**: Validate identifiers before making API calls

## API

### Search Functions

```typescript
// Search by ISIN
const result = await searchByISIN('US0378331005')

// Search by CUSIP
const result = await searchByCUSIP('037833100')

// Search by SEDOL
const result = await searchBySEDOL('2046251')

// Search by Ticker (auto-detects security type)
const result = await searchByTicker('AAPL', 'US')
const result = await searchByTicker('VOW3', 'GY') // Preference shares

// Search by Bloomberg ID
const result = await searchByBloombergId('BBG000B9XRY4')
```

### Batch Mapping

```typescript
import { mapping } from 'openfigi-sdk'

const results = await mapping([
  { idType: 'ID_ISIN', idValue: 'US0378331005' },
  { idType: 'ID_CUSIP', idValue: '037833100' },
  { idType: 'ID_EXCH_SYMBOL', idValue: 'AAPL', exchCode: 'US' },
])
```

### Client Configuration

```typescript
import { createClient } from 'openfigi-sdk'

const client = createClient({
  apiKey: 'your-api-key',    // Optional, increases rate limit
  timeout: 30000,            // Request timeout in ms (default: 30000)
  retryLimit: 3,             // Number of retries (default: 3)
  retryDelay: 1000,          // Base retry delay in ms (default: 1000)
})
```

### Validation Utilities

```typescript
import { isValidISIN, isValidCUSIP, isValidSEDOL, isValidBloombergId } from 'openfigi-sdk'

isValidISIN('US0378331005')     // true
isValidCUSIP('037833100')       // true
isValidSEDOL('2046251')         // true
isValidBloombergId('BBG000B9XRY4') // true
```

### Rate Limit Info

```typescript
import { getRateLimitInfo, searchByISIN } from 'openfigi-sdk'

await searchByISIN('US0378331005')
const info = getRateLimitInfo()
console.log(`${info?.remaining}/${info?.limit} requests remaining`)
```

## Exchange Codes

Common exchange codes for ticker searches:

| Code | Exchange |
|------|----------|
| `US` | United States |
| `LN` | London |
| `GY` | Germany (Xetra) |
| `SS` | Stockholm |
| `JP` | Japan |
| `HK` | Hong Kong |
| `FP` | France (Euronext Paris) |

## API Key

Get your free API key at [openfigi.com/api](https://www.openfigi.com/api).

| | Without API Key | With API Key |
|---|-----------------|--------------|
| Rate Limit | 25 req/min | 250 req/min |

## Error Handling

```typescript
import { searchByISIN, OpenFigiError, RateLimitError, ValidationError } from 'openfigi-sdk'

try {
  const result = await searchByISIN('US0378331005')
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`)
  } else if (error instanceof ValidationError) {
    console.log('Invalid input:', error.message)
  } else if (error instanceof OpenFigiError) {
    console.log('API error:', error.message, error.statusCode)
  }
}
```

## License

MIT

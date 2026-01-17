# openfigi-sdk

A modern, type-safe TypeScript SDK for the [OpenFIGI API](https://www.openfigi.com/api) - the free and open standard for financial instrument identification.

[![CI](https://github.com/viktorlarsson/openfigi/actions/workflows/ci.yml/badge.svg)](https://github.com/viktorlarsson/openfigi/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/openfigi-sdk.svg)](https://www.npmjs.com/package/openfigi-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **⚠️ Community Project Disclaimer**
> This is an **unofficial, community-maintained** TypeScript SDK for OpenFIGI. It is **not affiliated with or endorsed by OpenFIGI or Bloomberg**. This library is developed and maintained by the open-source community. For official support, please refer to the [OpenFIGI official documentation](https://www.openfigi.com/api).

## Features

- **Type-safe** - Full TypeScript support with comprehensive type definitions
- **Modern** - Built with latest technologies (Bun, Vitest, Biome, tsup)
- **Validated** - Runtime validation using Zod schemas
- **Resilient** - Built-in retry logic with exponential backoff
- **Rate Limiting** - Automatic rate limit handling
- **Developer Friendly** - Simple API with convenience methods
- **Well Tested** - Comprehensive test coverage
- **Tree-shakeable** - Optimized bundle size with ESM/CJS support

## Installation

```bash
# Using bun
bun add openfigi-sdk

# Using npm
npm install openfigi-sdk

# Using pnpm
pnpm add openfigi-sdk
```

## Quick Start

```typescript
import { searchByISIN, searchByCUSIP, searchByTicker, searchBySEDOL, searchByBloombergId, createClient } from 'openfigi-sdk'

// Use standalone functions (no API key required for public access)
const response = await searchByISIN('US0378331005')
console.log(response.data)

// Search by CUSIP
await searchByCUSIP('037833100')

// Search by ticker symbol
await searchByTicker('AAPL', 'US')

// Search by SEDOL
await searchBySEDOL('2046251')

// Search by Bloomberg ID
await searchByBloombergId('BBG000B9XRY4')

// Or create a client with custom configuration (e.g., API key for higher rate limits)
const client = createClient({
  apiKey: 'your-api-key-here',
  timeout: 60000
})

const result = await client.searchByISIN('US0378331005')
```

## API Reference

### Client Configuration

```typescript
interface ClientConfig {
  apiKey?: string        // OpenFIGI API key for higher rate limits
  baseUrl?: string       // API base URL (default: https://api.openfigi.com)
  timeout?: number       // Request timeout in ms (default: 30000)
  retryLimit?: number    // Number of retry attempts (default: 3)
  retryDelay?: number    // Initial retry delay in ms (default: 1000)
  userAgent?: string     // Custom user agent
}
```

### Batch Mapping

```typescript
import { mapping, createClient } from 'openfigi-sdk'

// Map multiple identifiers in a single request (max 100)
const requests = [
  { idType: 'ID_ISIN', idValue: 'US0378331005' },
  { idType: 'ID_CUSIP', idValue: '037833100' },
  { idType: 'ID_SEDOL', idValue: '2046251' }
]

// Using standalone function
const responses = await mapping(requests)

// Or with custom client
const client = createClient({ apiKey: 'your-key' })
const responses = await client.mapping(requests)

responses.forEach((response, index) => {
  if (response.data) {
    console.log(`Request ${index}:`, response.data)
  } else if (response.error) {
    console.error(`Request ${index} failed:`, response.error)
  }
})
```

### Advanced Search Options

```typescript
import { searchByISIN, mappingSingle } from 'openfigi-sdk'

// Search with additional filters
const response = await searchByISIN('US0378331005', {
  exchCode: 'US',
  currency: 'USD',
  marketSecDes: 'Equity',
  includeUnlistedEquities: false
})

// Custom mapping request
const response = await mappingSingle({
  idType: 'ID_BB_GLOBAL',
  idValue: 'BBG000B9XRY4',
  currency: 'USD',
  micCode: 'XNGS'
})
```

### Error Handling

```typescript
import { searchByISIN, OpenFigiError, RateLimitError, ValidationError } from 'openfigi-sdk'

try {
  const response = await searchByISIN('invalid-isin')
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limited. Retry after:', error.retryAfter)
  } else if (error instanceof ValidationError) {
    console.log('Invalid request:', error.message)
  } else if (error instanceof OpenFigiError) {
    console.log('API error:', error.message, error.statusCode)
  }
}
```

### Rate Limit Information

```typescript
import { searchByISIN, getRateLimitInfo } from 'openfigi-sdk'

// Check current rate limit status after any request
const response = await searchByISIN('US0378331005')
const rateLimitInfo = getRateLimitInfo()

if (rateLimitInfo) {
  console.log('Rate limit:', rateLimitInfo.limit)
  console.log('Remaining:', rateLimitInfo.remaining)
  console.log('Reset time:', rateLimitInfo.reset)
}
```

## Supported Identifier Types

- `ID_ISIN` - International Securities Identification Number
- `ID_CUSIP` - Committee on Uniform Securities Identification Procedures
- `ID_SEDOL` - Stock Exchange Daily Official List
- `ID_BB_GLOBAL` - Bloomberg Global Identifier
- `ID_EXCH_SYMBOL` - Exchange symbol/ticker
- `ID_BB_UNIQUE` - Bloomberg Unique Identifier
- `ID_WERTPAPIER` - Wertpapierkennnummer (German securities code)
- And many more...

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run tests with coverage
bun run test:coverage

# Build the library
bun run build

# Lint code
bun run lint

# Type check
bun run typecheck

# Generate documentation
bun run docs
```

## API Rate Limits

- **Without API Key**: Lower rate limit for public access
- **With API Key**: Higher rate limit for authenticated requests

To get an API key, sign up at [OpenFIGI.com](https://www.openfigi.com/).

## Contributing

This is a **community-driven project** and contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes and add tests
4. Add a changeset to describe your changes:
   ```bash
   bun run changeset
   ```
5. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

- **Adding changes**: Run `bun run changeset` to create a changeset describing your changes
- **Releasing**: When PRs with changesets are merged to main, a release PR is automatically created
- **Publishing**: Merging the release PR automatically publishes to npm and creates git tags

### Changeset Types

- `patch` - Bug fixes and small improvements
- `minor` - New features and enhancements
- `major` - Breaking changes

**Note**: This library is maintained by the community and is not affiliated with OpenFIGI or Bloomberg. For official API support, please contact OpenFIGI directly.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [OpenFIGI API Documentation](https://www.openfigi.com/api/documentation)
- [OpenFIGI Website](https://www.openfigi.com/)
- [GitHub Repository](https://github.com/viktorlarsson/openfigi)
- [npm Package](https://www.npmjs.com/package/openfigi-sdk)

## Acknowledgments

Built with modern tools and technologies:
- [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vitest](https://vitest.dev/) - Fast unit testing framework
- [Biome](https://biomejs.dev/) - Fast formatter and linter
- [tsdown](https://tsdown.dev/) - TypeScript bundler
- [Zod](https://zod.dev/) - TypeScript-first validation
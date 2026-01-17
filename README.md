# OpenFIGI

A modern, type-safe TypeScript SDK and MCP server for the [OpenFIGI API](https://www.openfigi.com/api) - the free and open standard for financial instrument identification.

[![CI](https://github.com/viktorlarsson/openfigi/actions/workflows/ci.yml/badge.svg)](https://github.com/viktorlarsson/openfigi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Community Project Disclaimer**
> This is an **unofficial, community-maintained** project for OpenFIGI. It is **not affiliated with or endorsed by OpenFIGI or Bloomberg**. For official support, please refer to the [OpenFIGI official documentation](https://www.openfigi.com/api).

## Packages

This monorepo contains two packages:

| Package | Version | Description |
|---------|---------|-------------|
| [openfigi-sdk](./packages/openfigi-sdk) | [![npm](https://badge.fury.io/js/openfigi-sdk.svg)](https://www.npmjs.com/package/openfigi-sdk) | TypeScript SDK for the OpenFIGI API |
| [openfigi-mcp](./packages/mcp) | [![npm](https://badge.fury.io/js/openfigi-mcp.svg)](https://www.npmjs.com/package/openfigi-mcp) | MCP server for Claude and AI assistants |

## openfigi-sdk

Type-safe TypeScript SDK with full API coverage.

```bash
npm install openfigi-sdk
```

```typescript
import { searchByISIN, searchByTicker, createClient } from 'openfigi-sdk'

// Search by ISIN
const response = await searchByISIN('US0378331005')

// Search by ticker
await searchByTicker('AAPL', 'US', { securityType2: 'Common Stock' })

// With API key for higher rate limits
const client = createClient({ apiKey: 'your-api-key' })
await client.searchByISIN('US0378331005')
```

[Full SDK documentation →](./packages/openfigi-sdk/README.md)

## openfigi-mcp

MCP (Model Context Protocol) server for using OpenFIGI with Claude and other AI assistants.

```bash
npm install openfigi-mcp
```

Add to Claude Desktop config:
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

Features:
- **Auto-detection**: Parse CSV/text and detect identifier types (ISIN, CUSIP, SEDOL, Bloomberg ID, Ticker)
- **Batch operations**: Process up to 100 identifiers at once
- **Ticker + Exchange**: Supports formats like `AAPL US`, `ABLI SS`, `VOD LN`

### Using with Vercel AI SDK

#### AI SDK 5.x (experimental)

```typescript
import { experimental_createMCPClient as createMCPClient } from 'ai'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

const mcpClient = await createMCPClient({
  transport: new StdioClientTransport({
    command: 'npx',
    args: ['openfigi-mcp'],
    env: { OPENFIGI_API_KEY: process.env.OPENFIGI_API_KEY }
  }),
})

const tools = await mcpClient.tools()

const { text } = await generateText({
  model: anthropic('claude-sonnet-4-20250514'),
  tools,
  prompt: 'Find the FIGI for Apple Inc using ISIN US0378331005',
})

await mcpClient.close()
```

#### AI SDK 6.x

```typescript
import { createMCPClient } from '@ai-sdk/mcp'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

const mcpClient = await createMCPClient({
  transport: new StdioClientTransport({
    command: 'npx',
    args: ['openfigi-mcp'],
    env: { OPENFIGI_API_KEY: process.env.OPENFIGI_API_KEY }
  }),
})

const tools = await mcpClient.tools()

const { text } = await generateText({
  model: anthropic('claude-sonnet-4-20250514'),
  tools,
  maxSteps: 5,
  prompt: 'Search for Volkswagen preferred shares (VOW3) on the German exchange',
})

await mcpClient.close()
```

[Full MCP documentation →](./packages/mcp/README.md)

## Development

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run all tests
bun run test

# Type check
bun run typecheck

# Lint
bun run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes and add tests
4. Add a changeset: `bun run changeset`
5. Commit and push
6. Open a Pull Request

### Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for version management. When PRs with changesets are merged, a release PR is automatically created. Merging the release PR publishes to npm.

## License

MIT - see [LICENSE](LICENSE)

## Links

- [OpenFIGI API Documentation](https://www.openfigi.com/api/documentation)
- [OpenFIGI Website](https://www.openfigi.com/)
- [GitHub Repository](https://github.com/viktorlarsson/openfigi)

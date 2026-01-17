#!/usr/bin/env node
import './polyfill.js'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { toolDefinitions, handleTool } from './tools/index.js'
import { resourceDefinitions, handleResource } from './resources/index.js'
import { createHttpServer } from './http.js'

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    transport: 'stdio' as 'stdio' | 'http',
    port: 3000,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--http' || arg === '-h') {
      options.transport = 'http'
    } else if (arg === '--port' || arg === '-p') {
      options.transport = 'http'
      const port = parseInt(args[++i], 10)
      if (!isNaN(port)) {
        options.port = port
      }
    } else if (arg === '--help') {
      console.log(`
OpenFIGI MCP Server

Usage: openfigi-mcp [options]

Options:
  --http, -h       Use HTTP/SSE transport instead of stdio
  --port, -p NUM   Port for HTTP server (default: 3000, implies --http)
  --help           Show this help message

Examples:
  openfigi-mcp                  # Run with stdio transport (default)
  openfigi-mcp --http           # Run with HTTP transport on port 3000
  openfigi-mcp --port 8080      # Run with HTTP transport on port 8080
`)
      process.exit(0)
    }
  }

  return options
}

// Create the MCP server
const server = new Server(
  {
    name: 'openfigi-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
)

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }
})

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  return handleTool(name, args ?? {})
})

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: resourceDefinitions.map((resource) => ({
      uri: resource.uri,
      name: resource.name,
      description: resource.description,
      mimeType: resource.mimeType,
    })),
  }
})

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params
  return handleResource(uri)
})

// Start the server
async function main() {
  const options = parseArgs()

  if (options.transport === 'http') {
    createHttpServer(server, options.port)
  } else {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error('OpenFIGI MCP server running on stdio')
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

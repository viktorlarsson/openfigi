---
"openfigi-mcp": minor
---

feat: add HTTP/SSE transport support

The MCP server now supports HTTP/SSE transport in addition to stdio:

- `openfigi-mcp` - Run with stdio transport (default, unchanged)
- `openfigi-mcp --http` - Run with HTTP/SSE transport on port 3000
- `openfigi-mcp --port 8080` - Run with HTTP/SSE transport on custom port

HTTP endpoints:
- `GET /sse` - SSE connection for receiving server messages
- `POST /messages?sessionId=X` - Send messages to the server
- `GET /health` - Health check endpoint

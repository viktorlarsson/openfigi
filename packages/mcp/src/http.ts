import express, { type Request, type Response } from 'express'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

const clients = new Map<string, SSEServerTransport>()

export function createHttpServer(server: Server, port: number = 3000) {
  const app = express()
  app.use(express.json())

  // SSE endpoint - clients connect here to receive server messages
  app.get('/sse', async (_req: Request, res: Response) => {
    const transport = new SSEServerTransport('/messages', res)
    const sessionId = transport.sessionId

    clients.set(sessionId, transport)

    res.on('close', () => {
      clients.delete(sessionId)
    })

    await server.connect(transport)
  })

  // Messages endpoint - clients send messages here
  app.post('/messages', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string

    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId query parameter' })
      return
    }

    const transport = clients.get(sessionId)

    if (!transport) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    await transport.handlePostMessage(req, res)
  })

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', sessions: clients.size })
  })

  return app.listen(port, () => {
    console.error(`OpenFIGI MCP server running on http://localhost:${port}`)
    console.error(`  SSE endpoint: http://localhost:${port}/sse`)
    console.error(`  Messages endpoint: http://localhost:${port}/messages`)
  })
}

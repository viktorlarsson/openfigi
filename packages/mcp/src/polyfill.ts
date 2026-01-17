// Polyfill fetch for Node.js < 18
if (typeof globalThis.fetch === 'undefined') {
  const { fetch, Headers, Request, Response } = await import('undici')
  Object.assign(globalThis, { fetch, Headers, Request, Response })
}

export {}

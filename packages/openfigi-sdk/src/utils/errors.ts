export class OpenFigiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message)
    this.name = 'OpenFigiError'
  }
}

export class RateLimitError extends OpenFigiError {
  constructor(
    message: string,
    public retryAfter?: number,
    statusCode?: number
  ) {
    super(message, statusCode)
    this.name = 'RateLimitError'
  }
}

export class ValidationError extends OpenFigiError {
  constructor(
    message: string,
    public errors?: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

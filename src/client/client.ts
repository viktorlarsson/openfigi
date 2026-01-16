import ky, { type HTTPError, type KyInstance } from 'ky'
import type { ClientConfig, MappingRequest, MappingResponse, RateLimitInfo } from '../types'
import { OpenFigiError, RateLimitError, ValidationError } from '../utils/errors'
import { exponentialBackoff, parseRateLimitHeaders, sleep } from '../utils/helpers'
import { ClientConfigSchema, MappingRequestSchema, MappingResponseSchema } from '../validators'

const DEFAULT_CONFIG: Required<ClientConfig> = {
  apiKey: '',
  baseUrl: 'https://api.openfigi.com',
  timeout: 30000,
  retryLimit: 3,
  retryDelay: 1000,
  userAgent: '@openfigi/sdk',
}

let currentRateLimitInfo: RateLimitInfo | undefined
let debugMode = false

/**
 * Enable or disable debug logging
 * @param enabled - Whether to enable debug mode
 */
export const setDebugMode = (enabled: boolean) => {
  debugMode = enabled
}

const log = (level: 'info' | 'warn' | 'error', message: string, ...args: unknown[]) => {
  if (!debugMode) return
  const prefix = `[@openfigi/sdk] [${level.toUpperCase()}]`
  console[level](prefix, message, ...args)
}

const createHttpClient = (config: Required<ClientConfig>): KyInstance => {
  return ky.create({
    prefixUrl: config.baseUrl,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': config.userAgent,
      ...(config.apiKey && { 'X-OPENFIGI-APIKEY': config.apiKey }),
    },
    retry: {
      limit: config.retryLimit,
      methods: ['get', 'post'],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
    },
    hooks: {
      beforeRequest: [
        (request) => {
          log('info', `Request: ${request.method} ${request.url}`)
        },
      ],
      beforeRetry: [
        async ({ error, retryCount }) => {
          const delay = exponentialBackoff(retryCount, config.retryDelay)
          log('warn', `Retry attempt ${retryCount} after ${delay}ms`, error.message)
          await sleep(delay)
        },
      ],
      afterResponse: [
        (_request, _options, response) => {
          const { limit, remaining, reset } = parseRateLimitHeaders(response.headers)
          if (limit !== undefined && remaining !== undefined && reset) {
            currentRateLimitInfo = { limit, remaining, reset }
            log('info', `Rate limit: ${remaining}/${limit} (resets: ${reset.toISOString()})`)
          }
          log('info', `Response: ${response.status} ${response.statusText}`)
          return response
        },
      ],
    },
  })
}

/**
 * Creates an OpenFIGI client with custom configuration
 *
 * @param config - Client configuration options
 * @returns An OpenFIGI client instance with all available methods
 *
 * @example
 * ```typescript
 * const client = createClient({
 *   apiKey: 'your-api-key',
 *   timeout: 60000
 * })
 * ```
 */
export const createClient = (config: ClientConfig = {}) => {
  const validation = ClientConfigSchema.safeParse(config)
  if (!validation.success) {
    const errors = validation.error.issues
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ')
    throw new ValidationError(`Invalid client configuration: ${errors}`, validation.error)
  }

  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const httpClient = createHttpClient(finalConfig)

  /**
   * Map multiple identifiers to FIGIs in a single request
   *
   * @param requests - Array of mapping requests (max 100)
   * @returns Array of mapping responses in the same order as requests
   * @throws {ValidationError} If requests are invalid
   * @throws {RateLimitError} If rate limit is exceeded
   * @throws {OpenFigiError} If API returns an error
   *
   * @example
   * ```typescript
   * const responses = await mapping([
   *   { idType: 'ID_ISIN', idValue: 'US0378331005' },
   *   { idType: 'ID_CUSIP', idValue: '037833100' }
   * ])
   * ```
   */
  const mapping = async (requests: MappingRequest[]): Promise<MappingResponse[]> => {
    if (!Array.isArray(requests) || requests.length === 0) {
      throw new ValidationError(
        'Requests must be a non-empty array. Provide at least one mapping request.'
      )
    }

    if (requests.length > 100) {
      throw new ValidationError(
        `Too many requests: ${requests.length}. Maximum 100 requests allowed per call. Split into multiple batches.`
      )
    }

    const validatedRequests = requests.map((req, index) => {
      const validation = MappingRequestSchema.safeParse(req)
      if (!validation.success) {
        const errors = validation.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')
        throw new ValidationError(
          `Invalid mapping request at index ${index}: ${errors}`,
          validation.error
        )
      }
      return validation.data
    })

    try {
      log('info', `Mapping ${validatedRequests.length} identifier(s)`)
      const response = await httpClient.post('v3/mapping', {
        json: validatedRequests,
      })

      const data = (await response.json()) as unknown

      if (!Array.isArray(data)) {
        throw new OpenFigiError(
          `Invalid API response: expected array but got ${typeof data}`,
          response.status,
          data
        )
      }

      const validatedResponses = data.map((item, index) => {
        const validation = MappingResponseSchema.safeParse(item)
        if (!validation.success) {
          log('warn', `Invalid response at index ${index}:`, item, validation.error)
          return item as MappingResponse
        }
        return validation.data
      })

      log('info', `Mapped ${validatedResponses.length} identifier(s) successfully`)
      return validatedResponses
    } catch (error) {
      if (error instanceof OpenFigiError) {
        throw error
      }

      if (error instanceof Error && 'response' in error) {
        const httpError = error as HTTPError
        const status = httpError.response?.status

        if (status === 429) {
          const retryAfter = httpError.response?.headers?.get('retry-after')
          throw new RateLimitError(
            'Rate limit exceeded. Please wait before making more requests.',
            retryAfter ? parseInt(retryAfter, 10) : undefined,
            status
          )
        }

        if (status === 400) {
          const body = await httpError.response?.text()
          throw new ValidationError(`Bad request: ${body || 'Invalid request format'}`)
        }

        if (status === 401) {
          throw new OpenFigiError('Authentication failed. Check your API key.', status)
        }

        if (status === 404) {
          throw new OpenFigiError('Endpoint not found. Please check the API version.', status)
        }

        throw new OpenFigiError(
          `Request failed with status ${status}: ${httpError.message}`,
          status,
          await httpError.response?.text()
        )
      }

      throw new OpenFigiError('Unexpected error occurred', undefined, error)
    }
  }

  /**
   * Map a single identifier to FIGI
   *
   * @param request - Single mapping request
   * @returns Mapping response
   *
   * @example
   * ```typescript
   * const response = await mappingSingle({
   *   idType: 'ID_ISIN',
   *   idValue: 'US0378331005'
   * })
   * ```
   */
  const mappingSingle = async (request: MappingRequest): Promise<MappingResponse> => {
    const responses = await mapping([request])
    return responses[0]
  }

  /**
   * Search for FIGI by ISIN
   *
   * @param isin - ISIN identifier (e.g., 'US0378331005')
   * @param options - Additional search options
   * @returns Mapping response with FIGI data
   *
   * @example
   * ```typescript
   * const result = await searchByISIN('US0378331005')
   * if (result.data) {
   *   console.log('FIGI:', result.data[0].figi)
   * }
   * ```
   */
  const searchByISIN = async (
    isin: string,
    options?: Partial<MappingRequest>
  ): Promise<MappingResponse> => {
    if (!isin || typeof isin !== 'string') {
      throw new ValidationError('ISIN must be a non-empty string')
    }
    return mappingSingle({
      idType: 'ID_ISIN',
      idValue: isin.trim(),
      ...options,
    })
  }

  /**
   * Search for FIGI by CUSIP
   *
   * @param cusip - CUSIP identifier (e.g., '037833100')
   * @param options - Additional search options
   * @returns Mapping response with FIGI data
   */
  const searchByCUSIP = async (
    cusip: string,
    options?: Partial<MappingRequest>
  ): Promise<MappingResponse> => {
    if (!cusip || typeof cusip !== 'string') {
      throw new ValidationError('CUSIP must be a non-empty string')
    }
    return mappingSingle({
      idType: 'ID_CUSIP',
      idValue: cusip.trim(),
      ...options,
    })
  }

  /**
   * Search for FIGI by SEDOL
   *
   * @param sedol - SEDOL identifier (e.g., '2046251')
   * @param options - Additional search options
   * @returns Mapping response with FIGI data
   */
  const searchBySEDOL = async (
    sedol: string,
    options?: Partial<MappingRequest>
  ): Promise<MappingResponse> => {
    if (!sedol || typeof sedol !== 'string') {
      throw new ValidationError('SEDOL must be a non-empty string')
    }
    return mappingSingle({
      idType: 'ID_SEDOL',
      idValue: sedol.trim(),
      ...options,
    })
  }

  /**
   * Search for FIGI by ticker symbol
   *
   * @param ticker - Ticker symbol (e.g., 'AAPL')
   * @param exchCode - Optional exchange code (e.g., 'US')
   * @param options - Additional search options
   * @returns Mapping response with FIGI data
   *
   * @example
   * ```typescript
   * const result = await searchByTicker('AAPL', 'US')
   * ```
   */
  const searchByTicker = async (
    ticker: string,
    exchCode?: string,
    options?: Partial<MappingRequest>
  ): Promise<MappingResponse> => {
    if (!ticker || typeof ticker !== 'string') {
      throw new ValidationError('Ticker must be a non-empty string')
    }
    return mappingSingle({
      idType: 'ID_EXCH_SYMBOL',
      idValue: ticker.trim().toUpperCase(),
      exchCode: exchCode?.trim(),
      ...options,
    })
  }

  /**
   * Search for FIGI by Bloomberg ID
   *
   * @param bbgId - Bloomberg Global ID (e.g., 'BBG000B9XRY4')
   * @param options - Additional search options
   * @returns Mapping response with FIGI data
   */
  const searchByBloombergId = async (
    bbgId: string,
    options?: Partial<MappingRequest>
  ): Promise<MappingResponse> => {
    if (!bbgId || typeof bbgId !== 'string') {
      throw new ValidationError('Bloomberg ID must be a non-empty string')
    }
    return mappingSingle({
      idType: 'ID_BB_GLOBAL',
      idValue: bbgId.trim(),
      ...options,
    })
  }

  /**
   * Get current rate limit information
   *
   * @returns Rate limit info if available, undefined if no requests made yet
   *
   * @example
   * ```typescript
   * const rateLimit = getRateLimitInfo()
   * if (rateLimit) {
   *   console.log(`${rateLimit.remaining} requests remaining`)
   * }
   * ```
   */
  const getRateLimitInfo = (): RateLimitInfo | undefined => {
    return currentRateLimitInfo
  }

  return {
    mapping,
    mappingSingle,
    searchByISIN,
    searchByCUSIP,
    searchBySEDOL,
    searchByTicker,
    searchByBloombergId,
    getRateLimitInfo,
  }
}

// Export standalone functions with default client
const defaultClient = createClient()

export const mapping = defaultClient.mapping
export const mappingSingle = defaultClient.mappingSingle
export const searchByISIN = defaultClient.searchByISIN
export const searchByCUSIP = defaultClient.searchByCUSIP
export const searchBySEDOL = defaultClient.searchBySEDOL
export const searchByTicker = defaultClient.searchByTicker
export const searchByBloombergId = defaultClient.searchByBloombergId
export const getRateLimitInfo = defaultClient.getRateLimitInfo

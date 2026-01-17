import {
  createClient,
  isValidISIN,
  isValidCUSIP,
  isValidSEDOL,
  isValidBloombergId,
  type MappingRequest,
  type MappingResponse,
  type FigiResult,
} from 'openfigi-sdk'

interface SearchFilters {
  exchCode?: string
  micCode?: string
  currency?: string
  marketSecDes?: string
  securityType?: string
  includeUnlistedEquities?: boolean
}

// Common filter properties for JSON schema
const filterProperties = {
  exchCode: {
    type: 'string',
    description: 'Exchange code filter (e.g., "US", "NASDAQ")',
  },
  micCode: {
    type: 'string',
    description: 'MIC code filter (e.g., "XNAS", "XNYS")',
  },
  currency: {
    type: 'string',
    description: 'Currency filter (e.g., "USD", "EUR")',
  },
  marketSecDes: {
    type: 'string',
    description: 'Market sector filter (e.g., "Equity", "Corp")',
  },
  securityType: {
    type: 'string',
    description: 'Security type filter (e.g., "Common Stock")',
  },
  includeUnlistedEquities: {
    type: 'boolean',
    description: 'Include unlisted equities',
  },
} as const

// Create client with API key from environment
const getClient = () => {
  const apiKey = process.env.OPENFIGI_API_KEY
  return createClient({ apiKey })
}

// Check if API key is configured
const hasApiKey = () => Boolean(process.env.OPENFIGI_API_KEY)

// Batch size limits based on API key presence
const getBatchSize = () => (hasApiKey() ? 100 : 10)

// Helper to chunk array into smaller batches
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// Extract filter properties from args
const extractFilters = (args: Record<string, unknown>): SearchFilters => ({
  exchCode: args.exchCode as string | undefined,
  micCode: args.micCode as string | undefined,
  currency: args.currency as string | undefined,
  marketSecDes: args.marketSecDes as string | undefined,
  securityType: args.securityType as string | undefined,
  includeUnlistedEquities: args.includeUnlistedEquities as boolean | undefined,
})

// Detect identifier type from a string
type IdentifierType = 'ISIN' | 'CUSIP' | 'SEDOL' | 'BLOOMBERG_ID' | 'TICKER' | 'UNKNOWN'

interface DetectedIdentifier {
  value: string
  type: IdentifierType
  exchCode?: string
  confidence: 'high' | 'medium' | 'low'
}

const detectIdentifierType = (identifier: string): DetectedIdentifier => {
  const trimmed = identifier.trim()

  // Check for ISIN (12 chars, 2 letter country code + 9 alphanumeric + 1 check digit)
  if (isValidISIN(trimmed)) {
    return { value: trimmed, type: 'ISIN', confidence: 'high' }
  }

  // Check for Bloomberg ID (starts with BBG)
  if (isValidBloombergId(trimmed)) {
    return { value: trimmed, type: 'BLOOMBERG_ID', confidence: 'high' }
  }

  // Check for CUSIP (9 alphanumeric)
  if (isValidCUSIP(trimmed)) {
    return { value: trimmed, type: 'CUSIP', confidence: 'medium' }
  }

  // Check for SEDOL (7 alphanumeric)
  if (isValidSEDOL(trimmed)) {
    return { value: trimmed, type: 'SEDOL', confidence: 'medium' }
  }

  // Check for ticker with exchange suffix (e.g., "AAPL US", "ABLI SS")
  const tickerWithExchange = trimmed.match(/^([A-Z0-9]+)\s+([A-Z]{2})$/i)
  if (tickerWithExchange) {
    return {
      value: tickerWithExchange[1].toUpperCase(),
      type: 'TICKER',
      exchCode: tickerWithExchange[2].toUpperCase(),
      confidence: 'high',
    }
  }

  // Check for simple ticker (all caps, 1-5 chars)
  if (/^[A-Z]{1,5}$/.test(trimmed)) {
    return { value: trimmed, type: 'TICKER', confidence: 'low' }
  }

  // Check for ticker with numbers (e.g., "BRK.A", "TSLA3")
  if (/^[A-Z0-9.]{1,10}$/i.test(trimmed)) {
    return { value: trimmed.toUpperCase(), type: 'TICKER', confidence: 'low' }
  }

  return { value: trimmed, type: 'UNKNOWN', confidence: 'low' }
}

// Parse CSV/text data and detect identifiers
const parseAndDetectIdentifiers = (
  text: string
): { identifiers: DetectedIdentifier[]; summary: string } => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  const identifiers: DetectedIdentifier[] = []
  const typeCounts: Record<IdentifierType, number> = {
    ISIN: 0,
    CUSIP: 0,
    SEDOL: 0,
    BLOOMBERG_ID: 0,
    TICKER: 0,
    UNKNOWN: 0,
  }

  // Check if first line looks like a header
  const firstLine = lines[0]?.trim().toLowerCase()
  const hasHeader =
    firstLine?.includes('ticker') ||
    firstLine?.includes('isin') ||
    firstLine?.includes('cusip') ||
    firstLine?.includes('sedol') ||
    firstLine?.includes('symbol') ||
    firstLine?.includes('identifier')

  const dataLines = hasHeader ? lines.slice(1) : lines

  for (const line of dataLines) {
    // Handle CSV/tab-separated: take first column
    const columns = line.split(/[,\t]/)
    const value = columns[0]?.trim()

    if (value && value.length > 0) {
      const detected = detectIdentifierType(value)
      identifiers.push(detected)
      typeCounts[detected.type]++
    }
  }

  const summary = [
    `Detected ${identifiers.length} identifiers:`,
    typeCounts.ISIN > 0 ? `  - ISIN: ${typeCounts.ISIN}` : null,
    typeCounts.CUSIP > 0 ? `  - CUSIP: ${typeCounts.CUSIP}` : null,
    typeCounts.SEDOL > 0 ? `  - SEDOL: ${typeCounts.SEDOL}` : null,
    typeCounts.BLOOMBERG_ID > 0
      ? `  - Bloomberg ID: ${typeCounts.BLOOMBERG_ID}`
      : null,
    typeCounts.TICKER > 0 ? `  - Ticker: ${typeCounts.TICKER}` : null,
    typeCounts.UNKNOWN > 0 ? `  - Unknown: ${typeCounts.UNKNOWN}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return { identifiers, summary }
}

// Format a mapping response for display
const formatResponse = (response: MappingResponse): string => {
  if (response.error) {
    return `Error: ${response.error}`
  }
  if (response.warning) {
    return `Warning: ${response.warning}`
  }
  if (!response.data || response.data.length === 0) {
    return 'No results found'
  }

  return response.data
    .map((result: FigiResult, index: number) => {
      const lines = [`Result ${index + 1}:`]
      lines.push(`  FIGI: ${result.figi}`)
      if (result.name) lines.push(`  Name: ${result.name}`)
      if (result.ticker) lines.push(`  Ticker: ${result.ticker}`)
      if (result.exchCode) lines.push(`  Exchange: ${result.exchCode}`)
      if (result.marketSector) lines.push(`  Market Sector: ${result.marketSector}`)
      if (result.securityType) lines.push(`  Security Type: ${result.securityType}`)
      if (result.compositeFIGI) lines.push(`  Composite FIGI: ${result.compositeFIGI}`)
      if (result.shareClassFIGI) lines.push(`  Share Class FIGI: ${result.shareClassFIGI}`)
      return lines.join('\n')
    })
    .join('\n\n')
}

// Tool definitions
export const toolDefinitions = [
  {
    name: 'search_by_isin',
    description:
      'Search for financial instruments by ISIN (International Securities Identification Number). Returns FIGI identifiers and instrument details.',
    inputSchema: {
      type: 'object',
      properties: {
        isin: {
          type: 'string',
          description: 'ISIN to search for (e.g., "US0378331005" for Apple)',
        },
        ...filterProperties,
      },
      required: ['isin'],
    },
  },
  {
    name: 'search_by_cusip',
    description:
      'Search for financial instruments by CUSIP (Committee on Uniform Securities Identification Procedures). Returns FIGI identifiers and instrument details.',
    inputSchema: {
      type: 'object',
      properties: {
        cusip: {
          type: 'string',
          description: 'CUSIP to search for (e.g., "037833100" for Apple)',
        },
        ...filterProperties,
      },
      required: ['cusip'],
    },
  },
  {
    name: 'search_by_sedol',
    description:
      'Search for financial instruments by SEDOL (Stock Exchange Daily Official List). Returns FIGI identifiers and instrument details.',
    inputSchema: {
      type: 'object',
      properties: {
        sedol: {
          type: 'string',
          description: 'SEDOL to search for (e.g., "2046251" for Apple)',
        },
        ...filterProperties,
      },
      required: ['sedol'],
    },
  },
  {
    name: 'search_by_ticker',
    description:
      'Search for financial instruments by ticker symbol. Returns FIGI identifiers and instrument details. Automatically tries multiple security types (Common Stock, Preference, Depositary Receipt, ETP) if not specified.',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Ticker symbol to search for (e.g., "AAPL", "VOW3", "RR.")',
        },
        exchCode: {
          type: 'string',
          description: 'Exchange code to narrow search (e.g., "US", "LN", "GY")',
        },
        securityType2: {
          type: 'string',
          description:
            'Security type filter. If not specified, automatically tries: Common Stock, Preference, Depositary Receipt, ETP. Examples: "Common Stock", "Preference", "Depositary Receipt", "ETP"',
        },
        micCode: filterProperties.micCode,
        currency: filterProperties.currency,
        marketSecDes: filterProperties.marketSecDes,
        securityType: filterProperties.securityType,
        includeUnlistedEquities: filterProperties.includeUnlistedEquities,
      },
      required: ['ticker'],
    },
  },
  {
    name: 'search_by_bloomberg_id',
    description:
      'Search for financial instruments by Bloomberg Global ID. Returns FIGI identifiers and instrument details.',
    inputSchema: {
      type: 'object',
      properties: {
        bloombergId: {
          type: 'string',
          description: 'Bloomberg Global ID to search for (e.g., "BBG000B9XRY4")',
        },
        ...filterProperties,
      },
      required: ['bloombergId'],
    },
  },
  {
    name: 'batch_mapping',
    description:
      'Map multiple financial identifiers to FIGIs in a single request. Supports up to 100 identifiers per request.',
    inputSchema: {
      type: 'object',
      properties: {
        identifiers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              idType: {
                type: 'string',
                description:
                  'Type of identifier (e.g., "ID_ISIN", "ID_CUSIP", "ID_SEDOL", "ID_EXCH_SYMBOL", "ID_BB_GLOBAL")',
              },
              idValue: {
                type: 'string',
                description: 'The identifier value',
              },
              exchCode: {
                type: 'string',
                description: 'Optional exchange code filter',
              },
            },
            required: ['idType', 'idValue'],
          },
          description: 'Array of identifiers to map (max 100)',
        },
      },
      required: ['identifiers'],
    },
  },
  {
    name: 'validate_identifier',
    description:
      'Validate the format of a financial identifier (ISIN, CUSIP, SEDOL, or Bloomberg ID).',
    inputSchema: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'The identifier to validate',
        },
        type: {
          type: 'string',
          enum: ['ISIN', 'CUSIP', 'SEDOL', 'BLOOMBERG_ID'],
          description: 'Type of identifier to validate',
        },
      },
      required: ['identifier', 'type'],
    },
  },
  {
    name: 'get_rate_limit_status',
    description: 'Get the current OpenFIGI API rate limit status.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'parse_identifiers',
    description:
      'Parse and auto-detect financial identifiers from CSV/text data. Supports tickers with exchange codes (e.g., "AAPL US", "ABLI SS"), ISINs, CUSIPs, SEDOLs, and Bloomberg IDs. Automatically detects the identifier type and extracts exchange codes when present.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description:
            'CSV or newline-separated text containing identifiers. Can include headers. Example: "Ticker\\nABLI SS\\nACE SS"',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'search_auto_detect',
    description:
      'Automatically detect the identifier type and search for a single financial instrument. Supports ISINs, CUSIPs, SEDOLs, Bloomberg IDs, and tickers with optional exchange codes (e.g., "AAPL US").',
    inputSchema: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description:
            'The identifier to search for. Type will be auto-detected. Examples: "US0378331005" (ISIN), "037833100" (CUSIP), "AAPL US" (ticker with exchange)',
        },
      },
      required: ['identifier'],
    },
  },
  {
    name: 'batch_search_auto_detect',
    description:
      'Parse identifiers from text/CSV and search for all of them in a single batch operation. Automatically detects identifier types. Great for processing lists of tickers or identifiers from spreadsheets.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description:
            'CSV or newline-separated text containing identifiers. Example: "Ticker\\nABLI SS\\nACE SS\\nACTI SS"',
        },
      },
      required: ['text'],
    },
  },
] as const

// Tool handlers
export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const client = getClient()

  try {
    switch (name) {
      case 'search_by_isin': {
        const isin = args.isin as string
        const filters = extractFilters(args)
        const response = await client.searchByISIN(isin, filters)
        return { content: [{ type: 'text', text: formatResponse(response) }] }
      }

      case 'search_by_cusip': {
        const cusip = args.cusip as string
        const filters = extractFilters(args)
        const response = await client.searchByCUSIP(cusip, filters)
        return { content: [{ type: 'text', text: formatResponse(response) }] }
      }

      case 'search_by_sedol': {
        const sedol = args.sedol as string
        const filters = extractFilters(args)
        const response = await client.searchBySEDOL(sedol, filters)
        return { content: [{ type: 'text', text: formatResponse(response) }] }
      }

      case 'search_by_ticker': {
        const ticker = args.ticker as string
        const exchCode = args.exchCode as string | undefined
        const securityType2 = args.securityType2 as string | undefined
        const filters = extractFilters(args)
        const response = await client.searchByTicker(ticker, exchCode, {
          ...filters,
          ...(securityType2 && { securityType2 }),
        })
        return { content: [{ type: 'text', text: formatResponse(response) }] }
      }

      case 'search_by_bloomberg_id': {
        const bloombergId = args.bloombergId as string
        const filters = extractFilters(args)
        const response = await client.searchByBloombergId(bloombergId, filters)
        return { content: [{ type: 'text', text: formatResponse(response) }] }
      }

      case 'batch_mapping': {
        const { identifiers } = args as {
          identifiers: Array<{
            idType: string
            idValue: string
            exchCode?: string
          }>
        }

        const requests: MappingRequest[] = identifiers.map((id) => ({
          idType: id.idType as MappingRequest['idType'],
          idValue: id.idValue,
          exchCode: id.exchCode as MappingRequest['exchCode'],
        }))

        // Split into batches based on API key presence
        const batchSize = getBatchSize()
        const batches = chunkArray(requests, batchSize)

        // Process all batches and combine results
        const allResponses: MappingResponse[] = []
        for (const batch of batches) {
          const batchResponses = await client.mapping(batch)
          allResponses.push(...batchResponses)
        }
        const responses = allResponses
        const formatted = responses
          .map((response: MappingResponse, index: number) => {
            const id = identifiers[index]
            return `[${index + 1}] ${id.idType}: ${id.idValue}\n${formatResponse(response)}`
          })
          .join('\n\n---\n\n')

        return { content: [{ type: 'text', text: formatted }] }
      }

      case 'validate_identifier': {
        const { identifier, type } = args as {
          identifier: string
          type: 'ISIN' | 'CUSIP' | 'SEDOL' | 'BLOOMBERG_ID'
        }

        let isValid = false
        let format = ''

        switch (type) {
          case 'ISIN':
            isValid = isValidISIN(identifier)
            format = '2 letter country code + 9 alphanumeric characters + 1 check digit'
            break
          case 'CUSIP':
            isValid = isValidCUSIP(identifier)
            format = '9 alphanumeric characters'
            break
          case 'SEDOL':
            isValid = isValidSEDOL(identifier)
            format = '7 alphanumeric characters'
            break
          case 'BLOOMBERG_ID':
            isValid = isValidBloombergId(identifier)
            format = 'BBG + 9 alphanumeric characters'
            break
        }

        const result = isValid
          ? `Valid ${type}: "${identifier}"`
          : `Invalid ${type}: "${identifier}"\nExpected format: ${format}`

        return { content: [{ type: 'text', text: result }] }
      }

      case 'get_rate_limit_status': {
        const rateLimit = client.getRateLimitInfo()

        if (!rateLimit) {
          return {
            content: [
              {
                type: 'text',
                text: 'No rate limit information available. Make a request first to get rate limit data.',
              },
            ],
          }
        }

        const text = [
          'OpenFIGI API Rate Limit Status:',
          `  Limit: ${rateLimit.limit} requests`,
          `  Remaining: ${rateLimit.remaining} requests`,
          `  Resets: ${rateLimit.reset.toISOString()}`,
        ].join('\n')

        return { content: [{ type: 'text', text }] }
      }

      case 'parse_identifiers': {
        const text = args.text as string
        const { identifiers, summary } = parseAndDetectIdentifiers(text)

        const details = identifiers
          .map((id, index) => {
            const exchPart = id.exchCode ? ` (Exchange: ${id.exchCode})` : ''
            return `${index + 1}. "${id.value}" → ${id.type}${exchPart} [${id.confidence} confidence]`
          })
          .join('\n')

        return {
          content: [
            {
              type: 'text',
              text: `${summary}\n\nDetails:\n${details}`,
            },
          ],
        }
      }

      case 'search_auto_detect': {
        const identifier = args.identifier as string
        const detected = detectIdentifierType(identifier)

        if (detected.type === 'UNKNOWN') {
          return {
            content: [
              {
                type: 'text',
                text: `Could not determine identifier type for "${identifier}". Please use a specific search tool or provide more context.`,
              },
            ],
          }
        }

        let response: MappingResponse

        switch (detected.type) {
          case 'ISIN':
            response = await client.searchByISIN(detected.value)
            break
          case 'CUSIP':
            response = await client.searchByCUSIP(detected.value)
            break
          case 'SEDOL':
            response = await client.searchBySEDOL(detected.value)
            break
          case 'BLOOMBERG_ID':
            response = await client.searchByBloombergId(detected.value)
            break
          case 'TICKER':
            response = await client.searchByTicker(detected.value, detected.exchCode)
            break
        }

        const header = `Detected type: ${detected.type}${detected.exchCode ? ` (Exchange: ${detected.exchCode})` : ''} [${detected.confidence} confidence]\n\n`
        const hasResults = response.data && response.data.length > 0
        const notFoundWarning = hasResults ? '' : `⚠️ NOT FOUND: "${detected.value}"${detected.exchCode ? ` on exchange ${detected.exchCode}` : ''} returned no results.\n\n`
        return { content: [{ type: 'text', text: header + notFoundWarning + formatResponse(response) }] }
      }

      case 'batch_search_auto_detect': {
        const text = args.text as string
        const { identifiers, summary } = parseAndDetectIdentifiers(text)

        // Filter out unknown identifiers
        const validIdentifiers = identifiers.filter((id) => id.type !== 'UNKNOWN')

        if (validIdentifiers.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `${summary}\n\nNo valid identifiers found to search.`,
              },
            ],
          }
        }

        // Convert to mapping requests
        const idTypeMap: Record<IdentifierType, MappingRequest['idType']> = {
          ISIN: 'ID_ISIN',
          CUSIP: 'ID_CUSIP',
          SEDOL: 'ID_SEDOL',
          BLOOMBERG_ID: 'ID_BB_GLOBAL',
          TICKER: 'ID_EXCH_SYMBOL',
          UNKNOWN: 'ID_EXCH_SYMBOL', // Won't be used
        }

        // Security types to try for tickers (in order of likelihood)
        const tickerSecurityTypes: Array<MappingRequest['securityType2']> = [
          'Common Stock',
          'Preference',
        ]

        // For tickers, create multiple requests (one per security type) to improve hit rate
        // For other types, create a single request
        const requests: Array<{ request: MappingRequest; originalIndex: number; securityType?: string }> = []

        validIdentifiers.forEach((id, index) => {
          if (id.type === 'TICKER') {
            // Add a request for each security type we want to try
            tickerSecurityTypes.forEach((secType) => {
              requests.push({
                request: {
                  idType: idTypeMap[id.type],
                  idValue: id.value,
                  exchCode: id.exchCode as MappingRequest['exchCode'],
                  securityType2: secType,
                },
                originalIndex: index,
                securityType: secType,
              })
            })
          } else {
            requests.push({
              request: {
                idType: idTypeMap[id.type],
                idValue: id.value,
                exchCode: id.exchCode as MappingRequest['exchCode'],
              },
              originalIndex: index,
            })
          }
        })

        // Split into batches based on API key presence
        const batchSize = getBatchSize()
        const batches = chunkArray(requests, batchSize)

        // Process all batches and combine results
        const allResults: Array<{ response: MappingResponse; originalIndex: number; securityType?: string }> = []
        for (const batch of batches) {
          const batchRequests = batch.map((r) => r.request)
          const batchResponses = await client.mapping(batchRequests)
          batchResponses.forEach((response, i) => {
            allResults.push({
              response,
              originalIndex: batch[i].originalIndex,
              securityType: batch[i].securityType,
            })
          })
        }

        // Group results by original identifier and pick the best result (first one with data)
        const bestResults: (MappingResponse | null)[] = new Array(validIdentifiers.length).fill(null)
        const usedSecurityType: (string | undefined)[] = new Array(validIdentifiers.length).fill(undefined)

        for (const result of allResults) {
          const idx = result.originalIndex
          const hasData = result.response.data && result.response.data.length > 0

          // If we don't have a result yet, or this one has data and previous didn't
          if (bestResults[idx] === null || (hasData && !(bestResults[idx]?.data?.length))) {
            bestResults[idx] = result.response
            usedSecurityType[idx] = result.securityType
          }
        }

        // Ensure no null results (fallback to warning response)
        const finalResults: MappingResponse[] = bestResults.map((result, index) => {
          if (result === null) {
            const id = validIdentifiers[index]
            return { warning: `No identifier found for ${id.value}` }
          }
          return result
        })

        // Track found and not found
        const found: string[] = []
        const notFound: string[] = []

        const formatted = finalResults
          .map((response: MappingResponse, index: number) => {
            const id = validIdentifiers[index]
            const exchPart = id.exchCode ? ` [${id.exchCode}]` : ''
            const idLabel = `${id.value}${exchPart}`

            // Check if no results
            const hasResults = response.data && response.data.length > 0
            if (hasResults) {
              found.push(idLabel)
            } else {
              notFound.push(idLabel)
            }

            const secTypeInfo = usedSecurityType[index] ? ` (${usedSecurityType[index]})` : ''
            const status = hasResults ? secTypeInfo : ' ⚠️ NOT FOUND'
            return `[${index + 1}] ${id.type}: ${idLabel}${status}\n${formatResponse(response)}`
          })
          .join('\n\n---\n\n')

        // Add summary of found/not found
        const resultSummary = [
          `\nResults: ${found.length} found, ${notFound.length} not found`,
          notFound.length > 0 ? `\n⚠️ Not found:\n${notFound.map((id) => `  - ${id}`).join('\n')}` : '',
        ].join('')

        return { content: [{ type: 'text', text: `${summary}\n\n${formatted}\n\n---${resultSummary}` }] }
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { content: [{ type: 'text', text: `Error: ${message}` }] }
  }
}

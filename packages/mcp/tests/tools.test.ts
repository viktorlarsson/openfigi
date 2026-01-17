import { describe, it, expect, vi, beforeEach } from 'vitest'

// We need to test the internal functions, so let's import them by reading the module
// For now, let's test through the handleTool interface

// Mock the openfigi-sdk module
vi.mock('openfigi-sdk', () => ({
  createClient: vi.fn(() => ({
    searchByISIN: vi.fn().mockResolvedValue({ data: [{ figi: 'BBG000B9XRY4', name: 'Apple Inc' }] }),
    searchByCUSIP: vi.fn().mockResolvedValue({ data: [{ figi: 'BBG000B9XRY4', name: 'Apple Inc' }] }),
    searchBySEDOL: vi.fn().mockResolvedValue({ data: [{ figi: 'BBG000B9XRY4', name: 'Apple Inc' }] }),
    searchByTicker: vi.fn().mockResolvedValue({ data: [{ figi: 'BBG000B9XRY4', name: 'Apple Inc' }] }),
    searchByBloombergId: vi.fn().mockResolvedValue({ data: [{ figi: 'BBG000B9XRY4', name: 'Apple Inc' }] }),
    mapping: vi.fn().mockResolvedValue([{ data: [{ figi: 'BBG000B9XRY4', name: 'Apple Inc' }] }]),
    getRateLimitInfo: vi.fn().mockReturnValue(null),
  })),
  isValidISIN: vi.fn((isin: string) => /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin) && !isin.startsWith('BBG')),
  isValidCUSIP: vi.fn((cusip: string) => /^[A-Z0-9]{9}$/.test(cusip)),
  isValidSEDOL: vi.fn((sedol: string) => /^[A-Z0-9]{7}$/.test(sedol)),
  isValidBloombergId: vi.fn((bbgId: string) => /^BBG[A-Z0-9]{9}$/.test(bbgId)),
}))

import { toolDefinitions, handleTool } from '../src/tools/index.js'
import { getToolText as getText } from './helpers.js'

describe('MCP Tools', () => {
  describe('toolDefinitions', () => {
    it('should have all required tools', () => {
      const toolNames = toolDefinitions.map((t) => t.name)

      expect(toolNames).toContain('search_by_isin')
      expect(toolNames).toContain('search_by_cusip')
      expect(toolNames).toContain('search_by_sedol')
      expect(toolNames).toContain('search_by_ticker')
      expect(toolNames).toContain('search_by_bloomberg_id')
      expect(toolNames).toContain('batch_mapping')
      expect(toolNames).toContain('validate_identifier')
      expect(toolNames).toContain('get_rate_limit_status')
      expect(toolNames).toContain('parse_identifiers')
      expect(toolNames).toContain('search_auto_detect')
      expect(toolNames).toContain('batch_search_auto_detect')
    })

    it('should have valid input schemas for all tools', () => {
      for (const tool of toolDefinitions) {
        expect(tool.name).toBeTruthy()
        expect(tool.description).toBeTruthy()
        expect(tool.inputSchema).toBeDefined()
        expect(tool.inputSchema.type).toBe('object')
      }
    })
  })

  describe('parse_identifiers', () => {
    it('should parse Swedish tickers with SS exchange code', async () => {
      const text = `Ticker
ABLI SS
ABSO SS
ACAD SS
ACAST SS
ACE SS
ACTI SS
ADDTB SS`

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 7 identifiers')
      expect(getText(result)).toContain('Ticker: 7')
      expect(getText(result)).toContain('"ABLI" → TICKER (Exchange: SS)')
      expect(getText(result)).toContain('"ABSO" → TICKER (Exchange: SS)')
      expect(getText(result)).toContain('"ACAD" → TICKER (Exchange: SS)')
      expect(getText(result)).toContain('[high confidence]')
    })

    it('should parse US tickers with exchange code', async () => {
      const text = `AAPL US
MSFT US
GOOGL US
TSLA US`

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 4 identifiers')
      expect(getText(result)).toContain('"AAPL" → TICKER (Exchange: US)')
      expect(getText(result)).toContain('"MSFT" → TICKER (Exchange: US)')
    })

    it('should parse Bloomberg-style tickers with Equity suffix', async () => {
      const text = `P911 GY Equity
VOW3 GY Equity
AAPL US Equity`

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 3 identifiers')
      expect(getText(result)).toContain('"P911" → TICKER (Exchange: GY)')
      expect(getText(result)).toContain('"VOW3" → TICKER (Exchange: GY)')
      expect(getText(result)).toContain('"AAPL" → TICKER (Exchange: US)')
    })

    it('should parse ISINs correctly', async () => {
      const text = `US0378331005
GB0002374006
DE0007164600`

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 3 identifiers')
      expect(getText(result)).toContain('ISIN: 3')
      expect(getText(result)).toContain('[high confidence]')
    })

    it('should parse Bloomberg IDs correctly', async () => {
      const text = `BBG000B9XRY4
BBG000BPH459
BBG000BVPV84`

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 3 identifiers')
      expect(getText(result)).toContain('Bloomberg ID: 3')
      expect(getText(result)).toContain('[high confidence]')
    })

    it('should parse mixed identifiers', async () => {
      const text = `Identifier
US0378331005
BBG000B9XRY4
AAPL US
037833100
2046251`

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 5 identifiers')
      expect(getText(result)).toContain('ISIN')
      expect(getText(result)).toContain('Bloomberg ID')
      expect(getText(result)).toContain('TICKER')
    })

    it('should skip header rows', async () => {
      const text = `Ticker,Name,Price
AAPL US,Apple,150
MSFT US,Microsoft,300`

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 2 identifiers')
      expect(getText(result)).not.toContain('"Ticker"')
    })

    it('should handle tab-separated data', async () => {
      const text = `Symbol\tName
AAPL US\tApple Inc
VOD LN\tVodafone`

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 2 identifiers')
      expect(getText(result)).toContain('"AAPL" → TICKER (Exchange: US)')
      expect(getText(result)).toContain('"VOD" → TICKER (Exchange: LN)')
    })

    it('should handle simple tickers without exchange', async () => {
      const text = `AAPL
MSFT
GOOGL`

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 3 identifiers')
      expect(getText(result)).toContain('TICKER')
      expect(getText(result)).toContain('[low confidence]')
    })
  })

  describe('search_auto_detect', () => {
    it('should auto-detect ISIN and search', async () => {
      const result = await handleTool('search_auto_detect', { identifier: 'US0378331005' })

      expect(getText(result)).toContain('Detected type: ISIN')
      expect(getText(result)).toContain('[high confidence]')
    })

    it('should auto-detect Bloomberg ID and search', async () => {
      const result = await handleTool('search_auto_detect', { identifier: 'BBG000B9XRY4' })

      expect(getText(result)).toContain('Detected type: BLOOMBERG_ID')
      expect(getText(result)).toContain('[high confidence]')
    })

    it('should auto-detect ticker with exchange and search', async () => {
      const result = await handleTool('search_auto_detect', { identifier: 'AAPL US' })

      expect(getText(result)).toContain('Detected type: TICKER')
      expect(getText(result)).toContain('Exchange: US')
      expect(getText(result)).toContain('[high confidence]')
    })

    it('should auto-detect Swedish ticker and search', async () => {
      const result = await handleTool('search_auto_detect', { identifier: 'ABLI SS' })

      expect(getText(result)).toContain('Detected type: TICKER')
      expect(getText(result)).toContain('Exchange: SS')
    })

    it('should handle unknown identifiers gracefully', async () => {
      const result = await handleTool('search_auto_detect', { identifier: '!!invalid!!' })

      expect(getText(result)).toContain('Could not determine identifier type')
    })
  })

  describe('search_by_ticker', () => {
    it('should search ticker without explicit securityType2', async () => {
      const result = await handleTool('search_by_ticker', { ticker: 'AAPL', exchCode: 'US' })

      // Should find results (uses smart search)
      expect(getText(result)).toContain('FIGI:')
    })

    it('should search ticker with explicit securityType2', async () => {
      const result = await handleTool('search_by_ticker', {
        ticker: 'AAPL',
        exchCode: 'US',
        securityType2: 'Common Stock',
      })

      expect(getText(result)).toContain('FIGI:')
    })

    it('should search preference shares with explicit securityType2', async () => {
      const result = await handleTool('search_by_ticker', {
        ticker: 'VOW3',
        exchCode: 'GY',
        securityType2: 'Preference',
      })

      // Should return results for preference shares
      expect(getText(result)).toBeDefined()
    })

    it('should handle London Stock Exchange tickers', async () => {
      const result = await handleTool('search_by_ticker', { ticker: 'RR.', exchCode: 'LN' })

      expect(getText(result)).toContain('FIGI:')
    })
  })

  describe('batch_search_auto_detect', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should batch search Swedish tickers', async () => {
      const text = `Ticker
ABLI SS
ABSO SS
ACAD SS`

      const result = await handleTool('batch_search_auto_detect', { text })

      expect(getText(result)).toContain('Detected 3 identifiers')
      expect(getText(result)).toContain('TICKER: ABLI [SS]')
    })

    it('should batch search mixed identifiers', async () => {
      const text = `US0378331005
AAPL US
BBG000B9XRY4`

      const result = await handleTool('batch_search_auto_detect', { text })

      expect(getText(result)).toContain('Detected 3 identifiers')
    })

    it('should handle empty input', async () => {
      const result = await handleTool('batch_search_auto_detect', { text: '' })

      expect(getText(result)).toContain('No valid identifiers found')
    })

    it('should filter out unknown identifiers', async () => {
      const text = `AAPL US
!!invalid!!
MSFT US`

      const result = await handleTool('batch_search_auto_detect', { text })

      // Should still process the valid ones
      expect(getText(result)).toContain('Ticker: 2')
      expect(getText(result)).toContain('Unknown: 1')
    })

    it('should show summary of found vs not found', async () => {
      const text = `AAPL US
MSFT US`

      const result = await handleTool('batch_search_auto_detect', { text })

      // Should show results summary
      expect(getText(result)).toContain('Results:')
      expect(getText(result)).toContain('found')
    })
  })

  describe('validate_identifier', () => {
    it('should validate correct ISIN', async () => {
      const result = await handleTool('validate_identifier', {
        identifier: 'US0378331005',
        type: 'ISIN',
      })

      expect(getText(result)).toContain('Valid ISIN')
    })

    it('should reject invalid ISIN', async () => {
      const result = await handleTool('validate_identifier', {
        identifier: 'INVALID',
        type: 'ISIN',
      })

      expect(getText(result)).toContain('Invalid ISIN')
      expect(getText(result)).toContain('Expected format')
    })

    it('should validate correct Bloomberg ID', async () => {
      const result = await handleTool('validate_identifier', {
        identifier: 'BBG000B9XRY4',
        type: 'BLOOMBERG_ID',
      })

      expect(getText(result)).toContain('Valid BLOOMBERG_ID')
    })
  })

  describe('edge cases', () => {
    it('should handle Windows line endings', async () => {
      const text = 'AAPL US\r\nMSFT US\r\nGOOGL US'

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 3 identifiers')
    })

    it('should handle extra whitespace', async () => {
      const text = `  AAPL US
  MSFT US  `

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 2 identifiers')
    })

    it('should handle lowercase tickers', async () => {
      const text = 'aapl us'

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('"AAPL" → TICKER (Exchange: US)')
    })

    it('should handle tickers with numbers', async () => {
      const text = `ADDTB SS
BRK.A US
TSLA3 US`

      const result = await handleTool('parse_identifiers', { text })

      expect(getText(result)).toContain('Detected 3 identifiers')
    })

    it('should recognize various header names', async () => {
      const headers = ['Ticker', 'ticker', 'ISIN', 'Symbol', 'Identifier', 'CUSIP', 'SEDOL']

      for (const header of headers) {
        const text = `${header}
AAPL US`
        const result = await handleTool('parse_identifiers', { text })
        expect(getText(result)).toContain('Detected 1 identifiers')
      }
    })
  })
})

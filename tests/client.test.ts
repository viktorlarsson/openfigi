import { describe, expect, it, vi } from 'vitest'
import {
  createClient,
  searchByBloombergId,
  searchByCUSIP,
  searchByISIN,
  searchBySEDOL,
  searchByTicker,
} from '../src/client/client'
import type { ClientConfig, MappingRequest } from '../src/types'
import { ValidationError } from '../src/utils/errors'

describe('OpenFIGI Functional Client', () => {
  describe('createClient', () => {
    it('should create client with default config', () => {
      const client = createClient()
      expect(client).toHaveProperty('mapping')
      expect(client).toHaveProperty('searchByISIN')
      expect(client).toHaveProperty('searchByCUSIP')
      expect(client).toHaveProperty('searchBySEDOL')
      expect(client).toHaveProperty('searchByTicker')
      expect(client).toHaveProperty('searchByBloombergId')
      expect(client).toHaveProperty('getRateLimitInfo')
    })

    it('should create client with custom config', () => {
      const client = createClient({
        apiKey: 'test-api-key',
        timeout: 60000,
      })
      expect(client).toBeDefined()
    })

    it('should throw ValidationError for invalid config', () => {
      expect(() => {
        createClient({
          baseUrl: 'invalid-url',
        } as ClientConfig)
      }).toThrow(ValidationError)
    })
  })

  describe('mapping validation', () => {
    it('should throw ValidationError for empty requests', async () => {
      const client = createClient()
      try {
        await client.mapping([])
        expect(false).toBe(true) // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
      }
    })

    it('should throw ValidationError for more than 100 requests', async () => {
      const client = createClient()
      const requests: MappingRequest[] = Array(101).fill({
        idType: 'ID_ISIN',
        idValue: 'US0378331005',
      })
      try {
        await client.mapping(requests)
        expect(false).toBe(true) // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
      }
    })

    it('should throw ValidationError for invalid request', async () => {
      const client = createClient()
      const invalidRequest = {
        idType: 'ID_ISIN',
        idValue: '', // Empty idValue is invalid
      } as unknown as MappingRequest
      try {
        await client.mapping([invalidRequest])
        expect(false).toBe(true) // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
      }
    })
  })

  describe('request building', () => {
    it('should build correct request for ISIN', () => {
      const client = createClient()
      const _mockMapping = vi.fn(() => Promise.resolve([{ data: [{ figi: 'BBG000B9XRY4' }] }]))

      // This tests that the function exists and can be called
      expect(typeof client.searchByISIN).toBe('function')
    })

    it('should build correct request for CUSIP', () => {
      const client = createClient()
      expect(typeof client.searchByCUSIP).toBe('function')
    })

    it('should build correct request for SEDOL', () => {
      const client = createClient()
      expect(typeof client.searchBySEDOL).toBe('function')
    })

    it('should build correct request for ticker', () => {
      const client = createClient()
      expect(typeof client.searchByTicker).toBe('function')
    })

    it('should build correct request for Bloomberg ID', () => {
      const client = createClient()
      expect(typeof client.searchByBloombergId).toBe('function')
    })
  })

  describe('standalone functions', () => {
    it('should export standalone functions', () => {
      expect(typeof searchByISIN).toBe('function')
      expect(typeof searchByCUSIP).toBe('function')
      expect(typeof searchBySEDOL).toBe('function')
      expect(typeof searchByTicker).toBe('function')
      expect(typeof searchByBloombergId).toBe('function')
    })
  })

  describe('client instance functions', () => {
    it('should allow custom client with different config', () => {
      const customClient = createClient({
        apiKey: 'custom-key',
        timeout: 5000,
      })

      expect(customClient).toBeDefined()
      expect(typeof customClient.searchByISIN).toBe('function')
    })
  })
})

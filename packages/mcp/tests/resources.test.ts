import { describe, it, expect } from 'vitest'
import { resourceDefinitions, handleResource } from '../src/resources/index.js'
import { getResourceContent, getResourceText } from './helpers.js'

describe('MCP Resources', () => {
  describe('resourceDefinitions', () => {
    it('should have all required resources', () => {
      expect(resourceDefinitions).toHaveLength(5)

      const uris = resourceDefinitions.map(r => r.uri)
      expect(uris).toContain('openfigi://search-guide')
      expect(uris).toContain('openfigi://identifier-types')
      expect(uris).toContain('openfigi://exchange-codes')
      expect(uris).toContain('openfigi://security-types')
      expect(uris).toContain('openfigi://market-sectors')
    })

    it('should have name, description, and mimeType for each resource', () => {
      for (const resource of resourceDefinitions) {
        expect(resource.name).toBeTruthy()
        expect(resource.description).toBeTruthy()
        expect(resource.mimeType).toBe('text/plain')
      }
    })
  })

  describe('handleResource', () => {
    it('should return search guide content', () => {
      const result = handleResource('openfigi://search-guide')
      expect(result.contents).toHaveLength(1)
      const content = getResourceContent(result)
      expect(content.uri).toBe('openfigi://search-guide')
      expect(content.mimeType).toBe('text/plain')
      expect(content.text).toContain('PREFER ISIN OVER TICKER')
      expect(content.text).toContain('EXCHANGE CODE MAPPING')
      expect(content.text).toContain('NORDIC STOCK TICKER CONVENTIONS')
    })

    it('should return identifier types content', () => {
      const result = handleResource('openfigi://identifier-types')
      expect(result.contents).toHaveLength(1)
      const content = getResourceContent(result)
      expect(content.uri).toBe('openfigi://identifier-types')
      expect(content.mimeType).toBe('text/plain')
      expect(content.text).toContain('ID_ISIN')
      expect(content.text).toContain('ID_CUSIP')
    })

    it('should return exchange codes content', () => {
      const result = handleResource('openfigi://exchange-codes')
      expect(result.contents).toHaveLength(1)
      const text = getResourceText(result)
      expect(text).toContain('NASDAQ')
      expect(text).toContain('NYSE')
    })

    it('should return security types content', () => {
      const result = handleResource('openfigi://security-types')
      expect(result.contents).toHaveLength(1)
      const text = getResourceText(result)
      expect(text).toContain('Common Stock')
      expect(text).toContain('Bond')
    })

    it('should return market sectors content', () => {
      const result = handleResource('openfigi://market-sectors')
      expect(result.contents).toHaveLength(1)
      const text = getResourceText(result)
      expect(text).toContain('Equity')
      expect(text).toContain('Corp')
    })

    it('should throw for unknown resource', () => {
      expect(() => handleResource('openfigi://unknown')).toThrow('Unknown resource')
    })
  })
})

/**
 * Validate ISIN format (12 characters, alphanumeric)
 */
export const isValidISIN = (isin: string): boolean => {
  return /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin)
}

/**
 * Validate CUSIP format (9 characters, alphanumeric)
 */
export const isValidCUSIP = (cusip: string): boolean => {
  return /^[A-Z0-9]{9}$/.test(cusip)
}

/**
 * Validate SEDOL format (7 characters, alphanumeric)
 */
export const isValidSEDOL = (sedol: string): boolean => {
  return /^[A-Z0-9]{7}$/.test(sedol)
}

/**
 * Validate Bloomberg ID format (starts with BBG)
 */
export const isValidBloombergId = (bbgId: string): boolean => {
  return /^BBG[A-Z0-9]{9}$/.test(bbgId)
}

/**
 * Split array into batches of specified size
 * Useful for splitting large arrays for batch processing
 */
export const batchArray = <T>(array: T[], batchSize: number): T[][] => {
  const batches: T[][] = []
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize))
  }
  return batches
}

import {
  createClient,
  getRateLimitInfo,
  type MappingRequest,
  mapping,
  searchByISIN,
  searchByTicker,
} from '../src'

async function basicUsageExample() {
  console.log('🔍 OpenFIGI SDK Examples\n')

  // Example 1: Simple search by ISIN
  console.log('1. Search by ISIN:')
  const isinResult = await searchByISIN('US0378331005')
  if (isinResult.data) {
    console.log('  Found:', isinResult.data[0]?.name, '-', isinResult.data[0]?.figi)
  }

  // Example 2: Search by ticker with exchange code
  console.log('\n2. Search by ticker:')
  const tickerResult = await searchByTicker('AAPL', 'US')
  if (tickerResult.data) {
    console.log('  Found:', tickerResult.data[0]?.name, '-', tickerResult.data[0]?.figi)
  }

  // Example 3: Batch mapping multiple identifiers
  console.log('\n3. Batch mapping:')
  const requests: MappingRequest[] = [
    { idType: 'ID_ISIN', idValue: 'US0378331005' },
    { idType: 'ID_CUSIP', idValue: '037833100' },
    { idType: 'ID_SEDOL', idValue: '2046251' },
  ]

  const batchResults = await mapping(requests)
  batchResults.forEach((result, index) => {
    if (result.data?.[0]) {
      console.log(`  Request ${index + 1}:`, result.data[0].name, '-', result.data[0].figi)
    }
  })

  // Example 4: Check rate limit info
  console.log('\n4. Rate limit info:')
  const rateLimitInfo = getRateLimitInfo()
  if (rateLimitInfo) {
    console.log('  Limit:', rateLimitInfo.limit)
    console.log('  Remaining:', rateLimitInfo.remaining)
    console.log('  Reset:', rateLimitInfo.reset)
  } else {
    console.log('  No rate limit info available yet')
  }
}

async function customClientExample() {
  console.log('\n5. Custom client with API key:')

  // Create a client with custom configuration
  const client = createClient({
    apiKey: process.env.OPENFIGI_API_KEY, // Set this in your environment
    timeout: 60000,
    retryLimit: 5,
  })

  const result = await client.searchByISIN('GB0002634946')
  if (result.data) {
    console.log('  Found:', result.data[0]?.name, '-', result.data[0]?.figi)
  }
}

async function errorHandlingExample() {
  console.log('\n6. Error handling:')

  try {
    // This will likely fail with validation error
    await searchByISIN('INVALID-ISIN-FORMAT')
  } catch (error) {
    if (error instanceof Error) {
      console.log('  Error caught:', error.message)
    }
  }
}

// Run examples
async function main() {
  try {
    await basicUsageExample()
    await customClientExample()
    await errorHandlingExample()
  } catch (error) {
    console.error('Example failed:', error)
  }
}

main()

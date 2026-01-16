import {
  batchArray,
  createClient,
  getRateLimitInfo,
  isValidCUSIP,
  isValidISIN,
  type MappingRequest,
  type MappingResponse,
  mapping,
  OpenFigiError,
  RateLimitError,
  searchByISIN,
  setDebugMode,
  ValidationError,
} from '../src'

/**
 * Example: Validate identifiers before searching
 */
async function validateAndSearch() {
  console.log('📝 Validating identifiers before search\n')

  const identifiers = [
    { type: 'ISIN', value: 'US0378331005' },
    { type: 'ISIN', value: 'INVALID123' },
    { type: 'CUSIP', value: '037833100' },
  ]

  for (const id of identifiers) {
    if (id.type === 'ISIN') {
      if (isValidISIN(id.value)) {
        console.log(`✅ Valid ISIN: ${id.value}`)
        const result = await searchByISIN(id.value)
        if (result.data?.[0]) {
          console.log(`   Found: ${result.data[0].name}`)
        }
      } else {
        console.log(`❌ Invalid ISIN format: ${id.value}`)
      }
    } else if (id.type === 'CUSIP') {
      if (isValidCUSIP(id.value)) {
        console.log(`✅ Valid CUSIP: ${id.value}`)
      } else {
        console.log(`❌ Invalid CUSIP format: ${id.value}`)
      }
    }
  }
}

/**
 * Example: Handle large batches with automatic splitting
 */
async function handleLargeBatch() {
  console.log('\n📦 Processing large batch with automatic splitting\n')

  // Simulate 250 identifiers (need to split into 3 batches of 100, 100, 50)
  const identifiers: MappingRequest[] = [
    { idType: 'ID_ISIN', idValue: 'US0378331005' },
    { idType: 'ID_CUSIP', idValue: '037833100' },
    { idType: 'ID_SEDOL', idValue: '2046251' },
    // ... imagine 247 more
  ]

  // Split into batches of 100 (OpenFIGI max)
  const batches = batchArray(identifiers, 100)
  console.log(`Split ${identifiers.length} requests into ${batches.length} batch(es)`)

  const allResults: MappingResponse[] = []

  for (let i = 0; i < batches.length; i++) {
    console.log(`Processing batch ${i + 1}/${batches.length}...`)
    try {
      const results = await mapping(batches[i])
      allResults.push(...results)

      // Check rate limits after each batch
      const rateLimit = getRateLimitInfo()
      if (rateLimit) {
        console.log(`  Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`)

        // If getting low on rate limit, wait
        if (rateLimit.remaining < 10) {
          console.log('  ⚠️  Rate limit low, waiting 1 second...')
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    } catch (error) {
      console.error(`  Failed to process batch ${i + 1}:`, error)
    }
  }

  console.log(`✅ Processed ${allResults.length} total results`)
}

/**
 * Example: Robust error handling
 */
async function robustErrorHandling() {
  console.log('\n🛡️  Demonstrating error handling\n')

  const testCases = [
    { id: 'US0378331005', description: 'Valid ISIN' },
    { id: '', description: 'Empty string' },
    { id: 'INVALID', description: 'Invalid format' },
  ]

  for (const test of testCases) {
    console.log(`Testing: ${test.description} ("${test.id}")`)
    try {
      const result = await searchByISIN(test.id)
      if (result.data?.[0]) {
        console.log(`  ✅ Success: Found ${result.data[0].name}`)
      } else if (result.error) {
        console.log(`  ⚠️  API Error: ${result.error}`)
      } else {
        console.log('  ℹ️  No results found')
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log(`  ❌ Validation Error: ${error.message}`)
      } else if (error instanceof RateLimitError) {
        console.log(`  ⏱️  Rate Limited: Retry after ${error.retryAfter}s`)
      } else if (error instanceof OpenFigiError) {
        console.log(`  ❌ API Error (${error.statusCode}): ${error.message}`)
      } else {
        console.log(`  ❌ Unexpected Error:`, error)
      }
    }
  }
}

/**
 * Example: Custom client with retry and debugging
 */
async function customClientExample() {
  console.log('\n🔧 Custom client configuration\n')

  // Enable debug mode to see all requests/responses
  setDebugMode(true)

  const client = createClient({
    apiKey: process.env.OPENFIGI_API_KEY,
    timeout: 60000,
    retryLimit: 5,
    retryDelay: 2000,
  })

  console.log('Debug mode enabled - you will see detailed logs')

  try {
    const result = await client.searchByISIN('US0378331005')
    if (result.data?.[0]) {
      console.log(`Found: ${result.data[0].name}`)
    }
  } finally {
    // Disable debug mode
    setDebugMode(false)
  }
}

/**
 * Example: Parallel requests with Promise.all
 */
async function parallelRequests() {
  console.log('\n⚡ Parallel requests example\n')

  const identifiers = [
    { type: 'ISIN', value: 'US0378331005' },
    { type: 'CUSIP', value: '037833100' },
    { type: 'SEDOL', value: '2046251' },
  ]

  console.log('Making parallel requests...')
  const startTime = Date.now()

  try {
    const results = await Promise.all([
      searchByISIN(identifiers[0].value),
      searchByISIN(identifiers[1].value), // Will use CUSIP internally
      searchByISIN(identifiers[2].value), // Will use SEDOL internally
    ])

    const elapsed = Date.now() - startTime
    console.log(`Completed ${results.length} requests in ${elapsed}ms`)

    results.forEach((result, i) => {
      if (result.data?.[0]) {
        console.log(`  ${identifiers[i].type}: ${result.data[0].name}`)
      }
    })
  } catch (error) {
    console.error('Parallel request failed:', error)
  }
}

/**
 * Example: Working with response data
 */
async function workingWithResponseData() {
  console.log('\n📊 Working with response data\n')

  const result = await searchByISIN('US0378331005')

  if (result.error) {
    console.log('API returned an error:', result.error)
    return
  }

  if (result.warning) {
    console.log('API warning:', result.warning)
  }

  if (result.data && result.data.length > 0) {
    const security = result.data[0]

    console.log('Security Details:')
    console.log('  FIGI:', security.figi)
    console.log('  Name:', security.name)
    console.log('  Ticker:', security.ticker)
    console.log('  Exchange:', security.exchCode)
    console.log('  Security Type:', security.securityType)
    console.log('  Market Sector:', security.marketSector)

    if (security.shareClassFIGI) {
      console.log('  Share Class FIGI:', security.shareClassFIGI)
    }

    if (security.compositeFIGI) {
      console.log('  Composite FIGI:', security.compositeFIGI)
    }
  } else {
    console.log('No results found')
  }
}

// Main function to run all examples
async function main() {
  console.log('🚀 OpenFIGI SDK Advanced Examples\n')
  console.log('='.repeat(50))

  try {
    await validateAndSearch()
    await handleLargeBatch()
    await robustErrorHandling()
    await customClientExample()
    await parallelRequests()
    await workingWithResponseData()

    console.log(`\n${'='.repeat(50)}`)
    console.log('✅ All examples completed successfully!')
  } catch (error) {
    console.error('\n❌ Example failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

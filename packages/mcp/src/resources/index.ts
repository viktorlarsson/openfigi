// Resource definitions for OpenFIGI MCP server
// These provide reference data for identifier types, exchange codes, security types, etc.

export const resourceDefinitions = [
  {
    uri: 'openfigi://search-guide',
    name: 'Search Guide',
    description: 'IMPORTANT: Read this first! Guide on how to effectively search for securities using OpenFIGI',
    mimeType: 'text/plain',
  },
  {
    uri: 'openfigi://identifier-types',
    name: 'Identifier Types',
    description: 'List of supported financial identifier types for OpenFIGI API',
    mimeType: 'text/plain',
  },
  {
    uri: 'openfigi://exchange-codes',
    name: 'Exchange Codes',
    description: 'Common exchange codes used in OpenFIGI API',
    mimeType: 'text/plain',
  },
  {
    uri: 'openfigi://security-types',
    name: 'Security Types',
    description: 'Common security types used in OpenFIGI API',
    mimeType: 'text/plain',
  },
  {
    uri: 'openfigi://market-sectors',
    name: 'Market Sectors',
    description: 'Market sector values used in OpenFIGI API',
    mimeType: 'text/plain',
  },
] as const

// Search guide content - helps AI understand how to search effectively
const searchGuideContent = `OpenFIGI Search Guide
=====================

## Best Practices for Searching Securities

### 1. PREFER ISIN OVER TICKER
ISINs are globally unique and always return accurate results:
- ISIN format: 2-letter country code + 9 alphanumeric + 1 check digit
- Example: US0378331005 (Apple), SE0000108656 (Ericsson)
- Use search_by_isin for the most reliable results

### 2. TICKER SEARCH REQUIREMENTS
When searching by ticker (search_by_ticker or search_auto_detect):
- MUST include exchange code for accurate results
- Uses securityType2="Common Stock" by default
- Swedish tickers need share class: "ERIC B" not "ERIC"
- US tickers: "AAPL" with exchCode "US"

### 3. EXCHANGE CODE MAPPING
Common Bloomberg-style suffixes and their OpenFIGI exchCode:
- "SS" → exchCode: "SS" (Stockholm/Nasdaq Nordic)
- "US" → exchCode: "US" (United States)
- "LN" → exchCode: "LONDON" or "LSE"
- "GY" or "GR" → exchCode: "XETRA" or "FRANKFURT"
- "FP" → exchCode: "EURONEXT-PARIS"
- "NA" → exchCode: "EURONEXT-AMSTER"
- "FH" → exchCode: "FH" (Helsinki)
- "DC" → exchCode: "NOMX COPENHAGEN"
- "NO" → exchCode: "OSLO"
- "JP" → exchCode: "TOKYO"
- "HK" → exchCode: "HONG KONG"

### 4. NORDIC STOCK TICKER CONVENTIONS
Nordic stocks often have share class suffixes:
- A shares: "VOLV A SS" (Volvo A shares)
- B shares: "ERIC B SS" (Ericsson B shares)
- Common pattern: TICKER + space + CLASS + space + EXCHANGE
- If search fails, try adding "A" or "B" suffix

### 5. HANDLING "NOT FOUND" RESULTS
If a ticker search returns no results:
1. Check if share class is needed (add A/B suffix)
2. Try without exchange code for broader search
3. Search by ISIN if available (most reliable)
4. Check if company uses different ticker in OpenFIGI

### 6. BATCH SEARCH TIPS
For batch_search_auto_detect:
- Supports ISINs, tickers with exchange codes, CUSIPs, SEDOLs
- Format: "TICKER EXCHANGE" on each line (e.g., "AAPL US")
- Automatically splits into smaller batches
- Mix of identifier types is supported

### 7. DATA SOURCE FORMATS
Different data sources format tickers differently:

Bloomberg: "AAPL US Equity" → use "AAPL" with exchCode "US"
FactSet: "AAPL-US" → use "AAPL" with exchCode "US"
Reuters: "AAPL.O" → use "AAPL" with exchCode "NASDAQ"

### 8. WHEN TO USE WHICH TOOL
- search_by_isin: Best for accuracy, use when ISIN is available
- search_by_ticker: When you have ticker + exchange
- search_auto_detect: Single identifier, type unknown
- batch_search_auto_detect: Multiple identifiers from spreadsheet/CSV
- search_by_cusip: US securities with CUSIP
- search_by_sedol: UK/Irish securities with SEDOL

### 9. COMMON PITFALLS
- Ticker without exchange: May return too many or zero results
- Wrong exchange code: "NASDAQ" vs "US" can give different results
- Missing share class: Nordic stocks often need A/B suffix
- Case sensitivity: Tickers are converted to uppercase automatically
`

// Identifier types content
const identifierTypesContent = `OpenFIGI Identifier Types
========================

The OpenFIGI API supports the following identifier types (idType):

Primary Identifiers:
- ID_ISIN: International Securities Identification Number (12 characters, e.g., US0378331005)
- ID_CUSIP: Committee on Uniform Securities Identification Procedures (9 characters, e.g., 037833100)
- ID_SEDOL: Stock Exchange Daily Official List (7 characters, e.g., 2046251)
- ID_EXCH_SYMBOL: Exchange ticker symbol (e.g., AAPL)

Bloomberg Identifiers:
- ID_BB_GLOBAL: Bloomberg Global Identifier (e.g., BBG000B9XRY4)
- ID_BB: Bloomberg ID
- ID_BB_UNIQUE: Bloomberg Unique ID
- ID_BB_SEC_NUM: Bloomberg Security Number
- ID_BB_SEC_NUM_DES: Bloomberg Security Number Description
- ID_BB_GLOBAL_SHARE_CLASS_LEVEL: Bloomberg Share Class Level FIGI
- COMPOSITE_ID_BB_GLOBAL: Bloomberg Composite Global ID

Regional Identifiers:
- ID_CINS: CUSIP International Numbering System
- ID_COMMON: Common Code (used in Euroclear/Clearstream)
- ID_WERTPAPIER: German securities identifier (WKN)
- ID_BELGIUM: Belgian securities identifier
- ID_DENMARK: Danish securities identifier (Fondskode)
- ID_FRANCE: French securities identifier (SICOVAM)
- ID_ITALY: Italian securities identifier (Codice ABI)
- ID_JAPAN: Japanese securities identifier
- ID_LUXEMBOURG: Luxembourg securities identifier
- ID_NETHERLANDS: Dutch securities identifier
- ID_POLAND: Polish securities identifier
- ID_PORTUGAL: Portuguese securities identifier
- ID_SWEDEN: Swedish securities identifier

Other:
- ID_FULL_EXCHANGE_SYMBOL: Full exchange symbol including exchange identifier
- ID_SHORT_CODE: Short code identifier

Usage Example:
{
  "idType": "ID_ISIN",
  "idValue": "US0378331005"
}
`

// Exchange codes content (subset of most common)
const exchangeCodesContent = `OpenFIGI Exchange Codes
======================

Common Exchange Codes (exchCode):

United States:
- US: United States
- NASDAQ: NASDAQ Stock Exchange
- NYSE: New York Stock Exchange
- NYSE AMERICAN: NYSE American (formerly AMEX)
- NYSE ARCA: NYSE Arca
- CBOE: Chicago Board Options Exchange
- CME: Chicago Mercantile Exchange

Europe:
- LONDON: London Stock Exchange
- LSE: London Stock Exchange
- EURONEXT-PARIS: Euronext Paris
- EURONEXT-AMSTER: Euronext Amsterdam
- XETRA: Deutsche Börse XETRA
- FRANKFURT: Frankfurt Stock Exchange
- SIX: SIX Swiss Exchange
- MILAN: Milan Stock Exchange

Asia-Pacific:
- TOKYO: Tokyo Stock Exchange
- HONG KONG: Hong Kong Stock Exchange
- SHANGHAI: Shanghai Stock Exchange
- SHENZHEN: Shenzhen Stock Exchange
- SGX: Singapore Exchange
- ASX: Australian Securities Exchange
- KOREA: Korea Exchange
- KOSDAQ: KOSDAQ

Other Major Markets:
- TORONTO: Toronto Stock Exchange
- TSX VENTURE: TSX Venture Exchange
- MEXICO: Mexican Stock Exchange
- SAO PAULO: B3 (Brasil Bolsa Balcão)
- JOHANNESBURG: Johannesburg Stock Exchange

Special Values:
- NOT LISTED: For unlisted securities
- OTC US: US Over-the-Counter
- OTC BB: OTC Bulletin Board
- PINK SHEETS: Pink Sheets

Usage Example:
{
  "idType": "ID_EXCH_SYMBOL",
  "idValue": "AAPL",
  "exchCode": "US"
}
`

// Security types content (subset of most common)
const securityTypesContent = `OpenFIGI Security Types
======================

Common Security Types (securityType):

Equity:
- Common Stock: Common/ordinary shares
- Preferred: Preferred shares
- ADR: American Depositary Receipt
- GDR: Global Depositary Receipt
- REIT: Real Estate Investment Trust
- MLP: Master Limited Partnership
- Right: Rights issue
- Warrant: Warrant
- Unit: Unit (combination of securities)

Fixed Income:
- Bond: General bond
- Conv Bond: Convertible bond
- COMMERCIAL PAPER: Commercial paper
- TREASURY BILL: Treasury bill
- MED TERM NOTE: Medium term note

Derivatives:
- Equity Option: Stock option
- Index Option: Index option
- Currency future.: Currency future
- Currency option.: Currency option

Funds:
- Mutual Fund: Mutual fund
- Open-End Fund: Open-end fund
- Closed-End Fund: Closed-end fund
- ETP: Exchange Traded Product

Other:
- Index: Market index
- Crypto: Cryptocurrency
- SWAP: Swap contract
- FRA: Forward rate agreement

Usage Example:
{
  "idType": "ID_ISIN",
  "idValue": "US0378331005",
  "securityType": "Common Stock"
}
`

// Market sectors content
const marketSectorsContent = `OpenFIGI Market Sectors
======================

Market Sector Values (marketSecDes):

- Equity: Stocks, shares, and equity derivatives
- Corp: Corporate bonds and debt instruments
- Govt: Government bonds and securities
- Muni: Municipal bonds
- Mtge: Mortgage-backed securities
- M-Mkt: Money market instruments
- Comdty: Commodities
- Curncy: Currencies and FX instruments
- Index: Market indices
- Pfd: Preferred securities

Usage Example:
{
  "idType": "ID_EXCH_SYMBOL",
  "idValue": "AAPL",
  "marketSecDes": "Equity"
}

Note: Market sector helps narrow down search results when multiple
securities share the same identifier across different asset classes.
`

export function handleResource(uri: string): {
  contents: Array<{
    uri: string
    mimeType: string
    text: string
  }>
} {
  switch (uri) {
    case 'openfigi://search-guide':
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: searchGuideContent,
          },
        ],
      }

    case 'openfigi://identifier-types':
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: identifierTypesContent,
          },
        ],
      }

    case 'openfigi://exchange-codes':
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: exchangeCodesContent,
          },
        ],
      }

    case 'openfigi://security-types':
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: securityTypesContent,
          },
        ],
      }

    case 'openfigi://market-sectors':
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: marketSectorsContent,
          },
        ],
      }

    default:
      throw new Error(`Unknown resource: ${uri}`)
  }
}

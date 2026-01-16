export type IdType =
  | 'ID_ISIN'
  | 'ID_BB_UNIQUE'
  | 'ID_SEDOL'
  | 'ID_COMMON'
  | 'ID_WERTPAPIER'
  | 'ID_CUSIP'
  | 'ID_BB'
  | 'ID_ITALY'
  | 'ID_EXCH_SYMBOL'
  | 'ID_FULL_EXCHANGE_SYMBOL'
  | 'COMPOSITE_ID_BB_GLOBAL'
  | 'ID_BB_GLOBAL_SHARE_CLASS_LEVEL'
  | 'ID_BB_GLOBAL'
  | 'ID_BB_SEC_NUM_DES'
  | 'ID_BB_SEC_NUM'
  | 'ID_CINS'
  | 'ID_BELGIUM'
  | 'ID_DENMARK'
  | 'ID_FRANCE'
  | 'ID_JAPAN'
  | 'ID_LUXEMBOURG'
  | 'ID_NETHERLANDS'
  | 'ID_POLAND'
  | 'ID_PORTUGAL'
  | 'ID_SWEDEN'
  | 'ID_SHORT_CODE'

export type SecurityType =
  | 'Common Stock'
  | 'Preference'
  | 'ADR'
  | 'Open-End Fund'
  | 'Closed-End Fund'
  | 'ETF'
  | 'ETN'
  | 'Unit'
  | 'Mutual Fund'
  | 'Money Market'
  | 'Commodity'
  | 'Currency'
  | 'Option'
  | 'Index'

export type MarketSector =
  | 'All'
  | 'Comdty'
  | 'Curncy'
  | 'Equity'
  | 'Govt'
  | 'Corp'
  | 'Index'
  | 'Money'
  | 'Mtge'
  | 'Muni'
  | 'Pref'

export interface MappingRequest {
  idType: IdType
  idValue: string
  exchCode?: string
  micCode?: string
  currency?: string
  marketSecDes?: MarketSector
  securityType?: SecurityType
  securityType2?: string
  includeUnlistedEquities?: boolean
  optionType?: 'Put' | 'Call'
  strike?: number[]
  contractSize?: number
  coupon?: number[]
  expiration?: number[]
  maturity?: number[]
  stateCode?: string
}

export interface FigiResult {
  figi: string
  securityType?: SecurityType
  marketSector?: MarketSector
  ticker?: string
  name?: string
  exchCode?: string
  shareClassFIGI?: string
  compositeFIGI?: string
  securityType2?: string
  securityDescription?: string
  metadata?: string
}

export interface MappingResponse {
  data?: FigiResult[]
  warning?: string
  error?: string
}

export interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date
}

export interface ClientConfig {
  apiKey?: string
  baseUrl?: string
  timeout?: number
  retryLimit?: number
  retryDelay?: number
  userAgent?: string
}

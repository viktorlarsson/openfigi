import { z } from 'zod'

export const IdTypeSchema = z.enum([
  'ID_ISIN',
  'ID_BB_UNIQUE',
  'ID_SEDOL',
  'ID_COMMON',
  'ID_WERTPAPIER',
  'ID_CUSIP',
  'ID_BB',
  'ID_ITALY',
  'ID_EXCH_SYMBOL',
  'ID_FULL_EXCHANGE_SYMBOL',
  'COMPOSITE_ID_BB_GLOBAL',
  'ID_BB_GLOBAL_SHARE_CLASS_LEVEL',
  'ID_BB_GLOBAL',
  'ID_BB_SEC_NUM_DES',
  'ID_BB_SEC_NUM',
  'ID_CINS',
  'ID_BELGIUM',
  'ID_DENMARK',
  'ID_FRANCE',
  'ID_JAPAN',
  'ID_LUXEMBOURG',
  'ID_NETHERLANDS',
  'ID_POLAND',
  'ID_PORTUGAL',
  'ID_SWEDEN',
  'ID_SHORT_CODE',
])

export const SecurityTypeSchema = z.enum([
  'Common Stock',
  'Preference',
  'ADR',
  'Open-End Fund',
  'Closed-End Fund',
  'ETF',
  'ETN',
  'Unit',
  'Mutual Fund',
  'Money Market',
  'Commodity',
  'Currency',
  'Option',
  'Index',
])

export const MarketSectorSchema = z.enum([
  'All',
  'Comdty',
  'Curncy',
  'Equity',
  'Govt',
  'Corp',
  'Index',
  'Money',
  'Mtge',
  'Muni',
  'Pref',
])

export const MappingRequestSchema = z.object({
  idType: IdTypeSchema,
  idValue: z.string().min(1),
  exchCode: z.string().optional(),
  micCode: z.string().optional(),
  currency: z.string().length(3).optional(),
  marketSecDes: MarketSectorSchema.optional(),
  securityType: SecurityTypeSchema.optional(),
  securityType2: z.string().optional(),
  includeUnlistedEquities: z.boolean().optional(),
  optionType: z.enum(['Put', 'Call']).optional(),
  strike: z.array(z.number()).optional(),
  contractSize: z.number().optional(),
  coupon: z.array(z.number()).optional(),
  expiration: z.array(z.number()).optional(),
  maturity: z.array(z.number()).optional(),
  stateCode: z.string().length(2).optional(),
})

export const FigiResultSchema = z.object({
  figi: z.string(),
  securityType: SecurityTypeSchema.optional(),
  marketSector: MarketSectorSchema.optional(),
  ticker: z.string().optional(),
  name: z.string().optional(),
  exchCode: z.string().optional(),
  shareClassFIGI: z.string().optional(),
  compositeFIGI: z.string().optional(),
  securityType2: z.string().optional(),
  securityDescription: z.string().optional(),
  metadata: z.string().optional(),
})

export const MappingResponseSchema = z.object({
  data: z.array(FigiResultSchema).optional(),
  warning: z.string().optional(),
  error: z.string().optional(),
})

export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  statusCode: z.number().optional(),
})

export const ClientConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  retryLimit: z.number().min(0).max(10).optional(),
  retryDelay: z.number().positive().optional(),
  userAgent: z.string().optional(),
})

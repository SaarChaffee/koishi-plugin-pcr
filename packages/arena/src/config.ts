import { Schema } from 'koishi'

export interface Config {
  API: { endpoint: string } | 'https://pcrdfans.com'
  API_KEY: string
  IPv4: boolean
}

export const Config: Schema<Config> = Schema.object({
  API: Schema.union([
    Schema.const('https://pcrdfans.com'),
    Schema.object({
      endpoint: Schema.string().required(),
    }).description('自定义 pcrdfans 的 API 地址'),
  ]).default('https://pcrdfans.com').description('pcrdfans 的 API 地址'),
  API_KEY: Schema.string().description('pcrdfans 的 API KEY').required(true),
  IPv4: Schema.boolean().default(false).description('仅使用 IPv4 连接'),
})

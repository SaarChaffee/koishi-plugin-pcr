import { Schema } from 'koishi'

export interface Config {
  API_KEY: string
  IPv4: boolean
}

export const Config: Schema<Config> = Schema.object({
  API_KEY: Schema.string().description('pcrdfans 的 API KEY').required(true),
  IPv4: Schema.boolean().default(false).description('仅使用 IPv4 连接'),
})

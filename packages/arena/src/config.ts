import { Schema } from 'koishi'

export interface ArenaConfig {
  API_KEY: string
}

export const Config: Schema<ArenaConfig> = Schema.object({
  API_KEY: Schema.string().description('pcrdfans 的 API KEY').required(true),
})

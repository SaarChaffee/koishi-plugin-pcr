import { Schema } from 'koishi'

export interface Config {
  API_KEY: string
}

export const Config: Schema<Config> = Schema.object({
  API_KEY: Schema.string().description('pcrdfans 的 API KEY').required(true),
})

import { Context, Schema } from 'koishi'

import { PCR } from './api'
import { PCRConfig } from './types'

export const name = 'pcr'

declare module 'koishi' {
  interface Context {
    pcr: PCR
  }
}

export const Config: Schema<PCRConfig> = Schema.object({
  root: Schema.path({
    filters: ['directory'],
    allowCreate: true,
  }).default('data/pcr').description('存储图片资源文件的相对路径。'),
})

export function apply(ctx: Context, config: PCRConfig) {
  ctx.plugin(PCR, config)
}

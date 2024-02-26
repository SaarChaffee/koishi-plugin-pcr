import { Context } from 'koishi'

import { PCR } from './api'
import { Config } from './config'

export const name = 'pcr'

export const inject = ['canvas']

declare module 'koishi' {
  interface Context {
    pcr: PCR
  }
}

export { PCR, Config }

export function apply(ctx: Context, config: Config) {
  ctx.plugin(PCR, config)
}

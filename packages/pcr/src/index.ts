/* eslint-disable max-len */
import { Context } from 'koishi'

import { PCR } from './api'
import { PCRConfig } from './config'

export const name = 'pcr'

export const inject = ['canvas']

declare module 'koishi' {
  interface Context {
    pcr: PCR
  }
}

export function apply(ctx: Context, config: PCRConfig) {
  ctx.plugin(PCR, config)
}

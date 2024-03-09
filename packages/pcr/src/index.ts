import { Context } from 'koishi'

import { PCR } from './api'
import { Config } from './config'

import type { } from 'koishi-plugin-pcr-landosol-roster'
export const name = 'pcr'

export const inject = {
  required: ['canvas'],
  optional: ['landosol-roster'],
}

declare module 'koishi' {
  interface Context {
    pcr: PCR
  }
}

export { PCR, Config }

export function apply(ctx: Context, config: Config) {
  ctx.plugin(PCR, config)

  ctx.inject(['pcr'], (ctx) => {
    ctx.on('pcr/landosol-roster-start', async () => {
      ctx.logger.debug('landosol-roster started')
      if (ctx.pcr.isReloading()) {
        await ctx.pcr.reloadRoster()
      }
    })

    ctx.on('pcr/landosol-roster-stop', () => {
      ctx.logger.debug('landosol-roster stopped')
      ctx.pcr.clearRoster()
    })
  })
}

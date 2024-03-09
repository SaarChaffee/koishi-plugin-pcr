import { Context, Schema, Service } from 'koishi'

export const name = 'landosol-roster'

declare module 'koishi' {
  interface Context {
    'landosol-roster': LandosolRoster
  }
  interface Events {
    'pcr/landosol-roster-start'(): void
    'pcr/landosol-roster-stop'(): void
  }
}

export const Config: Schema<object> = Schema.object({})

export class LandosolRoster extends Service {
  private CHARA_NAME
  private CHARA_PROFILE
  private UNAVAILABLE_CHARA: number[]

  constructor(ctx: Context) {
    super(ctx, 'landosol-roster', true)
    this.CHARA_NAME = require('../data/chara_name.json')
    this.CHARA_PROFILE = require('../data/chara_profile.json')
    this.UNAVAILABLE_CHARA = require('../data/unavailable_chara.json')
  }

  charaName() {
    return this.CHARA_NAME
  }

  charaProfile() {
    return this.CHARA_PROFILE
  }

  unavailableChara(): number[] {
    return this.UNAVAILABLE_CHARA
  }
}

export function apply(ctx: Context) {
  ctx.plugin(LandosolRoster)

  ctx.on('ready', () => {
    ctx.emit('pcr/landosol-roster-start')
  })

  ctx.on('dispose', () => {
    ctx.emit('pcr/landosol-roster-stop')
  })
}

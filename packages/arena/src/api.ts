/* eslint-disable max-len */
import { readFile } from 'fs/promises'
import path from 'path'

import { Image } from '@koishijs/canvas'
import { Context, Service } from 'koishi'

import { Config } from './config'
import { PcrdfansResponse } from './types'

export class Arena extends Service {
  private alias = ['怎么拆', '怎么解', '怎么打', '如何拆', '如何解', '如何打', 'jjc查询', 'jjc']
  private alias_bcr: string[] = []
  private alias_tw: string[] = []
  private alias_jp: string[] = []
  private aliases: string[]
  public EQUIPMENT: Image
  public STAR: Image
  public STAR_PINK: Image
  public STAR_DISABLE: Image
  public THUMB_DOWN: Image
  public THUMB_UP: Image
  public NUMBER_YELLOW: Image[] = []
  public NUMBER_BLUE: Image[] = []
  declare config: Config

  constructor(ctx: Context, config: Config) {
    super(ctx, 'arena', true)
    this.config = config
    this.alias.forEach(a => {
      this.alias_bcr.push(`b${a}`)
      this.alias_tw.push(`台${a}`)
      this.alias_jp.push(`日${a}`)
    })
    this.aliases = this.alias.concat(this.alias_bcr, this.alias_tw, this.alias_jp)
    this.alias_bcr.push('cn')
    this.alias_tw.push('tw')
    this.alias_jp.push('jp')
  }

  protected async start() {
    this.EQUIPMENT = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/EQUIPMENT.png')))
    this.STAR = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/STAR.png')))
    this.STAR_PINK = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/STAR_PINK.png')))
    this.STAR_DISABLE = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/STAR_DISABLE.png')))
    this.THUMB_DOWN = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/THUMB_DOWN_FILL.png')))
    this.THUMB_UP = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/THUMB_UP_FILL.png')))
    for (let i = 0; i < 10; i++) {
      this.NUMBER_YELLOW.push(await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, `../public/YELLOW_${i}.png`))))
      this.NUMBER_BLUE.push(await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, `../public/BLUE_${i}.png`))))
    }
  }

  normalize(...file: string[]) {
    return path.posix.normalize(path.resolve(...file))
  }

  async request(defenders: number[], region: number = 1): Promise<PcrdfansResponse> {
    const api = 'https://api.pcrdfans.com/x/v1/search'
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Authorization': this.config.API_KEY,
    }
    this.ctx.logger.debug(headers)
    const data = {
      _sign: 'a',
      def: defenders,
      nonce: 'a',
      page: 1,
      sort: 1,
      ts: Math.floor(Date.now() / 1000),
      region,
    }
    this.ctx.logger.debug(data)
    const res = await this.ctx.http.post<PcrdfansResponse>(api, data, { headers, timeout: 10000 }).catch((e) => {
      this.ctx.logger.error(e)
      return e
    })
    this.ctx.logger.debug(res)
    return res
  }

  prefix(msg: string): string | null {
    const escaped = this.aliases.map(item => `^${item}`)
    const pattern = escaped.join('|')
    const regex = new RegExp(pattern, 'gi')
    const match = msg.match(regex)?.[0]
    return match
  }

  region(msg: string): number {
    if (this.alias_bcr.includes(msg)) {
      return 2
    }
    if (this.alias_tw.includes(msg)) {
      return 3
    }
    if (this.alias_jp.includes(msg)) {
      return 4
    }
    return 1
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }
}

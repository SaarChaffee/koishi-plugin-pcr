/* eslint-disable max-len */
import { readFile } from 'fs/promises'
import path from 'path'

import { Image } from '@koishijs/canvas'
import { Context, Schema, Service } from 'koishi'

import { ArenaConfig, PcrdfansResponse } from './types'

import type { } from 'koishi-plugin-pcr'
import type { } from 'koishi-plugin-canvas'

export const name = 'arena'

declare module 'koishi' {
  interface Context {
    arena: Arena
  }
}

export const inject = ['pcr', 'canvas']

export const Config: Schema<ArenaConfig> = Schema.object({
  API_KEY: Schema.string().description('pcrdfans 的 API KEY').required(true),
})

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

  declare config: ArenaConfig

  constructor(ctx: Context, config: ArenaConfig) {
    super(ctx, 'arena', true)
    this.config = config
    this.alias.forEach(a => {
      this.alias_bcr.push(`b${a}`)
      this.alias_tw.push(`台${a}`)
      this.alias_jp.push(`日${a}`)
    })
    this.aliases = this.alias.concat(this.alias_bcr, this.alias_tw, this.alias_jp)
  }

  protected async start() {
    this.EQUIPMENT = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/equipment.png')))
    this.STAR = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/star.png')))
    this.STAR_PINK = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/star-pink.png')))
    this.STAR_DISABLE = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/star-disable.png')))
    this.THUMB_DOWN = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/thumb-down-fill.png')))
    this.THUMB_UP = await this.ctx.canvas.loadImage(await readFile(this.normalize(__dirname, '../public/thumb-up-fill.png')))
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
}

function roundRect(ctx, x, y, width, height, radius) {
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

export function apply(ctx: Context, config: ArenaConfig) {
  ctx.plugin(Arena, config)
  ctx.inject(['arena'], (ctx) => {
    ctx.middleware(async (session, next) => {
      const elemnts = session.elements
      const selfId = session.bot.selfId
      const prefix: string | Object = session.app.config.prefix.valueOf()
      ctx.logger.debug(elemnts)

      if (elemnts[0].type === 'at' && elemnts[0].attrs?.id === selfId) {
        elemnts.shift()
      }
      if (elemnts[0].type !== 'text') {
        return next()
      }

      let msg: string = elemnts[0].attrs.content.trim()
      if (typeof prefix === 'string') {
        if (msg.startsWith(prefix)) {
          msg = msg.substring(prefix.length, msg.length)
        }
      } else if (Array.isArray(prefix)) {
        for (const pre of prefix) {
          if (msg.startsWith(pre)) {
            msg = msg.substring(pre.length, msg.length)
          }
        }
      }

      const command = ctx.arena.prefix(msg)
      if (!command) {
        return next()
      }

      const def = msg.replace(command, '').trim()
      if (!def.trim()) {
        return `查询请发送"怎么拆+防守队伍"`
      }
      const defId = ctx.pcr.parseTeam(def, true)
      if (!defId[0]) {
        return `无法解析「${defId[1]}」`
      }
      if (defId.length < 5) {
        return `少于5名角色的检索条件请移步 pcrdfans b进行查询`
      }
      if (defId.length > 5) {
        return `编队不能多于5名角色`
      }
      if (defId.length !== (new Set(defId)).size) {
        return `编队中有重复的角色`
      }
      if (defId.some((d) => ctx.pcr.isUnavailableChara(Number(d)))) {
        return `编队中含未实装角色`
      }

      const region = ctx.arena.region(command)
      ctx.logger.debug(command)
      ctx.logger.debug(region)
      ctx.logger.debug(defId.map(t => t + '01').map(Number))

      await session.send('正在查询，请稍等...')
      const res = await ctx.arena.request(defId.map(t => t + '01').map(Number), region)
      ctx.logger.debug(res)
      if (res.code) {
        switch (res.code) {
          case 103:
            return `此 API KEY 已绑定至另一个 IP，请联系 Bot 主人解决。`
          case 117 || -429:
            return `高峰期服务器限流！请前往 pcrdfans 手动查询。`
          case 601:
            return `IP 被封禁，请联系 Bot 主人解决`
          default:
            return `未知错误：${res.code}，请联系 Bot 主人解决。`
        }
      }

      const result = res.data.result
      ctx.logger.debug(result)
      if (result.length === 0) {
        return `没有查询到解法\n作业上传请前往 pcrdfans`
      }

      const radius = 20
      const iconSize = 128
      const fontSize = 32
      const smallIconSize = 20
      const n = result.length >= 6 ? 6 : result.length
      const borderPix = 5
      const width = 5 * iconSize + radius * 2 - 8
      const height = n * (iconSize + borderPix) + fontSize * 2
      const fontPink = '#f55291'
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const fontBlue = '#1385e5'
      const borderYellow = '#f5d68e'

      await session.send('已查询到解法，正在渲染至图片，首次下载角色资源会耗时较久...')
      return await session.app.canvas.render(width + radius, height + radius, async (cv) => {
        cv.strokeStyle = borderYellow
        cv.lineWidth = borderPix
        cv.fillStyle = 'rgb(253, 251, 249)'
        roundRect(cv, radius / 5, radius / 5, width, height, radius)
        cv.fill()
        cv.stroke()

        for (let i = 0; i < n; i++) {
          for (let j = 0; j < 5; j++) {
            ctx.logger.debug(`i: ${i}, j: ${j}`)
            const atk = result[i].atk[j]
            const star = result[i].atk[j].star === 0 ? 3 : result[i].atk[j].star
            ctx.logger.debug(`atk star: ${atk.star}`)
            ctx.logger.debug(`star: ${star}`)

            const x = iconSize * j + radius
            const y = (iconSize + borderPix) * i + radius
            const image = await ctx.pcr.getUnitIcon(atk.id.toString().slice(0, -2), star, true)
            cv.drawImage(
              image.buffer as Image,
              x,
              y,
              iconSize,
              iconSize,
            )

            if (atk.equip) {
              cv.drawImage(
                ctx.arena.EQUIPMENT,
                x + borderPix,
                y + borderPix,
                smallIconSize,
                smallIconSize,
              )
            }

            for (let k = 1; k <= 6; k++) {
              if (k === 6 && star === 6) {
                cv.drawImage(
                  ctx.arena.STAR_PINK,
                  x + (smallIconSize - borderPix) * (k - 1),
                  y + iconSize - smallIconSize,
                  smallIconSize,
                  smallIconSize,
                )
              } else if (k <= star) {
                cv.drawImage(
                  ctx.arena.STAR,
                  x + (smallIconSize - borderPix) * (k - 1),
                  y + iconSize - smallIconSize,
                  smallIconSize,
                  smallIconSize,
                )
              } else if (k > star && k < 6) {
                cv.drawImage(
                  ctx.arena.STAR_DISABLE,
                  x + (smallIconSize - borderPix) * (k - 1),
                  y + iconSize - smallIconSize,
                  smallIconSize,
                  smallIconSize,
                )
              }
            }
          }
        }

        cv.font = `bolder ${fontSize}px sans-serif`
        cv.textAlign = 'left'
        cv.textBaseline = 'top'
        cv.fillStyle = fontPink
        const support = 'Support by pcrdfans.com'
        cv.fillText(
          support,
          radius,
          (iconSize + borderPix) * n + radius,
        )
      })
    }, true)

    ctx
      .command('怎么拆 <def:string>')
      .alias('b怎么拆')
      .alias('台怎么拆')
      .alias('日怎么拆')
  })
}

import { Image } from '@koishijs/canvas'
import { Context } from 'koishi'

import { Arena } from './api'
import { ArenaConfig } from './config'
import type { } from 'koishi-plugin-canvas'
import type { } from 'koishi-plugin-pcr'

export const name = 'arena'

declare module 'koishi' {
  interface Context {
    arena: Arena
  }
}

export const inject = ['pcr', 'canvas']

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
      const numberHeight = 46
      const numberWidth = 35
      const smallIconSize = 20
      const n = result.length >= 6 ? 6 : result.length
      const borderPix = 5
      const width = 5 * iconSize + radius * 2 +
        (Math.max(...result.map(r => Math.max(r.up, r.down))).toString().length + 1) * numberWidth
      const height = n * (iconSize + borderPix) + fontSize * 2
      const fontPink = '#fa5393'
      const borderYellow = '#f5d68e'

      await session.send('已查询到解法，正在渲染至图片，首次下载角色资源会耗时较久...')
      return await session.app.canvas.render(width + radius, height + radius, async (cv) => {
        cv.strokeStyle = borderYellow
        cv.lineWidth = borderPix
        cv.fillStyle = 'rgb(253, 251, 249)'
        ctx.arena.roundRect(cv, radius / 5, radius / 5, width, height, radius)
        cv.fill()
        cv.stroke()

        for (let i = 0; i < n; i++) {
          let x = 0
          let y = 0
          for (let j = 0; j < 5; j++) {
            ctx.logger.debug(`i: ${i}, j: ${j}`)
            const atk = result[i].atk[j]
            const star = result[i].atk[j].star === 0 ? 3 : result[i].atk[j].star
            ctx.logger.debug(`atk star: ${atk.star}`)
            ctx.logger.debug(`star: ${star}`)

            x = iconSize * j + radius
            y = (iconSize + borderPix) * i + radius
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
                  x + (smallIconSize - borderPix) * (k - 1) + 2,
                  y + iconSize - smallIconSize - 2,
                  smallIconSize,
                  smallIconSize,
                )
              } else if (k <= star) {
                cv.drawImage(
                  ctx.arena.STAR,
                  x + (smallIconSize - borderPix) * (k - 1) + 2,
                  y + iconSize - smallIconSize - 2,
                  smallIconSize,
                  smallIconSize,
                )
              } else if (k > star && k < 6) {
                cv.drawImage(
                  ctx.arena.STAR_DISABLE,
                  x + (smallIconSize - borderPix) * (k - 1) + 2,
                  y + iconSize - smallIconSize - 2,
                  smallIconSize,
                  smallIconSize,
                )
              }
            }
          }

          x += iconSize
          y += 9
          cv.drawImage(
            ctx.arena.THUMB_UP,
            x,
            y,
            numberHeight,
            numberHeight,
          )
          cv.drawImage(
            ctx.arena.THUMB_DOWN,
            x,
            y + iconSize / 2,
            numberHeight,
            numberHeight,
          )

          x += numberHeight
          const up = result[i].up.toString()
          const down = result[i].down.toString()
          for (let i = 0; i < Math.max(up.length, down.length); i++) {
            if (i < up.length) {
              cv.drawImage(
                ctx.arena.NUMBER_YELLOW[Number(up[i])],
                x + numberWidth * i,
                y,
                numberWidth,
                numberHeight,
              )
            }
            if (i < down.length) {
              cv.drawImage(
                ctx.arena.NUMBER_BLUE[Number(down[i])],
                x + numberWidth * i,
                y + iconSize / 2,
                numberWidth,
                numberHeight,
              )
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

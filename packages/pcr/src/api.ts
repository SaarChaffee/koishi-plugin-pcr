import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'

import type { } from 'koishi-plugin-canvas'
import { Image } from '@koishijs/canvas'
import { fromBuffer } from 'file-type'
import { Context, Service, sanitize } from 'koishi'

import { Config } from './config'
import { Trie } from './trie'
import { Chara, CharacterProfile, CharacterProfiles, ImageInfo, Result } from './types'

export class PCR extends Service {
  private CHARA_URL: string
  private CHARA_NAME = '/chara_name.json'
  private CHARA_PROFILE = '/chara_profile.json'
  private UNAVAILABLE_CHARA = '/unavailable_chara.json'
  private RESOURCE_URL = 'https://redive.estertion.win'
  private CARD_PROFILE = '/card/profile'
  private ICON_UNIT = '/icon/unit'
  private CARD_FULL = '/card/full'

  private charaName: Chara = {}
  private charaProfile: CharacterProfiles = {}
  private unavailableChara: number[] = []
  private root: string
  private trie: Trie

  declare config: Config

  constructor(ctx: Context, config: Config) {
    super(ctx, 'pcr')
    this.config = config
    this.CHARA_URL = typeof this.config.LandosolRoster === 'string'
      ? this.config.LandosolRoster
      : this.config.LandosolRoster.endpoint
    this.trie = new Trie()
    this.root = join(this.ctx.baseDir, this.config.root)
  }

  protected async start() {
    await this.initCharaName()
    await this.initCharaProfile()
    await this.initUnavailableChara()
  }

  getRoot() {
    return this.root
  }

  async getImage(url: string, fullPath: string, canvas?: boolean): Promise<ImageInfo> {
    let buffer: Buffer | Image
    this.ctx.logger.debug(`getImage: ${url}`)
    this.ctx.logger.debug(`fullPath: ${fullPath}`)
    if (existsSync(fullPath)) {
      buffer = await readFile(fullPath)
    } else {
      const path = dirname(fullPath)
      if (!existsSync(path)) {
        await mkdir(path, { recursive: true })
      }
      const file = await this.ctx.http.file(url)
      this.ctx.logger.debug(file.filename)
      this.ctx.logger.info(`正在下载资源: ${fullPath}`)
      buffer = Buffer.from(file.data)
      await writeFile(fullPath, buffer)
    }
    const type = (await fromBuffer(buffer)).ext
    buffer = canvas ? await this.ctx.canvas.loadImage(buffer) : buffer
    return { buffer, type }
  }

  async getCardProfile(id: string, star: number = 1, canvas?: boolean): Promise<ImageInfo> {
    star = star >= 1 && star < 3 ? 1 : star >= 3 && star < 6 ? 3 : star === 6 ? 6 : 3
    const name = `${id}${star}1.webp`
    const path = join(this.root, this.CARD_PROFILE)
    return this.getImage(this.RESOURCE_URL + this.CARD_PROFILE + sanitize(name), join(path, name), canvas)
  }

  async getUnitIcon(id: string, star: number = 1, canvas?: boolean): Promise<ImageInfo> {
    star = star >= 1 && star < 3 ? 1 : star >= 3 && star < 6 ? 3 : star === 6 ? 6 : 3
    const name = `${id}${star}1.webp`
    const path = join(this.root, this.ICON_UNIT)
    return this.getImage(this.RESOURCE_URL + this.ICON_UNIT + sanitize(name), join(path, name), canvas)
  }

  async getCardFull(id: string, star: number = 1, canvas?: boolean): Promise<ImageInfo> {
    star = star >= 1 && star < 3 ? 1 : star >= 3 && star < 6 ? 3 : star === 6 ? 6 : 3
    const name = `${id}${star}1.webp`
    const path = join(this.root, this.CARD_FULL)
    return this.getImage(this.RESOURCE_URL + this.CARD_FULL + sanitize(name), join(path, name), canvas)
  }

  async initCharaName(res?: Result) {
    res ||= await this.ctx.http.get(this.CHARA_URL + this.CHARA_NAME, { responseType: 'json' })
    this.ctx.logger.debug(res)
    for (const [key, values] of Object.entries(res)) {
      for (const value of values) {
        if (value in this.charaName) {
          this.ctx.logger.warn(`init chara: 出现重名「${value}」于id: ${this.charaName[value]} 与id: ${key}`)
        }
        this.charaName[value] = key
        this.trie.insert(value)
      }
    }
  }

  async initCharaProfile(res?: CharacterProfiles) {
    res ||= await this.ctx.http.get(this.CHARA_URL + this.CHARA_PROFILE, { responseType: 'json' })
    this.ctx.logger.debug(res)
    this.charaProfile = res
  }

  async initUnavailableChara(res?: number[]) {
    res ||= await this.ctx.http.get(this.CHARA_URL + this.UNAVAILABLE_CHARA, { responseType: 'json' })
    this.ctx.logger.debug(res)
    this.unavailableChara = res
  }

  getCharaProfile(id: string): CharacterProfile {
    return this.charaProfile[id]
  }

  isUnavailableChara(id: number): boolean {
    return this.unavailableChara.includes(id)
  }

  parseTeam(str: string, toID?: boolean): string[] | [boolean, string] {
    const team = []
    while (true) {
      if (!str.length) {
        break
      }
      const [res, prefix] = this.trie.longestPrefix(str)
      if (res && prefix.length) {
        str = str.slice(prefix.length).trim()
        team.push(toID ? this.charaName[prefix] : prefix)
      } else {
        this.ctx.logger.error(`Parser: 无法解析「${prefix}」`)
        return [res, prefix]
      }
    }
    return team
  }
}

import { Schema } from 'koishi'

export interface PCRConfig {
  root: string
  LandosolRoster: { endpoint: string } | string
}

export const Config: Schema<PCRConfig> = Schema.object({
  root: Schema.path({
    filters: ['directory'],
    allowCreate: true,
  }).default('data/pcr').description('存储图片资源文件的相对路径。'),
  LandosolRoster: Schema.union([
    Schema.const('https://mirror.ghproxy.com/https://raw.githubusercontent.com/Ice9Coffee/LandosolRoster/master')
      .description('Ghproxy 代理的 Github'),
    Schema.const('https://raw.githubusercontent.com/Ice9Coffee/LandosolRoster/master').description('Github 直连'),
    Schema.object({
      endpoint: Schema.string().required().description('数据源的地址。'),
    }).description('自定义'),
  ]).description('兰德索尔花名册数据源。')
    .default('https://mirror.ghproxy.com/https://raw.githubusercontent.com/Ice9Coffee/LandosolRoster/master'),
}) as Schema<PCRConfig>

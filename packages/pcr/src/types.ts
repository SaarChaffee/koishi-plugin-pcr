import { Image } from '@koishijs/canvas'

export interface Result {
  [key: string]: string[]
}

export interface Chara {
  [key: string]: string
}

export interface CharacterProfile {
  名字: string
  公会: string
  生日: string
  年龄: string
  身高: string
  体重: string
  血型: string
  种族: string
  喜好: string
  声优: string
  口头禅和座右铭?: string
  口头禅?: string
  座右铭?: string
  特技?: string
  儿时玩伴?: string
  隐藏特技?: string
  无人能出其右的技巧?: string
  称号?: string
  生活习惯?: string
  切嚕唎咧咧囉唎囉唎囉?: string
  性格特点?: string
  职位?: string
  真正的名字?: string
  工作?: string
  装备?: string
  创办的组织?: string
  特点?: string
  姊姊?: string
  妹妹?: string
  罪过?: string
  癖好?: string
  身份?: string
  绝技?: string
  问候的方式?: string
  最喜欢?: string
  性格?: string
  伙伴?: string
  憧憬的地方?: string
  爱读的书?: string
  职业道路?: string
  家传剑技?: string
  家传剑技的奥义?: string
  外表?: string
  信条?: string
  自称?: string
  职责?: string
}

export interface CharacterProfiles {
  [key: string]: CharacterProfile
}

export interface PCRConfig {
  root: string
  LandosolRoster: { endpoint: string } | string
}

export interface ImageInfo {
  buffer: Buffer | Image
  type: string
}

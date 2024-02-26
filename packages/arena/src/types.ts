export interface PcrdfansResponse {
  code: number
  message: string
  data?: PcrdfansData
  version: string
}

export interface PcrdfansData {
  result: PcrdfansResult[]
  page: PcrdfansPage
}

export interface PcrdfansResult {
  id: string
  atk: PcrdfansAtkDef[]
  def: PcrdfansAtkDef[]
  iseditor: boolean
  private: boolean
  group: boolean
  updated: string
  up: number
  down: number
  comment: PcrdfansComment[]
  liked: boolean
  disliked: boolean
}

export interface PcrdfansPage {
  page: number
  hasMore: boolean
}

export interface PcrdfansAtkDef {
  equip: boolean
  id: number
  star: number
}

export interface PcrdfansComment {
  id: string
  date: string
  msg: string
  nickname: string
  avatar: number
}

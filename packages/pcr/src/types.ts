export interface Result {
  [key: string]: string[]
}

export interface Chara {
  [key: string]: string
}

export interface PCRConfig {
  root: string
}

export interface ImageInfo {
  buffer: Buffer
  type: string
}

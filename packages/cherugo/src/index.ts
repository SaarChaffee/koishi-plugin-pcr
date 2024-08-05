import { Context } from 'koishi'

export const name = 'cherugo'

export function apply(ctx: Context) {
  const CHERU_SET = '切卟叮咧哔唎啪啰啵嘭噜噼巴拉蹦铃'
  const CHERU_DIC: { [key: string]: number } = {}
  for (let i = 0; i < CHERU_SET.length; i++) {
    CHERU_DIC[CHERU_SET[i]] = i
  }
  const ENCODING = 'gb18030'
  const rexSplit = /\b/u
  const rexWord = /^\w+$/u
  const rexCheruWord = new RegExp(`切[${CHERU_SET}]+`, 'ug')

  function* grouper<T>(iterable: Iterable<T>, n: number, fillvalue: T | null = null): IterableIterator<T[]> {
    let buffer: T[] = []
    for (const item of iterable) {
      buffer.push(item)
      if (buffer.length === n) {
        yield buffer
        buffer = []
      }
    }
    if (buffer.length > 0) {
      while (buffer.length < n) {
        buffer.push(fillvalue as T)
      }
      yield buffer
      buffer = []
    }
  }

  function word2cheru(w: string): string {
    const c = ['切']
    const encoder = new TextEncoder()
    const bytes = encoder.encode(w)
    for (const b of bytes) {
      c.push(CHERU_SET[b & 0xf])
      c.push(CHERU_SET[(b >> 4) & 0xf])
    }
    return c.join('')
  }

  function cheru2word(c: string): string {
    if (c[0] !== '切' || c.length < 2) {
      return c
    }
    const b: number[] = []
    for (const [b1, b2] of grouper(c.slice(1), 2, '切')) {
      let x = CHERU_DIC[b2] ?? 0
      x = (x << 4) | (CHERU_DIC[b1] ?? 0)
      b.push(x)
    }
    const decoder = new TextDecoder(ENCODING)
    return decoder.decode(new Uint8Array(b))
  }

  function str2cheru(s: string): string {
    return s.split(rexSplit).map(w => rexWord.test(w) ? word2cheru(w) : w).join('')
  }

  function cheru2str(c: string): string {
    return c.replace(rexCheruWord, w => cheru2word(w))
  }

  ctx
    .command('cherugo <text:text>', '切噜一下，转换为切噜语')
    .action((_, text) => {
      return str2cheru(text)
    })

  ctx
    .command('cheru～♪ <text:text>', '切噜～♪切啰巴切拉切蹦切蹦，切噜语翻译')
    .action((_, text) => {
      return cheru2str(text)
    })

  ctx.middleware((session, next) => {
    const elements = session.elements
    const selfId = session.bot.selfId
    const prefix: string | string[] = session.app.config.prefix.valueOf()
    const regexp = /^(切噜～♪|cheru～♪)(.*)$/u

    if (!elements || !elements.length) {
      return next()
    }
    if (elements[0].type === 'at' && elements[0].attrs?.id === selfId) {
      elements.shift()
    }
    if (elements[0].type !== 'text') {
      return next()
    }

    let msg: string = elements[0].attrs.content.trim()
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

    if (!regexp.test(msg)) return next()
    const match = msg.match(regexp)
    return session.execute({ name: 'cheru～♪', args: [match[2]] })
  })
}

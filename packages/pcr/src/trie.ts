import { Logger } from 'koishi'

export const name = 'pcr-trie'

const logger = new Logger(name)

export class TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean
  constructor() {
    this.children = new Map()
    this.isEndOfWord = false
  }
}

export class Trie {
  root: TrieNode
  constructor() {
    this.root = new TrieNode()
  }

  insert(word: string): void {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode())
      }
      node = node.children.get(char)!
    }
    node.isEndOfWord = true
  }

  search(word: string): boolean {
    let node = this.root
    for (let i = 0; i < word.length; i++) {
      const char = word[i]
      if (!node.children.has(char)) {
        return false
      }
      node = node.children.get(char)
    }
    return node.isEndOfWord
  }

  longestPrefix(word: string): [boolean, string] {
    let node = this.root
    let prefix = ''
    for (let i = 0; i < word.length; i++) {
      const char = word[i]
      logger.debug('char: ' + char)
      if (!node.children.has(char)) {
        logger.debug('char break: ' + char)
        return [false, prefix + char]
      }
      node = node.children.get(char)
      prefix += char
      if (node.isEndOfWord && !node.children.get(word[i + 1])) {
        return [true, prefix]
      }
    }
    return [true, prefix]
  }
}

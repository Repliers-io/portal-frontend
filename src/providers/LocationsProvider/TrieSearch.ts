import { trieMaxResults } from '@configs/search'

import TrieNode from './TrieNode'

class TrieSearch<T> {
  r: TrieNode<T>

  constructor() {
    this.r = new TrieNode<T>()
  }

  private normalizeChar(char: string): string {
    return char.toLowerCase()
  }

  // passing second argument makes method type-agnostic
  insert(option: T, name: string): void {
    const words = name.split(/[ -]/)
    // legacy implementation
    //   const words = (
    //     option.source as Exclude<AutosuggestionOptionSource, Property>
    //   ).name.split(/[ -]/)
    for (let i = 0; i < words.length; i += 1) {
      let node = this.r
      // Insert all suffixes starting from word[i]
      for (let j = i; j < words.length; j += 1) {
        const word = words[j]
        // eslint-disable-next-line no-restricted-syntax
        for (const char of word!) {
          const normalizedChar = this.normalizeChar(char)
          if (!node.c.has(normalizedChar)) {
            node.c.set(normalizedChar, new TrieNode<T>())
          }
          node = node.c.get(normalizedChar)!
          node.s.add(option)
        }
        // Special handling for space character if it's not the last word
        if (j < words.length - 1) {
          const spaceChar = ' '
          if (!node.c.has(spaceChar)) {
            node.c.set(spaceChar, new TrieNode<T>())
          }
          node = node.c.get(spaceChar)!
          node.s.add(option)
        }
      }
    }
  }

  search(prefix: string, limit: number = trieMaxResults): T[] {
    let node = this.r
    // eslint-disable-next-line no-restricted-syntax
    for (const char of prefix) {
      const normalizedChar = this.normalizeChar(char)
      if (!node.c.has(normalizedChar)) {
        return []
      }
      node = node.c.get(normalizedChar)!
    }
    return limit ? Array.from(node.s).slice(0, limit) : Array.from(node.s)
  }
}

export default TrieSearch

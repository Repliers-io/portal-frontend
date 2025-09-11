// c - children
// s - suggestions
// r - root

class TrieNode<T> {
  // eslint-disable-next-line no-use-before-define
  c: Map<string, TrieNode<T>>

  s: Set<T>

  constructor() {
    this.c = new Map<string, TrieNode<T>>()
    this.s = new Set<T>()
  }
}

export default TrieNode

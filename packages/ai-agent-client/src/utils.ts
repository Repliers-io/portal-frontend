// Generate session ID
export const generateSessionId = (): string =>
  `agent-session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

// Get random item from array
export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]!
}

// Get random item from array excluding current one
export const getRandomExcluding = <T>(array: T[], current: T): T => {
  const filtered = array.filter((item) => item !== current)
  if (filtered.length === 0) return getRandomItem(array)

  return filtered[Math.floor(Math.random() * filtered.length)]!
}

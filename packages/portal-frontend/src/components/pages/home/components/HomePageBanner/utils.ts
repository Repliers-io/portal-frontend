const randomImage = (items: string | string[]) => {
  if (Array.isArray(items)) {
    const randomIndex = Math.floor(Math.random() * items.length)
    return items[randomIndex]
  }
  return items
}

export { randomImage }

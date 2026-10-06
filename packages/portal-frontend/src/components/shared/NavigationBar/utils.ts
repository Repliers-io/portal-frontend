/** Smooth-scrolls a horizontal row of section tabs so `item` sits in its middle. */
export const centerInRow = (row: HTMLElement, item: HTMLElement) => {
  const rowRect = row.getBoundingClientRect()
  const itemRect = item.getBoundingClientRect()
  const left =
    row.scrollLeft +
    (itemRect.left - rowRect.left) -
    (rowRect.width - itemRect.width) / 2
  row.scrollTo({ left, behavior: 'smooth' })
}

export const updateUrlAnchor = (anchor: string) => {
  const url = new URL(window.location.href)
  url.hash = anchor
  window.history.replaceState(null, '', url.toString())
}

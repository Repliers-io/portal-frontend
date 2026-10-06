import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ComponentType } from 'react'

const cache = new Map<ComponentType, string>()

/**
 * Renders a MUI icon component to a clean SVG string (once per icon type, cached).
 * Strips MUI class names — only the viewBox and path content are kept.
 * Uses renderToStaticMarkup: synchronous, no DOM needed, no React root lifecycle.
 */
export const renderIconSvg = (Icon: ComponentType): string => {
  if (cache.has(Icon)) return cache.get(Icon)!
  const html = renderToStaticMarkup(createElement(Icon))
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  const svgEl = tmp.querySelector('svg')
  const result = svgEl
    ? `<svg viewBox="${svgEl.getAttribute('viewBox') ?? '0 0 24 24'}" xmlns="http://www.w3.org/2000/svg">${svgEl.innerHTML}</svg>`
    : html
  cache.set(Icon, result)
  return result
}

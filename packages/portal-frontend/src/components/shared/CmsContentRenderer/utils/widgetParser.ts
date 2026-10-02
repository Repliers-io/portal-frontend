import { unflattenParams } from 'utils/path'

export interface WidgetConfig {
  name: string
  props: Record<string, string | string[]>
  originalMatch: string
}

/**
 * Parses widget properties string into key-value pairs
 * Supports:
 * - param="value"
 * - param='value'
 * - param=value (no quotes for values without spaces)
 * - param.nested="value" (dot notation for nested objects)
 * - Multiple same params form arrays
 */
function parseWidgetProps(
  propsString: string
): Record<string, string | string[]> {
  const props: Record<string, string[]> = {}

  if (!propsString) return {}

  const propRegex = /([\w.]+)(?:="([^"]*)"|=([^\s\]]+))?/g

  let match: RegExpExecArray | null

  while ((match = propRegex.exec(propsString)) !== null) {
    const key = match[1]
    const value = match[0].includes('=') ? (match[2] ?? match[3] ?? '') : 'true'

    if (!props[key]) {
      props[key] = []
    }
    props[key].push(value)
  }

  const flatResult: Record<string, string | string[]> = {}
  for (const [key, values] of Object.entries(props)) {
    flatResult[key] = values.length === 1 ? values[0] : values
  }

  return unflattenParams(flatResult) as Record<string, string | string[]>
}

/**
 * Parses widget tags from content string
 * Format: [WidgetName param1="value1" param2="value2" paramArray="val1" paramArray="val2"]
 *
 * Rules:
 * - Widget names must start with uppercase letter (e.g., [CarouselWidget])
 * - Widget names must end with "Widget" suffix (e.g., [TestWidget], [CarouselWidget])
 * - This prevents parsing text like [email], [link], or [Carousel] as widgets
 * - Values without spaces can omit quotes
 * - Values with spaces must be in quotes
 * - Multiple params with same name create an array
 * - Both single and double quotes are supported
 */
export function parseWidgets(content: string): WidgetConfig[] {
  const widgets: WidgetConfig[] = []

  // Match widget tags: [WidgetName ...props]
  // Widget name must: start with uppercase letter AND end with "Widget"
  // Props section allows ] inside quoted strings ("..." or '...')
  const widgetRegex = /\[([A-Z]\w*Widget)((?:[^\]"']|"[^"]*"|'[^']*')*)\]/g

  let match: RegExpExecArray | null

  while ((match = widgetRegex.exec(content)) !== null) {
    const [originalMatch, name, propsString] = match

    if (!name) continue

    const props = parseWidgetProps(propsString.trim())

    widgets.push({
      name,
      props,
      originalMatch
    })
  }

  return widgets
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Replaces widget tags in content with placeholders
 * Returns modified content and extracted widgets
 *
 * When a widget tag is the sole content of a <p> block (produced by autop() or
 * Gutenberg's <!-- wp:paragraph --> wrapper), the entire block is replaced instead
 * of just the tag. This prevents orphaned `<p>` / `</p>` fragments from ending up
 * as text parts after splitting, which would produce invalid HTML nesting
 * (<div> inside <span>) and break React hydration.
 */
export function extractWidgets(content: string): {
  content: string
  widgets: WidgetConfig[]
} {
  const widgets = parseWidgets(content)
  let modifiedContent = content

  widgets.forEach((widget, index) => {
    const placeholder = `<span repliers-widget-placeholder="${index}"></span>`
    const escaped = escapeRegex(widget.originalMatch)

    // Gutenberg: <!-- wp:paragraph -->\n<p>WIDGET</p>\n<!-- /wp:paragraph -->
    const gutenbergBlock = new RegExp(
      `<!--\\s*wp:paragraph[^>]*-->\\s*<p>\\s*${escaped}\\s*<\\/p>\\s*<!--\\s*\\/wp:paragraph\\s*-->`
    )
    // Plain <p> wrapper produced by autop() or raw HTML
    const plainParagraph = new RegExp(`<p>\\s*${escaped}\\s*<\\/p>`)

    if (gutenbergBlock.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(gutenbergBlock, placeholder)
    } else if (plainParagraph.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(plainParagraph, placeholder)
    } else {
      modifiedContent = modifiedContent.replace(
        widget.originalMatch,
        placeholder
      )
    }
  })

  return {
    content: modifiedContent,
    widgets
  }
}

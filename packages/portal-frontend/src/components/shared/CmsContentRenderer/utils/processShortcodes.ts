import blogConfig from '@configs/blog'

/**
 * Processes WordPress shortcodes in content:
 * 1. Replaces configured shortcodes with component markers (e.g., [building-form] -> [BuildingContactWidget])
 * 2. Removes unwanted shortcodes based on prefix matching (e.g., all optima_express_*)
 */
export function processShortcodes(content: string): string {
  if (!content) return ''

  let processedContent = content

  // Step 1: Replace shortcodes with component markers
  // Captures optional attributes so [youtube-feed feed="1"] → [YouTubeWidget feed="1"]
  Object.entries(blogConfig.shortcodeReplacements).forEach(
    ([shortcode, widget]) => {
      const escaped = shortcode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\[${escaped}([^\\]]*)\\]`, 'g')
      processedContent = processedContent.replace(regex, `[${widget}$1]`)
    }
  )

  // Step 2: Remove unwanted shortcodes using prefix matching
  blogConfig.removeShortcodes.forEach((shortcodePrefix) => {
    // Match shortcodes that start with the prefix
    // e.g., 'optima_express' matches [optima_express_toppicks ...], [optima_express_search], etc.
    const regex = new RegExp(`\\[${shortcodePrefix}[^\\]]*\\]`, 'g')
    processedContent = processedContent.replace(regex, '')
  })

  return processedContent
}

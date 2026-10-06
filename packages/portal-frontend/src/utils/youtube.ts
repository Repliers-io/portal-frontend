/**
 * Extract YouTube video IDs from URLs
 * Supports multiple YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */

// The match runs to the end of the URL: share links carry a tail (?si=…, &t=…) that would
// otherwise stay behind as text.
const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})[^\s<"']*/g

export type YouTubeExtraction = {
  videoIds: string[]
  remainingContent: string
}

/**
 * Extract YouTube URLs from content and return video IDs and cleaned content
 */
export function extractYouTubeVideos(content: string): YouTubeExtraction {
  if (!content) {
    return { videoIds: [], remainingContent: '' }
  }

  const videoIds: string[] = []
  const matches = content.matchAll(YOUTUBE_REGEX)

  for (const match of matches) {
    if (match[1]) {
      videoIds.push(match[1])
    }
  }

  // Remove YouTube URLs from content
  const remainingContent = content
    .replace(YOUTUBE_REGEX, '')
    .replace(/\s+/g, ' ') // Clean up multiple spaces
    .replace(/(<p>\s*<\/p>|<p><\/p>)/g, '') // Remove empty paragraphs
    .trim()

  return {
    videoIds: [...new Set(videoIds)], // Remove duplicates
    remainingContent
  }
}

/**
 * Returns YouTube auto-generated thumbnail URL
 * Thumbnail size options: default (120x90), mqdefault (320x180), hqdefault (480x360), sddefault (640x480), maxresdefault (1280x720)
 */
export const youTubeThumbnail = (videoId: string) => {
  const apiUrl = 'https://i.ytimg.com/vi'
  return `${apiUrl}/${videoId}/maxresdefault.jpg`
}

/**
 * Replace YouTube URLs in content with responsive iframe embeds
 * Skips URLs that are inside HTML attributes (like href="...")
 */
export function replaceYouTubeWithIframe(content: string): string {
  if (!content) return ''

  // Split content by HTML tags to avoid replacing URLs inside attributes
  const parts: Array<{ tag: boolean; content: string }> = []
  let lastIndex = 0
  const tagRegex = /<[^>]+>/g
  let match

  while ((match = tagRegex.exec(content)) !== null) {
    // Add text before tag
    if (match.index > lastIndex) {
      parts.push({
        tag: false,
        content: content.substring(lastIndex, match.index)
      })
    }
    // Add tag itself
    parts.push({ tag: true, content: match[0] })
    lastIndex = tagRegex.lastIndex
  }
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ tag: false, content: content.substring(lastIndex) })
  }

  // Replace YouTube URLs only in text parts, not in tags
  return parts
    .map((part) => {
      if (part.tag) {
        return part.content
      }
      return part.content.replace(
        YOUTUBE_REGEX,
        (_match, videoId) =>
          `<div style="position:relative;padding-bottom:56.25%;height:0;margin:2rem 0;border-radius:4px;overflow:hidden"><iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"></iframe></div>`
      )
    })
    .join('')
}

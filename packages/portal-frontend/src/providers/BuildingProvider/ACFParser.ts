/**
 * Building ACF Parser
 * Extracts and transforms building data from ACF fields
 */

import { decode } from 'he'

import { processShortcodes } from '@shared/CmsContentRenderer'
import { autop } from '@wordpress/autop'

import { sanitizeHtmlContent } from 'services/CMS'
import { extractYouTubeVideos } from 'utils/youtube'

export type SlideshowImage = {
  large?: string
  medium?: string
  small?: string
}

export type SectionImage = {
  url: string
  alt?: string
  width?: number
  height?: number
}

export class ACFParser {
  public amenities: string[] | string
  public description: string
  public map_description: string
  public sections: Array<{ content: string; [key: string]: any }>
  public slideshow: SlideshowImage[];
  [key: string]: any

  private embedded: any
  private relatedBuildings: any[]

  constructor(acf: any, embedded?: any, relatedBuildings?: any[]) {
    this.embedded = embedded
    this.relatedBuildings = relatedBuildings || []
    // Copy all original ACF fields
    if (acf) {
      Object.assign(this, acf)
    }

    // Override with parsed/sanitized versions
    this.amenities = this.parseAmenities(acf?.amenities)
    // autop MUST run before sanitize: WYSIWYG copy separates paragraphs with
    // blank lines (no <p>), and sanitizeHtmlContent collapses `\s{2,}` to a single
    // space — so sanitizing first eats the blank lines and autop then merges every
    // paragraph into one. autop → <p>/<br> first, then sanitize keeps that structure.
    this.description = sanitizeHtmlContent(autop(acf?.description ?? ''))
    this.map_description = sanitizeHtmlContent(
      autop(acf?.map_description ?? '')
    )
    this.sections = this.parseSections(acf?.sections)
    this.slideshow = this.parseSlideshow(acf?.slideshow, embedded)
    this.faqs = this.parseFAQs(acf?.faqs)
  }

  private parseAmenities(
    amenitiesString: string | undefined
  ): string[] | string {
    if (!amenitiesString) return []

    // Check if amenities contain complex HTML structure with lists
    const сomplexStructure =
      amenitiesString.includes('<ul') || amenitiesString.includes('<li')

    if (сomplexStructure) {
      let processed = amenitiesString.trim()

      // Remove h2 and h3 tags completely with their content
      processed = processed
        .replace(/<h2[^>]*>[\s\S]*?<\/h2>/gi, '')
        .replace(/<h3[^>]*>[\s\S]*?<\/h3>/gi, '')

      /**
       * UNWRAP NESTED LISTS PATTERN
       *
       * Problem: Some CMS content wraps multiple nested lists in a single outer <ul><li>...</li></ul> wrapper
       * Example input:
       *   <ul>
       *     <li>
       *       <strong>Section 1</strong>
       *       <ul><li>Item 1</li></ul>
       *       <strong>Section 2</strong>
       *       <ul><li>Item 2</li></ul>
       *     </li>
       *   </ul>
       *
       * This creates invalid/redundant HTML structure where the outer wrapper serves no purpose
       * and breaks proper semantic rendering of nested lists.
       *
       * Solution: Detect and remove the outer wrapper tags while preserving inner content
       * Expected output:
       *   <strong>Section 1</strong>
       *   <ul><li>Item 1</li></ul>
       *   <strong>Section 2</strong>
       *   <ul><li>Item 2</li></ul>
       *
       * WARN: This is a pattern-based string manipulation that assumes specific structure
       * Risks:
       * - Will fail if content doesn't start/end with exact wrapper pattern
       * - May produce unexpected results if multiple top-level <ul> elements exist
       * - Relies on start/end position matching, not proper HTML parsing
       *
       * Only applies when:
       * 1. Content starts with <ul><li> tags (with any attributes)
       * 2. Content ends with </li></ul> tags
       * 3. Inner content contains nested lists that need to be unwrapped
       */
      // The unwrap targets ONE outer <ul><li> that wraps several nested lists
      // (see the example above) — signalled by a nested <ul> (2+ <ul> tags). A
      // normal flat list (one <ul> with many <li>) also starts with <ul><li> and
      // ends with </li></ul>, but must NOT be unwrapped: doing so strips its <ul>
      // and the first/last <li>, leaving bare <li> with no list container so the
      // bullets spill outside the content box.
      const hasNestedList = (processed.match(/<ul[^>]*>/gi)?.length ?? 0) > 1
      const startsWithWrapper = /^<ul[^>]*>\s*<li[^>]*>/i.test(processed)
      const endsWithWrapper = /<\/li>\s*<\/ul>\s*$/i.test(processed)

      if (hasNestedList && startsWithWrapper && endsWithWrapper) {
        // Remove opening <ul><li>
        processed = processed.replace(/^<ul[^>]*>\s*<li[^>]*>/i, '')
        // Remove closing </li></ul>
        processed = processed.replace(/<\/li>\s*<\/ul>\s*$/i, '')
        processed = processed.trim()
      }

      // Return sanitized HTML content for complex structures
      // Remove <p> tags but keep their content
      return sanitizeHtmlContent(processed, ['p', 'span'])
    }

    // Simple amenities: split by newlines and decode
    return amenitiesString
      .split(/\r?\n/)
      .map((line) => decode(line.trim()))
      .filter((line) => line.length > 0)
  }

  private parseSections(
    sections: any[] | undefined
  ): Array<{ content: string; [key: string]: any }> {
    if (!Array.isArray(sections)) return []

    return sections
      .map((section) => {
        // Process shortcodes first to check if content becomes empty after removal.
        // autop before sanitize so a section's blank-line paragraphs survive the
        // `\s{2,}` collapse (a widget shortcode wrapped in <p> is still matched by
        // extractWidgets, so this stays safe for widget sections).
        const processedContent = processShortcodes(section?.content || '')
        const sanitizedContent = sanitizeHtmlContent(autop(processedContent))

        // Extract YouTube videos from content
        const { videoIds, remainingContent } =
          extractYouTubeVideos(sanitizedContent)

        // Skip sections with empty content after shortcode processing and YouTube extraction
        // Keep sections only if they have meaningful content beyond just a heading
        const hasContent = remainingContent.trim().length > 0
        const hasRelated = section.related?.length > 0
        const hasVideos = videoIds.length > 0
        const hasImage = !!section?.image

        // Section needs at least content OR image OR related OR videos (heading alone is not enough)
        const shouldKeep = hasContent || hasImage || hasRelated || hasVideos

        if (!shouldKeep) return null

        // Handle sections with image field
        if (section.image) {
          return this.parseSectionWithImage({
            ...section,
            content: remainingContent,
            videoIds: videoIds.length > 0 ? videoIds : undefined
          })
        }

        // Handle sections with related array
        if (Array.isArray(section.related) && section.related.length > 0) {
          return this.parseSectionWithRelated({
            ...section,
            content: remainingContent,
            videoIds: videoIds.length > 0 ? videoIds : undefined
          })
        }

        return {
          ...section,
          content: remainingContent,
          videoIds: videoIds.length > 0 ? videoIds : undefined
        }
      })
      .filter(Boolean)
  }

  /**
   * Parser for sections with image field
   * Resolves image ID to URL using embedded attachments
   */
  private parseSectionWithImage(section: any): any {
    if (!section.image || !this.embedded) return section

    const attachments = this.embedded['acf:attachment'] || []
    const attachment = attachments.find((att: any) => att.id === section.image)

    if (!attachment) return section

    const imageData: SectionImage = {
      url:
        attachment.source_url ||
        attachment.media_details?.sizes?.full?.source_url,
      alt: attachment.alt_text || '',
      width: attachment.media_details?.width,
      height: attachment.media_details?.height
    }

    return {
      ...section,
      imageData
    }
  }

  /**
   * Parser for sections with related array
   * Resolves related IDs to building data
   */
  private parseSectionWithRelated(section: any): any {
    if (!section.related?.length) return section

    const relatedData = section.related
      .map((id: number) => this.relatedBuildings.find((b: any) => b.id === id))
      .filter(Boolean)

    return {
      ...section,
      relatedData
    }
  }

  private parseSlideshow(
    slideshowIds: number[] | undefined,
    embedded: any
  ): SlideshowImage[] {
    if (!Array.isArray(slideshowIds) || slideshowIds.length === 0) return []

    const attachments = embedded?.['acf:attachment'] || []
    if (!Array.isArray(attachments) || attachments.length === 0) return []

    // Map slideshow IDs to attachment data in order
    return slideshowIds
      .map((id) => {
        const attachment = attachments.find((att: any) => att.id === id)
        const sizes = attachment.media_details?.sizes
        if (!sizes) return null

        return {
          large: sizes.full?.source_url,
          medium: sizes.medium_large?.source_url,
          small: sizes.medium?.source_url
        }
      })
      .filter(Boolean) as SlideshowImage[]
  }

  private parseFAQs(faqs: any[] | undefined): any[] {
    if (!Array.isArray(faqs)) return []

    return faqs.map((faq) => ({
      ...faq,
      answer: sanitizeHtmlContent(faq.answer, ['p', 'span'])
    }))
  }
}

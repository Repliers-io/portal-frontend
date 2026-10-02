import { type Metadata } from 'next'

import { type BaseContent } from 'services/CMS/types'

export interface CmsMetaDefaults {
  siteName?: string
  /** Public path to a fallback OG image, e.g. '/repliers/og-default.jpg' */
  defaultOgImage?: string
  /** Twitter/X handle, e.g. '@handle' */
  twitterHandle?: string
}

export interface BuildCmsMetadataOptions {
  /** OpenGraph object type. Defaults to 'website'. Pass 'article' for blog posts. */
  ogType?: 'article' | 'website'
}

/**
 * Builds Next.js Metadata from a CMS BaseContent object with tenant-level fallbacks.
 *
 * Fallback chain per field: CMS data → tenant defaults → omit (root layout fills in)
 *
 * @param baseContent   - CMS content object (Post, Page, or any BaseContent)
 * @param defaults      - Tenant-specific fallbacks from content.cmsMetaDefaults
 * @param pageCanonical - The portal URL for this page (never the CMS backend URL)
 * @param options       - Optional overrides: ogType ('article' | 'website')
 */
export function buildCmsMetadata(
  baseContent: BaseContent,
  defaults: CmsMetaDefaults,
  pageCanonical?: string,
  options: BuildCmsMetadataOptions = {}
): Metadata {
  const { ogType = 'website' } = options
  const cms = baseContent.meta ?? {}
  const ogImages = baseContent.featuredImage
    ? [
        {
          url: baseContent.featuredImage.url,
          alt: baseContent.featuredImage.alt,
          width: baseContent.featuredImage.width ?? 1200,
          height: baseContent.featuredImage.height ?? 630
        }
      ]
    : defaults.defaultOgImage
      ? [{ url: defaults.defaultOgImage, width: 1200, height: 630 }]
      : undefined

  let openGraph: Metadata['openGraph']

  if (cms.openGraph) {
    openGraph = cms.openGraph
  } else if (ogImages) {
    const ogBase = {
      title: cms.title ?? baseContent.title ?? '',
      description: cms.description ?? baseContent.excerpt ?? '',
      siteName: defaults.siteName,
      url: pageCanonical,
      images: ogImages
    }

    if (ogType === 'article') {
      openGraph = {
        ...ogBase,
        type: 'article' as const,
        publishedTime: baseContent.publishedAt?.toISOString(),
        modifiedTime: baseContent.updatedAt?.toISOString(),
        authors: baseContent.author?.url ? [baseContent.author.url] : undefined,
        tags: baseContent.tags?.map((t) => t.name)
      }
    } else {
      openGraph = { ...ogBase, type: 'website' as const }
    }
  }

  return {
    title: cms.title ?? baseContent.title,
    description: cms.description ?? baseContent.excerpt,
    keywords: cms.keywords,
    alternates:
      cms.alternates ??
      (pageCanonical ? { canonical: pageCanonical } : undefined),
    robots: cms.robots,
    openGraph,
    twitter:
      cms.twitter ??
      (defaults.twitterHandle || ogImages
        ? {
            card: 'summary_large_image' as const,
            site: defaults.twitterHandle,
            title: cms.title ?? baseContent.title ?? '',
            description: cms.description ?? baseContent.excerpt ?? '',
            images: ogImages?.map((img) => img.url)
          }
        : undefined)
  }
}

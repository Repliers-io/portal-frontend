/**
 * Yoast SEO Data Parser
 * Extracts and transforms data from Yoast SEO JSON-LD schema
 */

import { type BreadcrumbItem } from '@shared/Breadcrumbs'

type YoastHeadJson = {
  schema?: {
    '@context'?: string
    '@graph'?: Array<{
      '@type'?: string
      '@id'?: string
      itemListElement?: Array<{
        '@type'?: string
        position?: number
        name?: string
        item?: string
      }>
    }>
  }
}

export class YoastParser {
  public breadcrumbs: BreadcrumbItem[] = []

  constructor(yoastHeadJson: YoastHeadJson | null | undefined) {
    if (!yoastHeadJson?.schema?.['@graph']) {
      return
    }

    this.breadcrumbs = this.parseBreadcrumbs(yoastHeadJson.schema['@graph'])
  }

  private parseBreadcrumbs(graph: any[]): BreadcrumbItem[] {
    // Find BreadcrumbList in @graph
    const breadcrumbList = graph.find(
      (item) => item['@type'] === 'BreadcrumbList'
    )

    if (!breadcrumbList?.itemListElement) {
      return []
    }

    // Transform to our breadcrumb format
    return breadcrumbList.itemListElement
      .filter((item: any) => item['@type'] === 'ListItem' && item.name)
      .map((item: any) => ({
        label: item.name || '',
        href: item.item
      }))
      .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
  }
}

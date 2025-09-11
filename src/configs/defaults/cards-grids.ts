import { type CSSObject } from '@emotion/react'

export type PropertyCardSize = 'map' | 'drawer' | 'normal' | 'wide'

export const propertyCardSizes: Record<PropertyCardSize, CSSObject> = {
  map: { width: 190, height: 220 },
  normal: { width: 278, height: 297 }, // TODO: change to 282 to line up grid of 4 cards in 1232 (1280) container
  drawer: { width: '100%', height: 260 },
  wide: { width: '100%', height: 297 }
}

export const savedSearchCard: CSSObject = {
  width: 440,
  height: 192
}

export const gridColumns = { sm: 1, md: 1, lg: 2 }

export const gridSpacing = 4 // * 8px
export const widgetSpacing = 4 // * 8px
export const cardCarouselSpacing = 4 // * 8px

export const mapTopOffset = {
  xs: 118,
  sm: 144
}

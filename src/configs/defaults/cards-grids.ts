import { type CSSObject } from '@emotion/react'

export type PropertyCardSize = 'map' | 'drawer' | 'normal' | 'wide'

const propertyCardSizes: Record<PropertyCardSize, CSSObject> = {
  map: {
    width: 190,
    height: 220
  },
  normal: {
    width: 278, // TODO: change to 282 to line up grid of 4 cards in 1232 (1280) container
    height: 298
  },
  drawer: {
    width: '100%',
    height: 260
  },
  wide: {
    width: '100%',
    height: 298
  }
}

const savedSearchCard: CSSObject = {
  width: 440,
  height: 192
}

const config = {
  propertyCardSizes,
  savedSearchCard,
  gridColumns: { sm: 1, md: 1, lg: 2 },
  gridSpacing: 4, // * 8px
  widgetSpacing: 4, // * 8px
  cardCarouselSpacing: 4, // * 8px
  mapTopOffset: {
    xs: 118,
    sm: 144
  }
}
export default config

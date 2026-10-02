import gridConfig from '@configs/cards-grids'

export const cardHeight = Number(gridConfig.listingCardSizes.drawer.height)

// Gallery width by screen size: 1:1 (<390px) | 5:4 (390–419px) | 4:3 (420px+)
export const galleryWidth = {
  xs: cardHeight,
  sm: Math.round(cardHeight * 1.25),
  lg: Math.round(cardHeight * (4 / 3))
} as const

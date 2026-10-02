import { type ListingCardSize } from '@defaults/cards-grids'

// MUI spacing unit between a card's edge and its content/overlays. Map (small)
// cards sit tighter; every other size shares the standard inset. Single source
// of truth read by both the content padding and the corner tags overlay so the
// two edges always line up per card size.
export const cardEdgeSpacing = (size: ListingCardSize): string =>
  size === 'small' || size === 'drawer' ? '12px' : '16px'

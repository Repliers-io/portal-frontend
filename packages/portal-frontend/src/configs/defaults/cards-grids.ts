import { type CSSObject } from '@emotion/react'

export type ListingCardSize = 'small' | 'medium' | 'large' | 'wide' | 'drawer'

const listingCardSizes: Record<ListingCardSize, CSSObject> = {
  small: { width: 189, height: 218 },
  medium: { width: 284, height: 298 },
  large: { width: 389, height: 370 },
  drawer: { width: '100%', height: 128 },
  wide: { width: '100%', height: 298 }
}

const savedSearchCard: CSSObject = {
  width: 440,
  height: 192
}

export type BuildingCardSize = 'small'

const buildingCardSizes: Record<BuildingCardSize, CSSObject> = {
  small: { width: listingCardSizes.small.width, height: 194 }
}

export const gridSpacing = 4 // * 8px
export const gridColumns = { sm: 1, md: 1, lg: 2 }
const cardWidth = Number(listingCardSizes.medium.width)

/**
 * Calculates the pixel width of the side grid container (next to the map).
 *
 * Layout model (md example with 1 column):
 *   [gap][card][gap]
 *
 * Layout model (lg example with 2 columns):
 *   [gap][card][gap][card][gap]
 *
 * So the total width = card_width * columns + gap_px * (columns + 1)
 *
 * @param width   - card width in px (e.g. 284 for medium)
 * @param spacing - MUI spacing units (multiplied by 8 to get px)
 * @param columns - how many columns per breakpoint
 */
export const calculateGridSideContainerWidth = (
  width: number,
  spacing: number,
  columns: { md: number; lg: number }
) => ({
  xs: '100%',
  md:
    spacing * 8 * (columns.md + 1) + // gap_px * (cols + 1): gap on each side + between every card
    width * columns.md, // card_px * cols
  lg:
    spacing * 8 * (columns.lg + 1) + // same formula for lg breakpoint
    width * columns.lg
})

/**
 * Generates a set of CSS @media min-width breakpoints so the grid container
 * snaps to an exact pixel width that fits N full columns.
 *
 * For each column count N (1 … length):
 *
 *   Layout: [outer_gap][card][inner_gap][card]…[card][outer_gap]
 *   Spacers = columns + 2  (outer-left + outer-right + (columns-1) inner gaps)
 *   → total_width = card_px * columns + gap_px * (columns + 2)
 *
 *   The media query fires at total_width - gap_px so the container locks
 *   to that width just *before* there's enough room for one more column.
 *   This creates crisp column-count transitions without a half-visible card.
 *
 * @param width  - card width in px
 * @param spacing - MUI spacing units (× 8 = px)
 * @param length  - max number of columns to generate queries for (default 6)
 */
export const calculateGridColumnsMediaQueries = (
  width: number,
  spacing: number,
  length: number = 6
) => {
  // Build the exact container pixel width for each column count
  const columnsWidth = Array.from({ length }, (_, index) => {
    const columns = index + 1
    const spacers = columns + 2 // number of spacers needed to separate columns and add outer gaps
    return (
      width * columns + spacing * spacers * 8 - (index === 5 ? 32 : 0)
      // shave 32px off the last entry so it would fit
      // on a 1920px XL screen WITH scrollbar (windows)
    )
  })

  return Object.assign(
    {},
    ...columnsWidth.map((width) => {
      const maxWidth = width - spacing * 8 // subtract one gap to snap just before overflow

      return {
        [`@media (min-width: ${maxWidth}px)`]: { maxWidth }
      }
    })
  )
}

const config = {
  listingCardSizes,
  buildingCardSizes,
  savedSearchCard,

  widgetSpacing: 4, // * 8px // usually the same as gridSpacing

  // carousel spacings
  cardCarouselSpacing: 4, // * 8px
  smallCardCarouselSpacing: 2, // * 8px
  desktopCarouselColumns: { small: 4, medium: 4, large: 3 },

  // grid config
  gridPosition: 'right' as 'left' | 'right',
  gridSpacing,
  gridColumns,
  gridSideContainerWidth: calculateGridSideContainerWidth(
    cardWidth,
    gridSpacing,
    gridColumns
  ),
  gridColumnsMediaQueries: calculateGridColumnsMediaQueries(
    cardWidth,
    gridSpacing
  ),

  // map container config
  mapTopOffset: {
    xs: 118,
    sm: 144
  },
  mobileDrawer: {
    height: 368
  }
}

export default config

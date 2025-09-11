import {
  gridColumns,
  gridSpacing,
  propertyCardSizes
} from '@configs/cards-grids'

const cardWidth = Number(propertyCardSizes['normal'].width)

export const gridSideContainerWidth = {
  xs: '100%',
  md:
    gridSpacing * 8 * (gridColumns.md + 1) + // number of spacers should be +1 of the number of columns
    cardWidth * gridColumns.md,
  lg:
    gridSpacing * 8 * (gridColumns.lg + 1) + // number of spacers should be +1 of the number of columns
    cardWidth * gridColumns.lg
}

const gridColumnsWidth = Array.from({ length: 6 }, (_, index) => {
  const columns = index + 1
  const spacers = columns + 2
  return cardWidth * columns + gridSpacing * spacers * 8
})

export const gridColumnsMediaQueries = Object.assign(
  {},
  ...gridColumnsWidth.map((width) => {
    const maxWidth = width - gridSpacing * 8

    return {
      [`@media (min-width: ${maxWidth + 16}px)`]: { maxWidth }
    }
  })
)

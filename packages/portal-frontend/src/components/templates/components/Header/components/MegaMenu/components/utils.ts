import type { SxProps } from '@mui/system'

import { type DropdownItem } from '../../../types'

/**
 * Layout type for menu list containers
 */
export type LayoutType =
  | 'flex-fixed-width' // Flex row with fixed item widths (50% or 33.33%)
  | 'flex-column' // Simple flex column
  | 'flex-row' // Flex row with wrapping
  | 'css-columns' // CSS columns with auto-fill, breakInside: avoid
  | 'grid' // CSS Grid with 2 columns, auto width

/**
 * Title layout configuration interface
 */
export interface TitleLayoutConfig {
  variant: 'h3' | 'h4' | 'h6'
  sx: Record<string, any>
}

/**
 * Get layout type for a specific list level
 *
 * Default behavior:
 * - Level 1: css-columns layout (2 columns)
 * - Level 2: css-columns layout (2 columns)
 * - Level 3+: flex-column layout
 */
export const getLayoutForListLevel = (level: number): LayoutType => {
  switch (level) {
    case 1:
      return 'css-columns'
    case 2:
      return 'css-columns'
    case 4:
      return 'flex-row'
    default:
      return 'flex-column'
  }
}

/**
 * Get complete layout configuration for menu item title level
 *
 * Default behavior:
 * - Level 1: h3, pb: 2, pt: 0
 * - Level 2: h4, pb: 1, pt: 1
 * - Level 3+: h6, pb: 0.5, pt: 0.5
 */
export const getLayoutForTitleLevel = (level: number): TitleLayoutConfig => {
  switch (level) {
    case 1:
      return {
        variant: 'h3',
        sx: { py: 1 }
      }
    case 2:
      return {
        variant: 'h4',
        sx: { py: 1 }
      }
    default: // level 3+
      return {
        variant: 'h6',
        sx: { pb: 1 }
      }
  }
}

/**
 * Calculate maximum depth of the menu tree
 * Used to detect shallow trees (2 levels) that need special rendering
 *
 * @param item - Root item to calculate depth from
 * @param currentLevel - Current recursion level (default 0)
 * @returns Maximum depth of the tree
 */
export const getMaxDepth = (
  item: DropdownItem,
  currentLevel: number = 0
): number => {
  if (!item.children?.length) {
    return currentLevel
  }
  return Math.max(
    ...item.children.map((child) => getMaxDepth(child, currentLevel + 1))
  )
}

/**
 * Get layout styles for menu item list based on layout type
 *
 * @param layout - Layout type to use
 * @param columns - Number of columns for flex-fixed-width layout (2 or 3)
 * @returns MUI sx prop object with layout styles
 */
export const getLayoutStyles = (
  layout: LayoutType,
  columns?: number
): SxProps => {
  switch (layout) {
    // 1. Flex row with fixed item widths (50% or 33.33%)
    case 'flex-fixed-width': {
      const columnCount = columns ?? 2
      const itemWidth = columnCount === 3 ? '33.333%' : '50%'
      return {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
        '& > *': {
          width: itemWidth,
          flexShrink: 0
        }
      }
    }

    // 2. Flex column
    case 'flex-column':
      return {
        pt: 1,
        gap: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }

    case 'flex-row':
      return {
        pt: 1,
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        '& > *:not(:last-child)': {
          mr: 2
        }
      }

    // 3. CSS columns with auto-fill, no item breaks
    case 'css-columns':
      return {
        width: '100%',
        columnCount: 2,
        columnGap: 2,
        '& > *': {
          width: '100%',
          breakInside: 'avoid-column',
          pageBreakInside: 'avoid'
        }
      }

    // 4. CSS Grid 2 columns, auto width, no row gap
    case 'grid':
      return {
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        columnGap: 2,
        rowGap: 0
      }

    default:
      return {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 0
      }
  }
}

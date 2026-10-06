import React from 'react'

import { Box } from '@mui/material'

import { type DropdownItem } from '../../../types'

import { getLayoutStyles, type LayoutType } from './utils'
import { MegaMenuItem } from '.'

interface MegaMenuItemListProps {
  items: DropdownItem[]
  level: number // Level of the children being rendered
  layout: LayoutType
  columns?: number // For flex-fixed-width (2 or 3)
  onItemClick?: (item: DropdownItem) => void
  debug?: boolean
}

/**
 * MegaMenuItemList - Renders a list of items with appropriate layout
 *
 * Responsibilities:
 * - Handle list layout (single column, two columns, grid, flex)
 * - Apply proper spacing based on level
 * - Ensure proper column break behavior
 * - Render children as MegaMenuItem components
 */
export const MegaMenuItemList = ({
  items,
  level,
  layout,
  columns,
  onItemClick,
  debug = false
}: MegaMenuItemListProps) => {
  if (!items?.length) return null

  return (
    <Box
      sx={{
        ...getLayoutStyles(layout, columns),
        position: 'relative',
        ...(debug &&
          level >= 3 && {
            '&::before': {
              content: `"L${level}"`,
              position: 'absolute',
              top: 0,
              left: 6,
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor:
                level === 3 ? '#0000ff' : level === 4 ? '#9900ff' : '#ff00ff',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 'bold',
              zIndex: 9999,
              border: '1px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              pointerEvents: 'none'
            }
          })
      }}
    >
      {items.map((item, index) => (
        <MegaMenuItem
          key={`${item.title}-${index}`}
          item={item}
          level={level}
          onItemClick={onItemClick}
          debug={debug}
        />
      ))}
    </Box>
  )
}

import React from 'react'

import { Stack } from '@mui/material'

import { type DropdownItem } from '../../../types'

import { getLayoutForListLevel, getLayoutForTitleLevel } from './utils'
import { MegaMenuItemList, MegaMenuItemTitle } from '.'

interface MegaMenuItemProps {
  item: DropdownItem
  level: number
  onItemClick?: (item: DropdownItem) => void
  /**
   * Override the level for this item's children list
   * Useful for rendering children at a different visual level in shallow trees
   */
  childrenLevelOverride?: number
  debug?: boolean
}

/**
 * MegaMenuItem - Recursive component for rendering menu items
 *
 * Level hierarchy:
 * - Level 1: Root column items (h3, two-column children)
 * - Level 2: Section items (h4, two-column children)
 * - Level 3+: Leaf items (h6, single column children)
 *
 * Responsibilities:
 * - Compose title and children list
 * - Determine typography variant based on level
 * - Apply proper spacing
 */
export const MegaMenuItem = ({
  item,
  level,
  onItemClick,
  childrenLevelOverride,
  debug = false
}: MegaMenuItemProps) => {
  const hasChildren = !!item.children?.length

  // Use override if provided, otherwise calculate children level as level + 1
  const childrenLevel = childrenLevelOverride ?? level + 1

  // Get styling configuration based on level
  const titleLayout = getLayoutForTitleLevel(level)
  // List layout should be based on CHILDREN level
  const listLayout = getLayoutForListLevel(childrenLevel)

  return (
    <Stack
      sx={{
        minWidth: 0, // Fixes overflow issues with long words
        alignItems: 'flex-start',
        breakInside: 'avoid-column',
        pageBreakInside: 'avoid',
        position: 'relative',
        ...(debug &&
          (level === 1 || level === 2) && {
            '&::after': {
              content: `"L${level}"`,
              position: 'absolute',
              top: 0,
              left: 6,
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: level === 1 ? '#ff6666' : '#66ff66',
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
      <MegaMenuItemTitle
        item={item}
        layout={titleLayout}
        onItemClick={onItemClick}
      />
      {hasChildren && (
        <MegaMenuItemList
          debug={debug}
          layout={listLayout}
          level={childrenLevel}
          items={item.children!}
          onItemClick={onItemClick}
        />
      )}
    </Stack>
  )
}

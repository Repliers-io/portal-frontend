'use client'

import React from 'react'

import { Box, Container } from '@mui/material'

import { type DropdownItem } from '../../../types'

import { getMaxDepth } from './utils'
import { MegaMenuItem } from '.'

interface MegaMenuContentProps {
  item: DropdownItem
  active: boolean
  debug?: boolean
  onItemClick?: (item: DropdownItem) => void
}

/**
 * MegaMenuContent - Root container for mega menu content
 *
 * Responsibilities:
 * - Layout root columns in a grid
 * - Handle responsive container
 * - Render root menu items
 * - Detect shallow trees and apply level overrides
 * - Control visibility via display CSS property (for SEO)
 */
export const MegaMenuContent = ({
  item,
  active,
  debug = false,
  onItemClick
}: MegaMenuContentProps) => {
  if (!item?.children?.length) return null

  const childrenCount = item.children.length

  // Calculate max depth to detect shallow trees (only 2 levels)
  // In this case, we skip visual level 2 (h4) and render children as level 4 (h6)
  const maxDepth = Math.max(...item.children.map((child) => getMaxDepth(child)))
  const shallowTree = maxDepth === 1

  // Determine grid columns based on children count
  const getGridColumns = () => {
    // hardcoded root-level layout rules
    if (childrenCount === 1) return 1
    if (childrenCount === 3 || childrenCount === 6) return 3
    return 2 // Default for 2, 4, 5, 7+ items
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        px: { xs: 2, md: 4 },
        pt: 1,
        pb: 4,
        // SEO: render all content, control visibility
        display: active ? 'block' : 'none'
      }}
    >
      <Box
        sx={{
          width: '100%',
          columnCount: getGridColumns(),
          columnGap: 2
        }}
      >
        {item.children.map((child: DropdownItem, index: number) => (
          <MegaMenuItem
            key={`${child.title}-${index}`}
            level={1}
            item={child}
            debug={debug}
            onItemClick={onItemClick}
            childrenLevelOverride={shallowTree ? 4 : undefined}
          />
        ))}
      </Box>
    </Container>
  )
}

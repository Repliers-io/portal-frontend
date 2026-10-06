import React from 'react'

import { Divider, List, ListItemButton, ListItemText } from '@mui/material'

import { ChevronLeftIcon } from '@configs/icons'

import { type DropdownItem } from '../../types'

import { MobileMegaMenuItem } from './MobileMegaMenuItem'

interface MobileMegaMenuPanelProps {
  /** Title shown in the back-navigation row (name of the parent section) */
  title: string
  items: DropdownItem[]
  showBack: boolean
  onBack: () => void
  onEnter: (item: DropdownItem) => void
  onClose: () => void
}

/**
 * One "page" of the mobile mega menu.
 * Renders an optional back-button row followed by the list of items.
 */
export const MobileMegaMenuPanel = ({
  title,
  items,
  showBack,
  onBack,
  onEnter,
  onClose
}: MobileMegaMenuPanelProps) => {
  return (
    <List disablePadding>
      {showBack && (
        <>
          <ListItemButton
            onClick={onBack}
            sx={{ px: 2, py: 1.25, borderRadius: 1, color: 'primary.main' }}
          >
            <ChevronLeftIcon fontSize="small" sx={{ mr: 0.5 }} />
            <ListItemText
              primary={title}
              slotProps={{
                primary: {
                  sx: {
                    fontWeight: 800,
                    fontSize: '14px',
                    letterSpacing: '1.1px',
                    fontFamily: 'var(--font-primary), sans-serif',
                    textTransform: 'uppercase',
                    color: 'primary.main'
                  }
                }
              }}
            />
          </ListItemButton>
          <Divider sx={{ my: 0 }} />
        </>
      )}

      {items.map((item, index) => (
        <MobileMegaMenuItem
          key={`${item.title}-${index}`}
          item={item}
          onEnter={onEnter}
          onClose={onClose}
        />
      ))}
    </List>
  )
}

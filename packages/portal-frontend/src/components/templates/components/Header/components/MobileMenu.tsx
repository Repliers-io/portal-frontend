'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText
} from '@mui/material'

import { MenuIcon } from '@configs/icons'
import layoutConfig from '@configs/layout'

import { type CmsMenuItem } from 'services/CMS'
import useBreakpoints from 'hooks/useBreakpoints'

import type { DropdownItem, ToolbarItem } from '../types'

import { convertToDropdownItem } from './ToolbarMenu/components/utils'
import { MobileProfileSection } from './MobileProfileSection'
import { ProfileMenuPill } from '.'

export const MobileMenu = ({
  items: propItems,
  cmsItems,
  headerHeight = layoutConfig.headerHeight
}: {
  items: ToolbarItem[]
  cmsItems?: CmsMenuItem[]
  // the header stays above the open menu, so the items start below it
  headerHeight?: number | typeof layoutConfig.headerHeight
}) => {
  const [open, setOpen] = useState(false)
  const { desktop } = useBreakpoints()
  const t = useTranslations()

  const handleClose = () => setOpen(false)

  const items = useMemo((): DropdownItem[] => {
    const stringItems: DropdownItem[] = propItems
      .filter((config) => typeof config.item === 'string')
      .map((config) => ({
        title: config.item as string,
        url: config.url || undefined,
        children: config.children
      }))

    const cmsDropdown: DropdownItem[] = propItems.some(
      (config) => typeof config.item !== 'string'
    )
      ? (cmsItems ?? []).map(convertToDropdownItem)
      : []

    return [...stringItems, ...cmsDropdown]
  }, [propItems, cmsItems])

  useEffect(() => {
    if (desktop) setOpen(false)
  }, [desktop])

  return (
    <>
      <IconButton
        aria-label={t('Menu.toggleNavigation')}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        color="inherit"
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        elevation={1}
        anchor="top"
        variant="temporary"
        open={open}
        onClose={handleClose}
        disableScrollLock
        ModalProps={{ keepMounted: true }}
        sx={{
          zIndex: 'drawer',
          '& .MuiDrawer-paper': {
            borderRadius: 0,
            bgcolor: 'common.white'
          }
        }}
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(60px)' } }
        }}
      >
        <Box>
          <Box sx={{ height: headerHeight }} />
          <List sx={{ py: 1, px: 0 }}>
            {items.map((item, index) => (
              <ListItemButton
                key={index}
                {...(item.url
                  ? { component: Link, href: item.url, onClick: handleClose }
                  : { disabled: true })}
                sx={{ px: 2, py: 0.5 }}
              >
                <ListItemText primary={item.title} />
              </ListItemButton>
            ))}
          </List>
          <MobileProfileSection />
          <Divider sx={{ my: 0 }} />
          <Box
            sx={{
              px: 2,
              py: { xs: 1, sm: 2 },
              justifyContent: 'center',
              display: 'flex'
            }}
          >
            <ProfileMenuPill />
          </Box>
        </Box>
      </Drawer>
    </>
  )
}

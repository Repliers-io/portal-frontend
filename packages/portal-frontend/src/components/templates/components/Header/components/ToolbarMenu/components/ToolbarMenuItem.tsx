'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

import { MenuItem } from '@mui/material'

import { ExpandMoreIcon } from '@configs/icons'
import menuConfig from '@configs/menu'
import routes from '@configs/routes'

import useClientSide from 'hooks/useClientSide'

const {
  dropdown: { trigger }
} = menuConfig

const adminRoutes = [routes.adminAgents, routes.agent]

const adminRoute = (url: string | null) => adminRoutes.includes(url || '')

const selected = (pathname: string, url: string | null | undefined) => {
  const sanitizedPathname = pathname.replace('search/grid', 'search/map')
  if (!url) return false
  return adminRoute(url) ? pathname === url : sanitizedPathname.includes(url)
}

export const ToolbarMenuItem = ({
  title,
  url,
  hasChildren,
  selected: propSelected = false,
  onClick,
  ...props
}: {
  title: string
  url?: string | null
  hasChildren?: boolean
  selected?: boolean
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  [key: string]: any
}) => {
  const pathname = usePathname()
  const clientSide = useClientSide()

  const pathSelected = url ? selected(pathname, url) : false
  const menuSelected = pathSelected || propSelected

  // Compute aria attributes from hasChildren
  const ariaProps = hasChildren
    ? {
        'aria-haspopup': 'true' as const,
        'aria-expanded': propSelected
      }
    : {}

  const hoverableDropdown = trigger === 'hover' && hasChildren

  return (
    <MenuItem
      {...(url && {
        href: url,
        component: 'a'
      })}
      disabled={!clientSide || (!url && !onClick)}
      selected={menuSelected}
      onClick={hasChildren ? onClick : undefined}
      {...ariaProps}
      {...props}
      sx={{
        gap: 0.5,
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        px: { md: 1.5, lg: 2 },
        borderRadius: 1,
        lineHeight: 2,

        ...(hoverableDropdown && {
          '&:hover:after': {
            content: '""',
            left: 0,
            right: 0,
            top: '100%',
            height: '30px',
            // bgcolor: 'black',
            position: 'absolute'
          }
        }),

        '&.Mui-selected': hoverableDropdown
          ? {
              color: 'inherit',
              bgcolor: 'action.hover',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }
          : {
              color: 'primary.main',
              bgcolor: 'common.white'
            }
      }}
    >
      {title}
      {hasChildren && <ExpandMoreIcon fontSize="small" sx={{ mr: -1 }} />}
    </MenuItem>
  )
}

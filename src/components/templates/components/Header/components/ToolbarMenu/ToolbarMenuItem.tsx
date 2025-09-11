'use client'

import { usePathname } from 'next/navigation'

import { MenuItem } from '@mui/material'

import routes from '@configs/routes'

const adminRoutes = [routes.adminAgents, routes.agent]

const isAdminRoute = (url: string | null) => adminRoutes.includes(url || '')

const isSelected = (pathname: string, url: string | null | undefined) => {
  const sanitizedPathname = pathname.replace('search/grid', 'search/map')
  if (!url) return false
  return isAdminRoute(url) ? pathname === url : sanitizedPathname.includes(url)
}

const ToolbarMenuItem = ({
  title,
  url,
  selected = false,
  onClick
}: {
  title: string
  url?: string | null
  selected?: boolean
  onClick?: () => void
}) => {
  const pathname = usePathname()

  return (
    <MenuItem
      href={url || ''}
      component="a"
      disabled={!url && !onClick}
      selected={isSelected(pathname, url) || selected}
      onClick={onClick}
      sx={{
        px: { md: 1.5, lg: 2 },
        lineHeight: 2,
        borderRadius: 1,
        '&.Mui-selected': {
          color: 'primary.main',
          bgcolor: 'common.white'
        }
      }}
    >
      {title}
    </MenuItem>
  )
}

export default ToolbarMenuItem

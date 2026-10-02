'use client'

import { useTranslations } from 'next-intl'

import {
  Link,
  Stack,
  type SxProps,
  type Theme,
  Typography
} from '@mui/material'

import { ChevronRightIcon } from '@configs/icons'
import routes from '@configs/routes'

export type BreadcrumbItem = {
  label: string
  href?: string
  onClick?: () => void
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  centered?: boolean
  home?: boolean
  sx?: SxProps<Theme>
}

/**
 * Reusable breadcrumbs component
 * Used across listings, buildings, and other pages
 */
export const Breadcrumbs = ({
  items,
  centered = false,
  home = false,
  sx
}: BreadcrumbsProps) => {
  const t = useTranslations()
  // Add home item if home flag is true
  const breadcrumbItems = home
    ? [{ label: t('Breadcrumbs.home'), href: routes.home }, ...items]
    : items

  // Don't show breadcrumbs if there are too few items
  if (breadcrumbItems.length <= 1) return null

  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      justifyContent={centered ? 'center' : 'flex-start'}
      sx={sx}
      divider={
        <ChevronRightIcon
          sx={{ fontSize: 20, color: 'text.secondary', mb: -0.125 }}
        />
      }
    >
      {breadcrumbItems.map((item, index) => {
        if (item.href || item.onClick) {
          return (
            // Plain anchor (not the next/link LinkBehavior default) — breadcrumbs
            // cross page roots, so a full navigation gives a clean page state.
            <Link
              component="a"
              key={`${item.label}-${index}`}
              href={item.href || '#'}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault()
                  item.onClick()
                }
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {item.label}
              </Typography>
            </Link>
          )
        }

        return (
          <Typography
            key={`${item.label}-${index}`}
            variant="body2"
            fontWeight={600}
          >
            {item.label}
          </Typography>
        )
      })}
    </Stack>
  )
}

import { useState } from 'react'

import { darken, lighten, Link, Typography } from '@mui/material'

import { primary as color } from '@configs/colors'

import { type ApiLocation } from 'services/API'
import { capitalize } from 'utils/strings'
import { getLocationUrl } from 'utils/urls'

export const LocationLink = ({
  area,
  city,
  hood,
  basePrefix,
  variant = 'primary',
  onFocus,
  onBlur,
  onClick
}: {
  area?: ApiLocation
  city?: ApiLocation
  hood?: ApiLocation
  basePrefix?: string
  variant?: 'primary' | 'secondary'
  onFocus?: (item: ApiLocation) => void
  onBlur?: () => void
  onClick?: () => void
}) => {
  const [navigating, setNavigating] = useState(false)
  const linkColorPrimary = darken(color, 0.1)
  const linkColorSecondary = darken(color, 0.3)
  const hoverBg = lighten(color, 0.8)

  const handleMouseEnter = () => {
    const item = hood ?? city ?? area
    if (item) onFocus?.(item)
  }

  const handleClick = () => {
    setNavigating(true)
    onClick?.()
  }

  return (
    // Plain anchor (not the next/link LinkBehavior default) — location pages are
    // server-rendered; a full navigation gives them a clean page state.
    <Link
      component="a"
      href={getLocationUrl({
        area: area?.name,
        city: city?.name,
        hood: hood?.name,
        basePrefix
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onBlur}
      onClick={handleClick}
    >
      <Typography
        variant="body2"
        component="span"
        fontWeight={600}
        sx={{
          px: '4px',
          mx: '-4px',
          lineHeight: '20px',
          borderRadius: '4px',
          position: 'relative',
          display: 'inline-block',
          color: variant === 'primary' ? linkColorPrimary : linkColorSecondary,
          bgcolor: navigating ? hoverBg : undefined,
          '&:hover': { bgcolor: hoverBg }
        }}
      >
        {capitalize(
          hood ? hood.name : city ? city.name : area ? area.name : ''
        )}
      </Typography>
    </Link>
  )
}

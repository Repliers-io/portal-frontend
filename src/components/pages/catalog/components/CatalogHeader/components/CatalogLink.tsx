import Link from 'next/link'

import { darken, lighten, Typography } from '@mui/material'

import { primary as color } from '@configs/colors'

import {
  type ApiBoardArea,
  type ApiBoardCity,
  type ApiNeighborhood
} from 'services/API'
import { capitalize } from 'utils/strings'
import { getCatalogUrl } from 'utils/urls'

const CatalogLink = ({
  area,
  city,
  hood,
  variant = 'primary',
  onFocus,
  onBlur
}: {
  area?: ApiBoardArea
  city?: ApiBoardCity
  hood?: ApiNeighborhood
  variant?: 'primary' | 'secondary'
  onFocus?: (item: ApiNeighborhood | ApiBoardCity) => void
  onBlur?: () => void
}) => {
  const linkColorPrimary = darken(color, 0.1)
  const linkColorSecondary = darken(color, 0.3)

  const handleMouseEnter = () => {
    if (!area) onFocus?.(hood ?? city!)
  }

  const handleMouseLeave = () => {
    onBlur?.()
  }

  return (
    <Link
      href={getCatalogUrl(
        area ? area.name + '_area' : city?.name || '',
        hood?.name || ''
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          '&:hover': { bgcolor: lighten(color, 0.8) }
        }}
      >
        {capitalize(
          hood ? hood.name : city ? city.name : area ? area.name : ''
        )}
      </Typography>
    </Link>
  )
}

export default CatalogLink

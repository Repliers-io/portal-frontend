import { Typography } from '@mui/material'

import { overlayColor } from 'utils/map/overlays'

import { OverlayCard } from './OverlayCard'
import type { TooltipProps } from './tooltipRegistry'

const accentColor = overlayColor('livebyDistrict')

type AddressLike = {
  city?: string
  area?: string
  state?: string
}

const parseAddress = (raw: unknown): AddressLike => {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as AddressLike
    } catch {
      return {}
    }
  }
  return raw as AddressLike
}

export const LiveByDistrictCard = ({ properties }: TooltipProps) => {
  if (!properties) return null

  const { name } = properties as Record<string, unknown>
  const address = parseAddress(properties.address)
  const subtitle =
    [address.city, address.area, address.state].filter(Boolean).join(', ') ||
    null

  return (
    <OverlayCard accentColor={accentColor}>
      <Typography variant="body2" fontWeight={700} color="text.primary">
        {String(name ?? '')}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </OverlayCard>
  )
}

import React, { forwardRef } from 'react'

import { BedtimeTwoToneIcon, WbSunnyTwoToneIcon } from '@configs/icons'

// import LightModeTwoToneIcon from '@mui/icons-material/LightModeTwoTone'
interface ThumbProps extends React.HTMLAttributes<HTMLSpanElement> {
  ownerState?: unknown
  'data-index'?: number
  sliderValue?: number
  solarAltitude?: number
  maxSolarAltitude?: number
}

export const SliderThumb = forwardRef<HTMLSpanElement, ThumbProps>(
  (props, ref) => {
    const {
      children,
      ownerState: _ownerState,
      'data-index': _dataIndex,
      sliderValue: _sliderValue = 0,
      solarAltitude = 0,
      maxSolarAltitude = 60,
      ...other
    } = props

    // Determine icon and size based on solar altitude
    // altitude ranges from 0° (horizon) to maxSolarAltitude (zenith)
    // Negative altitude = sun below horizon (night)
    let Icon = WbSunnyTwoToneIcon
    let iconColor = '#FFCC66'

    // Icon size: 14-24 based on altitude following sun's arc
    let iconSize: number

    if (solarAltitude < 0) {
      // Night time - show moon
      Icon = BedtimeTwoToneIcon
      iconColor = '#FFEECC'
      // Size follows moon's arc (inverted altitude)
      const moonAltitude = Math.abs(solarAltitude)
      const moonProgress = Math.min(1, moonAltitude / maxSolarAltitude)
      // Sinusoidal growth: faster at start, slower at peak
      const arcFactor = Math.sin(moonProgress * Math.PI * 0.5)
      iconSize = Math.round(12 + arcFactor * 8)
    } else {
      // Day time - show sun
      // Normalize altitude to 0-1 range using actual max for this location/date
      const normalizedAltitude = Math.min(1, solarAltitude / maxSolarAltitude)
      // Sinusoidal growth following sun's arc: size grows faster near horizon, slower near zenith
      const arcFactor = Math.sin(normalizedAltitude * Math.PI * 0.5)
      iconSize = Math.round(14 + arcFactor * 8)
    }

    return (
      <span {...other} ref={ref}>
        {children}
        <Icon
          sx={{
            width: iconSize,
            height: iconSize,
            color: '#000000',
            pointerEvents: 'none',
            '& path:first-of-type': {
              fill: iconColor,
              opacity: 1
            }
          }}
        />
      </span>
    )
  }
)

SliderThumb.displayName = 'SliderThumb'

import { type TouchEvent } from 'react'

import { alpha, Box, lighten, Link } from '@mui/material'

import { marker, soldMarker } from '@configs/colors'
import typography from '@configs/theme/typography'

import { toRem } from 'utils/theme'

import { type MarkerProps } from './types'

const Marker = ({
  id,
  link = '',
  label = '',
  size = 'tag',
  status = 'A',
  onTap,
  onClick,
  onMouseEnter,
  onMouseLeave
}: MarkerProps) => {
  // TODO:  replace hardcoded `status` value with constant / enum from API
  // not sure if we even need to pass status as a components' prop
  const labelString = size === 'point' ? '' : label
  const bgcolor = status === 'U' ? soldMarker : marker

  const calculatedClusterWeight = 20 + label.length * 4

  const sizes = {
    point: {
      width: 16,
      height: 16,
      borderRadius: '50%'
    },
    tag: {
      px: 0.5,
      minWidth: 44,
      minHeight: 26,
      borderRadius: 2
    },
    cluster: {
      overflow: 'hidden',
      borderRadius: '50%',
      width: calculatedClusterWeight,
      height: calculatedClusterWeight,
      lineHeight: toRem(calculatedClusterWeight - 4)
    }
  }

  const sizeSx = sizes[size]

  const highlightSx = {
    border: `8px solid ${alpha(lighten(marker, 0.2), 0.3)}`
  }

  const handleTouchEnd = (e: TouchEvent) => {
    // if tap handler is provided
    if (onTap) {
      // fire callback
      onTap(e)
      // and CANCEL mouse event
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Box
      sx={{
        p: 0,
        borderRadius: 10,
        cursor: 'pointer',
        position: 'relative',
        zIndex: 10,
        '&::after, &::before': {
          content: '""',
          zIndex: 9,
          top: -8,
          left: -8,
          width: '100%',
          height: '100%',
          display: 'none',
          borderRadius: 8,
          position: 'absolute',
          pointerEvents: 'none',
          ...highlightSx
        },
        '&:hover::before, &.active::before': {
          display: 'block'
        },
        '&:hover::after, &.active::after': {
          display: 'block',
          borderWidth: 16,
          left: -16,
          top: -16
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...(id ? { id } : {})}
    >
      <Link
        href={link}
        style={{ textDecoration: 'none' }}
        onClick={onClick}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
      >
        <Box
          sx={{
            p: 0,
            border: 2,
            zIndex: 10,
            position: 'relative',
            userSelect: 'none',
            fontSize: toRem(12),
            lineHeight: toRem(22),
            fontFamily: typography.fontFamily,
            textAlign: 'center',
            boxSizing: 'border-box',
            textOverflow: 'ellipsis',
            bgcolor,
            color: 'common.white',
            borderColor: 'common.white',
            ...sizeSx
          }}
        >
          {labelString}
        </Box>
      </Link>
    </Box>
  )
}

export default Marker

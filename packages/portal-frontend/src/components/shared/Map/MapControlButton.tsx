import { type ReactNode } from 'react'

import {
  alpha,
  Badge,
  Box,
  Button,
  type ButtonProps,
  lighten,
  Tooltip
} from '@mui/material'

import mapConfig from '@configs/map'

import { controlSize } from './MapControlsStack'

const { colors } = mapConfig.controls

/**
 * Chrome shared by every button in the control stack; state colours come from
 * the tenant `mapConfig.controls.colors` palette. `activeBg` lets a control
 * keep its own active fill (overlay accents). Hover never repaints an active
 * control, and a disabled one never reacts to hover (pointer events are off).
 */
export const mapControlSx = ({
  active = false,
  dimmed = false,
  activeBg = colors.activeBg
}: { active?: boolean; dimmed?: boolean; activeBg?: string } = {}) => ({
  p: 0.75,
  width: controlSize,
  height: controlSize,
  minWidth: 0,
  backdropFilter: 'blur(4px)',
  // The shadow sits on the button itself, so it takes whatever radius the tenant
  // theme gives the button. `&&` outranks the theme's `disableElevation`, which
  // clears it on hover, focus, press and disabled.
  '&&': { boxShadow: 1 },
  color: active ? colors.activeIcon : colors.icon,
  bgcolor: active ? activeBg : colors.bg,
  ...(colors.hoverBg && !active && { '&:hover': { bgcolor: colors.hoverBg } }),
  '&.Mui-disabled': {
    bgcolor: colors.disabledBg,
    ...(colors.disabledIcon && { color: colors.disabledIcon })
  },
  // Switched ON but drawing nothing — the map sits below the layer's render floor.
  // Keeps the selected fill so the control still reads as on, darkened and with the
  // disabled glyph colour so it does not claim the layer is visible. Not transparency:
  // no other control in the stack fades. Still clickable — this is how you switch it off.
  ...(dimmed && {
    bgcolor: lighten(activeBg, 0.2),
    color: colors.disabledIcon ?? alpha(colors.activeIcon, 0.65)
  })
})

type MapControlButtonProps = Omit<ButtonProps, 'title' | 'loading'> & {
  /** Tooltip content; also the button's accessible name when it is a string. */
  title: ReactNode
  active?: boolean
  dimmed?: boolean
  activeBg?: string
  /** Passed by controls that fetch: a dot over the icon while their data loads. */
  loading?: boolean
  /** Hidden below `sm`. */
  desktopOnly?: boolean
}

/** A button of the map control stack with its tooltip on the left. */
export const MapControlButton = ({
  title,
  active,
  dimmed,
  activeBg,
  loading,
  desktopOnly,
  sx,
  children,
  ...props
}: MapControlButtonProps) => (
  <Tooltip title={title} arrow enterDelay={200} placement="left">
    {/* a disabled button fires no events, so the tooltip listens on this box */}
    <Box
      sx={desktopOnly ? { display: { xs: 'none', sm: 'block' } } : undefined}
    >
      <Button
        aria-label={typeof title === 'string' ? title : undefined}
        {...props}
        sx={[
          mapControlSx({ active, dimmed, activeBg }),
          ...(Array.isArray(sx) ? sx : [sx])
        ]}
      >
        {loading === undefined ? (
          children
        ) : (
          <Badge
            overlap="circular"
            variant="dot"
            invisible={!loading}
            sx={{ '& .MuiBadge-badge': { bgcolor: 'currentColor' } }}
          >
            {children}
          </Badge>
        )}
      </Button>
    </Box>
  </Tooltip>
)

import { type ReactNode, useEffect, useRef } from 'react'

import { Stack, type SxProps, type Theme } from '@mui/material'

import mapConfig from '@configs/map'
import { type ControlsPosition } from '@defaults/map'

import { useMapTitleVisible } from './hooks/useMapTitleVisible'

// Side of every control in the stack.
export const controlSize = 36

// Minimum distance from map edges (spacing * 2), and the gap between stacked
// controls — the one number every piece of map chrome aligns to.
export const borderMargin = 16
// A top-anchored stack must clear the MapTitle bar so the title stays readable
// above it. The bar is 48px tall (inner bar; the 64px outer Box is only a
// shadow/slide clip frame) and shows on sm+ only.
const titleBarHeight = 48

// On phones the controls form a row that holds its edge and wraps to as many lines as
// they need; a bottom row publishes its height on the map container, and the chrome
// above it (selected locations, sun sliders) sits on that.
export const controlsRowClearance = `calc(var(--controls-row-height, 0px) + ${borderMargin * 2}px)`

const toAlignItems = (h: string) => {
  if (h === 'right') return 'flex-end'
  if (h === 'center') return 'center'
  return 'flex-start'
}

const resolvePosition = (pos: string, topOffset: number, row = false) => {
  const [v, h] = pos.split('-')
  const column = v === 'top' ? ('column-reverse' as const) : ('column' as const)
  // a row runs along its edge, so the horizontal anchor moves to the main axis
  const anchor = toAlignItems(h)
  return {
    direction: row ? ('row' as const) : column,
    alignItems: row ? 'center' : anchor,
    justifyContent: row ? anchor : 'flex-start',
    flexWrap: row ? ('wrap' as const) : ('nowrap' as const),
    top: v === 'top' ? topOffset : ('auto' as const),
    bottom: v === 'bottom' ? borderMargin : ('auto' as const),
    left: h === 'left' || h === 'center' ? borderMargin : ('auto' as const),
    right: h === 'right' || h === 'center' ? borderMargin : ('auto' as const)
  }
}

type MapControlsStackProps = {
  children: ReactNode
  sx?: SxProps<Theme>
  position?: ControlsPosition
  mobilePosition?: ControlsPosition
}

const ControlsStack = ({
  children,
  sx = {},
  position = mapConfig.controls.position,
  mobilePosition = mapConfig.controls.mobilePosition,
  desktopTopOffset
}: MapControlsStackProps & { desktopTopOffset: number }) => {
  // The MapTitle bar exists on sm+ only, so the mobile stack always keeps the
  // plain edge margin; the desktop top offset is decided by the caller.
  const desktop = resolvePosition(position, desktopTopOffset)
  const mobile = resolvePosition(mobilePosition, borderMargin, true)

  const ref = useRef<HTMLDivElement>(null)
  const bottomRow = mobilePosition.startsWith('bottom')

  useEffect(() => {
    const stack = ref.current
    if (!bottomRow || !stack) return

    const observer = new ResizeObserver(() =>
      stack.parentElement?.style.setProperty(
        '--controls-row-height',
        `${stack.offsetHeight}px`
      )
    )
    observer.observe(stack)
    return () => observer.disconnect()
  }, [bottomRow])

  return (
    // `useFlexGap`: Stack's default margin spacing would indent a wrapped row's first item
    <Stack
      ref={ref}
      useFlexGap
      spacing={2}
      direction={{ xs: mobile.direction, sm: desktop.direction }}
      alignItems={{ xs: mobile.alignItems, sm: desktop.alignItems }}
      justifyContent={{ xs: mobile.justifyContent, sm: desktop.justifyContent }}
      sx={{
        flexWrap: { xs: mobile.flexWrap, sm: desktop.flexWrap },
        zIndex: 'fab',
        position: 'absolute',
        pointerEvents: 'none',
        transition: 'top 0.15s ease',
        '& > *': { pointerEvents: 'auto' },
        top: { xs: mobile.top, sm: desktop.top },
        bottom: { xs: mobile.bottom, sm: desktop.bottom },
        left: { xs: mobile.left, sm: desktop.left },
        right: { xs: mobile.right, sm: desktop.right },
        ...sx
      }}
    >
      {children}
    </Stack>
  )
}

// A desktop top-anchored stack overlaps the MapTitle bar, so it reserves the
// bar's height only while the title is visible and sits at the plain top margin
// otherwise. Kept separate so the common bottom stacks never subscribe to it.
const TitleAwareControlsStack = (props: MapControlsStackProps) => {
  const titleVisible = useMapTitleVisible()
  const desktopTopOffset = titleVisible
    ? borderMargin + titleBarHeight
    : borderMargin

  return <ControlsStack {...props} desktopTopOffset={desktopTopOffset} />
}

// A reusable, position-parameterized controls stack. The default build renders
// one (anchor from config); a tenant fork can render a second instance anchored
// to a different corner by passing `position` / `mobilePosition`.
export const MapControlsStack = ({
  position = mapConfig.controls.position,
  ...props
}: MapControlsStackProps) => {
  // Only a desktop top-anchored stack overlaps the title bar and needs to observe
  // it; the common bottom stacks stay free of the search subscription.
  return position.startsWith('top') ? (
    <TitleAwareControlsStack position={position} {...props} />
  ) : (
    <ControlsStack
      position={position}
      {...props}
      desktopTopOffset={borderMargin}
    />
  )
}

import { type MouseEvent, type PointerEvent } from 'react'

import { alpha, IconButton, Stack, Typography } from '@mui/material'

import { CloseIcon } from '@configs/icons'

// Hover is a fine-pointer affordance: it lights the location's marker/polygon on
// the map, and touch fires an enter without ever firing the matching leave — the
// highlight would then stay lit after a tap with no way back. Same reason the
// overlay markers moved off mouse events (see `wireLeaf`).
const hoverHandlers = (onHover?: (hover: boolean) => void) => ({
  onPointerEnter: (e: PointerEvent) => {
    if (e.pointerType !== 'touch') onHover?.(true)
  },
  onPointerLeave: (e: PointerEvent) => {
    if (e.pointerType !== 'touch') onHover?.(false)
  }
})

// Generic removable chip for a single selected location. Body click recenters
// the map (handled by the caller); the X removes just this location. The label
// carries NO font of its own — `variant="inherit"` takes the ambient typography
// set by the MapTitle title row, so chips always read as part of the title and a
// tenant restyles both from that single parent control point.
// `accentColor` tints the hover state (its source overlay's colour); falls back
// to the theme primary when the location has no overlay accent.
export const LocationChip = ({
  label,
  accentColor,
  onClick,
  onDelete,
  onHover,
  onDeleteHover
}: {
  label: string
  accentColor?: string
  onClick?: () => void
  onDelete?: () => void
  /** Hover over the chip body — lights the location's marker and polygon. */
  onHover?: (hover: boolean) => void
  /** Hover over just the X — used to show the polygon's deselect (delete) state. */
  onDeleteHover?: (hover: boolean) => void
}) => {
  const handleDelete = (e: MouseEvent) => {
    // Keep the X from also triggering the body's recenter click.
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <Stack
      spacing={0}
      direction="row"
      alignItems="center"
      onClick={onClick}
      {...hoverHandlers(onHover)}
      sx={{
        pl: 1.5,
        minWidth: 20,
        flexShrink: 1,
        borderRadius: 6,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: 'white',
        // Kill the browser's blue tap flash on touch (inherited, so it covers the
        // delete button too) — the chip has its own pressed/hover affordances.
        WebkitTapHighlightColor: 'transparent',
        // Keep the white surface and lay a faint accent tint over it on hover —
        // the same "0.08 over white" look the form controls use, without turning
        // the chip translucent over the map. Uses the location's overlay accent
        // colour, falling back to the theme primary. Fine pointers only: a tap
        // leaves an emulated :hover behind, tinting the chip until the next tap
        // elsewhere.
        ...(onClick && {
          '@media (hover: hover)': {
            '&:hover': {
              backgroundImage: (theme) => {
                const tint = alpha(
                  accentColor ?? theme.palette.primary.main,
                  0.05
                )
                return `linear-gradient(${tint}, ${tint})`
              }
            }
          }
        })
      }}
    >
      <Typography variant="inherit" noWrap title={label} sx={{ minWidth: 0 }}>
        {label}
      </Typography>
      <IconButton
        size="small"
        sx={{ color: 'common.black', flexShrink: 0 }}
        onClick={handleDelete}
        {...hoverHandlers(onDeleteHover)}
      >
        <CloseIcon sx={{ width: 20, height: 20 }} />
      </IconButton>
    </Stack>
  )
}

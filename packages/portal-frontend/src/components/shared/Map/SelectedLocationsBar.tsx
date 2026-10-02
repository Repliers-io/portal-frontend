import { Box } from '@mui/material'

import { useMapLocations } from 'providers/MapOptionsProvider'
import { toRem } from 'utils/theme'

import { borderMargin, controlsRowClearance } from './MapControlsStack'
import { SelectedLocations } from './SelectedLocations'

/**
 * The selected locations as removable chips along the bottom of a phone screen —
 * the mobile stand-in for the MapTitle bar, which is top-anchored and carries the
 * title/point/recenter chrome besides (sm+ only). On a phone only the selection
 * earns the space, and the bottom edge is where the thumb already is; the row of
 * map controls holds that edge, so the chips sit above it.
 */
export const SelectedLocationsBar = () => {
  const { locations } = useMapLocations()

  if (!locations?.length) return null

  return (
    <Box
      sx={{
        left: borderMargin,
        right: borderMargin,
        bottom: controlsRowClearance,
        position: 'absolute',
        // A hovered/active marker is raised to z-index 1000 in MapContainer and
        // would otherwise paint over the chips.
        zIndex: 'fab',
        display: { xs: 'flex', sm: 'none' },
        justifyContent: 'center',
        // the chips carry no font of their own: the MapTitle row's type, a step smaller
        typography: 'h6',
        fontSize: toRem(14),
        lineHeight: toRem(20),
        // Only the chips hit-test: the empty rest of the bar spans the screen and
        // would otherwise swallow drags across the bottom of the map.
        pointerEvents: 'none',
        '& > *': { pointerEvents: 'auto' }
      }}
    >
      <SelectedLocations locations={locations} wrap />
    </Box>
  )
}

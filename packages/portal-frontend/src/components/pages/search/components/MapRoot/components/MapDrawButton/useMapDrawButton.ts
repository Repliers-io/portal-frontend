import { useTranslations } from 'next-intl'

import { useLocationSelection } from '@shared/Map/hooks'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

// Per draw tool: what the button does, and the title shown when drawing starts
const toolKeys = {
  draw: { tooltip: 'Map.drawButtonTooltip', start: 'Map.startDraw' },
  freehand: { tooltip: 'Map.freehandButtonTooltip', start: 'Map.startFreehand' }
} as const

export type DrawTool = keyof typeof toolKeys

/**
 * Draw-tool button behaviour for the search map: tooltip, active/disabled state,
 * entering and leaving the tool. The MapboxDraw control itself is owned by
 * `useMapDraw`, which follows `editMode`.
 */
export const useMapDrawButton = (mode: DrawTool) => {
  const { setTitle, editMode, setEditMode, clearEditMode } = useMapOptions()
  const { clearSelection, clearLocationFilters } = useLocationSelection()
  const t = useTranslations()
  const { logged } = useUser()
  const clientSide = useClientSide()
  const { clearPolygon, clearPoint, locationsPresent } = useSearch()

  const { tooltip, start } = toolKeys[mode]
  const active = editMode === mode
  // Selected locations and a drawn area are mutually exclusive: block starting a
  // draw while locations are selected (but never the exit action mid-draw).
  const blockedByLocations = locationsPresent && !active

  // Registered users can draw → describe the action; guests get the gated hint.
  // While locations are selected, explain why drawing is unavailable.
  const tooltipTitle = clientSide
    ? logged
      ? blockedByLocations
        ? t('Map.drawDisabledWhileLocations', { feature: t(tooltip) })
        : t(tooltip)
      : t('Map.drawAreaTooltip')
    : ''

  const onClick = () => {
    if (active) {
      clearPolygon()
      clearEditMode()
      clearSelection()
    } else {
      setTitle(t(start))
      setEditMode(mode)
      clearPoint()
      clearPolygon()
      clearLocationFilters()
    }
  }

  return {
    tooltipTitle,
    active,
    disabled: !clientSide || !logged || blockedByLocations,
    onClick
  }
}

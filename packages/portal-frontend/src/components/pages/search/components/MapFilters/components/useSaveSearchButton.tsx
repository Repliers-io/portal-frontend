import { type ReactNode, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@mui/material'

import { useDialog } from 'providers/DialogProvider'
import { useMapLocations, useMapOptions } from 'providers/MapOptionsProvider'
import { useSaveSearch } from 'providers/SaveSearchProvider'
import { useSearch } from 'providers/SearchProvider'
import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

// Max listings for a saved search — mirrors the server rule (Repliers rejects
// creates/updates matching more with a 406; that error surfaces through the
// createSearch snackbar as the authoritative backstop).
//
// This client gate uses the CURRENT result count, which can diverge from what
// the saved search will actually match when locations are selected:
// - the live query unions `locationId`s (including locations that carry linked
//   listings but NO polygon) and clips to the viewport;
// - the saved search persists GEOMETRY only (unioned search-area polygons,
//   unclipped — see resolveLocationBoundaries), so polygon-less locations drop out
//   while off-screen parts of the boundaries come back in.
// Both directions of mismatch are accepted: the gate stays a cheap heuristic
// and the server 406 has the final word.
const limit = 100

/**
 * Shared save-search button logic. Both the default and the movesmartly fork
 * differ only in how they STYLE the button — the behaviour (login guard, listing
 * limit, the desktop hover tooltip and the mobile tap hint) lives here once.
 */
export const useSaveSearchButton = () => {
  const t = useTranslations()
  const { logged } = useUser()
  const clientSide = useClientSide()
  const { loading } = useSaveSearch()
  const { count, polygon, region, filtersDisabled } = useSearch()
  const { locations } = useMapLocations()
  const { showDialog: showLogin } = useDialog('auth')
  const { showDialog: showConfirmation } = useDialog('save-search')
  const { layout, editMode, setEditMode, clearEditMode } = useMapOptions()

  // What the save will persist as its area: a drawn polygon, else the selected
  // locations' / loaded saved-search region boundaries, else the viewport.
  const definedArea = !!(polygon || region?.length || locations?.length)

  // Mobile is icon-only and never hovers, so the hint can only be opened by a tap
  // and must stay open until the user reaches the inline link — hence controlled.
  const [hintOpen, setHintOpen] = useState(false)
  const closeHint = () => setHintOpen(false)

  const onSave = () => {
    if (!logged) showLogin()
    else showConfirmation()
  }

  // Highlight the viewport ONLY when the save will actually use it. With a
  // defined area (polygon / selected locations / loaded region) that area is
  // already drawn on the map — covering it with the dashed viewport box would
  // look like the selection was discarded.
  const highlightSearchArea = () => {
    if (!definedArea) setEditMode('highlight')
  }
  const hideSearchAreaHighlighting = () => {
    if (editMode === 'highlight') clearEditMode()
  }

  const place = definedArea
    ? ' inside the area. Try to edit it.'
    : layout === 'map'
      ? ' on screen. Try to zoom in.'
      : '. Tighten your search filters.' // layout === 'grid'

  const limitTitle = t('Map.saveSearchLimit', { limit, place })

  // Everything that blocks saving EXCEPT being logged out — kept apart so the
  // mobile button can stay enabled and pick what to show from the reason.
  const cannotSave = filtersDisabled || loading || !count || count > limit
  const disabled = !logged || cannotSave

  // Desktop hover tooltip: login prompt, then the limit reason, else nothing.
  const tooltipTitle = !logged
    ? t('Map.registeredUserTooltip')
    : disabled
      ? limitTitle
      : ''

  // Mobile tap hint: logged out explains the feature and links into the login
  // modal (the link's underline is themed for all tooltip links); a limit/empty
  // state reuses the same reason text as the desktop tooltip.
  const hintTitle: ReactNode = !logged
    ? t.rich('Map.saveSearchLoginPrompt', {
        login: (chunks) => (
          <Link
            component="button"
            type="button"
            onClick={() => {
              closeHint()
              showLogin()
            }}
            sx={{
              color: 'inherit',
              font: 'inherit',
              verticalAlign: 'baseline'
            }}
          >
            {chunks}
          </Link>
        )
      })
    : limitTitle

  const onMobileTap = () => {
    if (disabled) {
      setHintOpen((open) => !open)
      return
    }
    showConfirmation()
  }

  return {
    clientSide,
    disabled,
    saveLabel: t('MapFilters.saveSearch'),
    tooltipTitle,
    hintOpen,
    hintTitle,
    closeHint,
    onSave,
    onMobileTap,
    highlightSearchArea,
    hideSearchAreaHighlighting
  }
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { LngLatBounds } from 'mapbox-gl'

import { DialogContent, DialogTitle, Stack, useTheme } from '@mui/material'

import mapConfig from '@configs/map'
// Direct paths, not the `components` barrel: a tenant with its own
// `ListingMainContent/_<tenant>/components` fork (movesmartly) gets that fork's
// barrel from the OverridePlugin, which does not export these two.
import { ListingParcelLayer } from '@pages/listing/components/ListingMainContent/components/ListingParcelLayer'
import { ParcelFacts } from '@pages/listing/components/ListingMainContent/components/ParcelFacts'
import { HomeMap } from '@shared/Map'
import { streetAddress } from '@shared/Map/OverlayMarkerPopup/ParcelCard'
import { bbox } from '@turf/turf'

import { ContentShadow, LoadingContent } from 'components/atoms'

import { type ParcelDialogProps, useDialog } from 'providers/DialogProvider'
import MapOptionsProvider, { useMapOptions } from 'providers/MapOptionsProvider'
import ParcelProvider, {
  fetchParcelRecord,
  type ParcelFeature
} from 'providers/ParcelProvider'

import { NavigationControls } from './ListingBrowserDialog/components'
import { BaseResponsiveDialog } from './BaseResponsiveDialog'

const dialogName = 'parcel'
const titleId = `${dialogName}-title`

// The content strip: the map and the facts under it.
const contentWidth = 800

const mapHeight = 298
// Kept around the parcel on every side.
const mapPadding = mapHeight / 10

// Around the content on tablet and desktop, where the paper is that much wider so
// the strip inside keeps its width. Mobile keeps the theme's own padding, like
// every other dialog.
const contentPadding = 4

// The floor of the facts area: every record carries at least the parcel number, so
// the waiting spinner stands exactly where that row will.
const factsMinHeight = 64

// The dialog stays mounted between openings, so the map is created once, framed on
// the first parcel; every next parcel refits the camera it already has.
const ParcelMap = ({
  parcel,
  onFramed
}: {
  parcel: ParcelFeature
  /** Called once the camera sits on the parcel. */
  onFramed: () => void
}) => {
  const { mapRef } = useMapOptions()
  const { visible } = useDialog(dialogName)
  const [west, south, east, north] = useMemo(() => bbox(parcel), [parcel])
  // Visible as of the render before this one. An arrow moves to the next parcel
  // with the window already up, so the camera travels there and zooms to the new
  // lot; opening the window frames it at once, with nothing to travel from.
  const onScreen = useRef(false)
  // Reached through a ref, so the camera below depends on the coordinates alone and
  // never refits over a callback that merely got a new identity.
  const framed = useRef(onFramed)
  framed.current = onFramed

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const settled = () => framed.current()

    map.fitBounds([west, south, east, north], {
      padding: mapPadding,
      animate: onScreen.current
    })
    // A request opened mid-flight stutters the animation, so the flight goes first.
    if (!onScreen.current) {
      settled()
      return
    }

    map.once('moveend', settled)
    return () => {
      map.off('moveend', settled)
    }
  }, [west, south, east, north, mapRef])

  useEffect(() => {
    onScreen.current = visible
  })

  return (
    <HomeMap
      lng={(west + east) / 2}
      lat={(south + north) / 2}
      zoom={mapConfig.zoom.listingAddress}
      bounds={new LngLatBounds([west, south], [east, north])}
      boundsPadding={mapPadding}
      height={mapHeight}
      recenterThreshold={20}
    />
  )
}

/** A parcel without a listing, clicked on the search map: the address map framed on
 *  the parcel, and the assessor's facts — the PDP blocks as they are. The clicked
 *  parcel arrives with its record (see useParcelListings), so the window opens at
 *  its final size; the arrows walk its neighbours and fetch theirs on the way. */
export const ParcelDialog = () => {
  const { getOptions, showDialog } = useDialog<ParcelDialogProps>(dialogName)
  const { parcels = [], index = -1 } = getOptions()
  const parcel: ParcelFeature | undefined = parcels[index]

  // AiSearchDialog's skeleton: the theme's DialogTitle, then DialogContent, whose
  // padding the paper adds back so the content keeps the browser's width.
  const theme = useTheme()
  const gutter = parseFloat(theme.spacing(contentPadding))
  const [scrolled, setScrolled] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  // The parcel the record in flight was asked for, so a slow answer for one already
  // stepped past is dropped.
  const requested = useRef(-1)
  const [loading, setLoading] = useState(false)

  // The neighbour is on screen immediately — address, map and outline — with the
  // spinner already standing where its facts will be.
  const step = (delta: number) => {
    const next = index + delta
    const target: ParcelFeature | undefined = parcels[next]
    if (!target) return

    requested.current = next
    showDialog({ parcels, index: next })
    contentRef.current?.scrollTo(0, 0)
    setLoading(!target.properties?.publicRecord)
  }

  // The map calls this once it has landed on the parcel. A parcel stepped back to
  // already carries its record, and so does the one the map was clicked on.
  const loadRecord = () => {
    const at = index
    const target: ParcelFeature | undefined = parcels[at]
    if (!target || target.properties?.publicRecord) return

    fetchParcelRecord(target, new AbortController().signal)
      .then((withRecord) => {
        if (!withRecord || requested.current !== at) return
        showDialog({
          parcels: parcels.map((item, i) => (i === at ? withRecord : item)),
          index: at
        })
      })
      .catch((error: unknown) => console.error('[ParcelDialog]', error))
      .finally(() => {
        if (requested.current === at) setLoading(false)
      })
  }

  return (
    <BaseResponsiveDialog
      name={dialogName}
      maxWidth={contentWidth + 2 * gutter}
      maxHeight="88vh"
      // Mapbox measures its container when the map mounts; a zoomed-in paper is
      // still scaled to nothing at that moment, a sliding one has its full size.
      transition="slide"
      keepMounted
      labelledBy={titleId}
    >
      {/* The arrows sit where the listing browser's do, and walk the viewport's
          parcels in address order. */}
      <NavigationControls
        prev={index > 0}
        next={index >= 0 && index < parcels.length - 1}
        onClick={step}
      />
      {/* The listing browser's rhythm: the title padded 2, on the close button's
          line (MUI flushes the content under it on its own). The theme pads per
          breakpoint and emotion hoists its media rules below any plain value, so
          each breakpoint above xs needs its own here — xs is left to the theme, the
          way every dialog looks on mobile. */}
      <DialogTitle id={titleId} sx={{ py: { sm: 2, md: 2 } }}>
        {streetAddress(parcel?.properties?.name)}
      </DialogTitle>
      {/* The listing browser's shadow under the header: the title ends at exactly
          `contentShadowTop`, where the band begins. */}
      <ContentShadow visible={scrolled} />
      <DialogContent
        ref={contentRef}
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
        sx={{
          // MUI flushes content under a title only when the two are siblings, and
          // the shadow stands between them.
          pt: 0,
          px: { sm: contentPadding, md: contentPadding },
          pb: { sm: contentPadding, md: contentPadding }
        }}
      >
        {parcel && (
          <ParcelProvider target={parcel}>
            <Stack spacing={{ xs: 3, sm: 4 }}>
              <MapOptionsProvider layout="map" style="hybrid">
                <ParcelMap parcel={parcel} onFramed={loadRecord} />
                <ListingParcelLayer />
              </MapOptionsProvider>
              {loading ? (
                <LoadingContent height={factsMinHeight} />
              ) : (
                <ParcelFacts heading={false} />
              )}
            </Stack>
          </ParcelProvider>
        )}
      </DialogContent>
    </BaseResponsiveDialog>
  )
}

/**
 * Map + list orchestrator for /search. Renders the shared Map canvas, controls, listing
 * drawer, grid/chat, and dialogs; wires listing markers (imperative DOM handlers) via
 * useListingMarkers, so marker callbacks read state through refs, not live React state.
 * Memoized (see bottom) to skip this heavy subtree when overlay layers toggle.
 * Anatomy: docs → product-guide/search/technical.
 */
import {
  memo,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { type Position } from 'geojson'
import { type LngLat, type LngLatBounds } from 'mapbox-gl'

import { Box, Stack } from '@mui/material'

import aiAgentConfig from '@configs/ai-agent'
import gridConfig from '@configs/cards-grids'
import features from '@configs/features'
import { ListingBrowserDialog, SaveSearchDialog } from '@shared/Dialogs'
import {
  ListingPopupHost,
  MapContainer,
  MapTitle,
  OverlayMarkerPopup,
  SelectedLocationsBar
} from '@shared/Map'
import {
  type MarkerClickEvent,
  use3DBuildings,
  use3DInteractions,
  useListingMarkers,
  useMapInit,
  useMapPolygon,
  useMapResize,
  useMapStyleSync,
  useOverlayPolygonGuard,
  useParcelListings,
  usePoint,
  useSelectionPolygons
} from '@shared/Map/hooks'
import { OverlayLayersController } from '@shared/Map/OverlayLayersController'

import { type ApiListing } from 'services/API'
import SearchService from 'services/Search'
import { useDialog } from 'providers/DialogProvider'
import { useMapOptions, useMapPopupActions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { useUser } from 'providers/UserProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { dedupeListings, getSeoUrl, multiUnitKey } from 'utils/listings'
import { type MapOrientation } from 'utils/map'

import { SupportAgent } from '..'

import {
  CalendarSlider,
  ChatContent,
  FloatingLayoutSwitch,
  GridContent,
  GridDesktopContainer,
  GridFilters,
  GridMobileDrawer,
  ListingDrawer,
  MapControls,
  MobileCircularProgress,
  SaveSearchCanvas,
  SunriseSlider,
  SunriseSliderContainer,
  useMapDraw
} from './components'
import { useDebugBoundary } from './useDebugBoundary'
import { useMarkerHighlight } from './useMarkerHighlight'
import { setupStyleLoadHandler, setupTerrain, toggleTerrain } from './utils'

type MapPositionCallback = (
  bounds: LngLatBounds,
  center: LngLat,
  zoom: number
) => void

type MapRootProps = {
  zoom: number
  center: LngLat | null
  polygon?: Position[] | null
  /** Loaded saved-search region (multi-ring) — rendered read-only. */
  region?: Position[][] | null
  /** Initial camera orientation, applied only when 3D mode is active */
  orientation: MapOrientation
  onMove: MapPositionCallback
  onLoad: MapPositionCallback
}

const MapRootComponent = ({
  zoom,
  center,
  polygon,
  region,
  orientation,
  onMove,
  onLoad
}: MapRootProps) => {
  const { logged } = useUser()
  const { mobile, tablet, wideScreen } = useBreakpoints()
  const [mapVisible, mapContainerRef] = useIntersectionObserver(0)
  const { showDialog: showListingBrowser, hideDialog: hideListingBrowser } =
    useDialog('listing')

  const {
    loading,
    listings,
    clusters,
    multiUnits,
    saveMultiUnits,
    clearMultiUnits
  } = useSearch()

  // Every listing that may have an individual marker on the map: top-level results
  // plus inlined small-cluster listings. The two sets overlap when the API returns
  // both simultaneously, so dedup (see dedupeListings) to prevent phantom duplicates
  // in updateMultiUnits and the listing browser cache. (boardId is backfilled in the
  // Search service, so the inlined twin shares the top-level key and collapses here.)
  const mapListings = useMemo(
    () =>
      dedupeListings([
        ...listings,
        ...clusters.flatMap((c) => c.listings ?? [])
      ]),
    [listings, clusters]
  )

  const [drawerListing, setDrawerListing] = useState<ApiListing | null>(null)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [mapReady, setMapReady] = useState(false)

  const { layout, setLayout, mode3D, mapRef } = useMapOptions()
  const { setListingPopup } = useMapPopupActions()

  useDebugBoundary(mapReady)

  use3DBuildings()
  const multiUnitsRef = useRef(multiUnits)
  const mapListingsRef = useRef(mapListings)
  const gridListingsRef = useRef<ApiListing[]>([])

  // Track if we're in pitch/rotate 3D interaction
  // to prevent conflicts with standard events
  const mode3DRef = useRef(mode3D)

  // WARN: `listingBrowserItems` changes when you click on multiUnit _CARD_ in the grid
  // to represent only multiUnits in the navigation list,
  // and reverts back to `sortedProperties` when you click on a regular marker on the map
  // see logic inside `handleCardClick`
  const [listingBrowserIndex, setListingBrowserIndex] = useState(-1)
  const [listingBrowserItems, setListingBrowserItems] = useState(listings)

  const setListingBrowserCache = useCallback(
    (mlsNumber: string, boardId: number) => {
      // read multiUnits through the ref: markers are wired imperatively by
      // useListingMarkers (plain DOM event handlers), so their click callbacks
      // can't see this component's live React state directly.
      const multiUnits = multiUnitsRef.current

      const match = (p: ApiListing) =>
        p.mlsNumber === mlsNumber && p.boardId === boardId

      const browserItems = multiUnits.find(match)
        ? multiUnits
        : gridListingsRef.current.find(match)
          ? gridListingsRef.current
          : mapListingsRef.current

      const browserIndex = browserItems.findIndex(match)

      setListingBrowserItems(browserItems)
      setListingBrowserIndex(browserIndex)

      return browserIndex
    },
    []
  )

  const { leaveMarker } = useMarkerHighlight()

  const onInteractionStart = useCallback(() => {
    SearchService.disableRequests()
    setDrawerListing(null)
  }, [])

  const onInteractionEnd = useCallback(() => {
    SearchService.enableRequests()
  }, [])

  const onRotateEnd = useCallback(() => {
    onInteractionEnd()
    const map = mapRef?.current
    if (!map) return
    // Update position after 3D interaction ends to capture final state
    onMove(map.getBounds()!, map.getCenter(), map.getZoom())
  }, [onInteractionEnd, onMove, mapRef])

  const rotating = use3DInteractions({
    onRotateStart: onInteractionStart,
    onRotateEnd
  })

  const updateMultiUnits = useCallback(
    (listing: ApiListing) => {
      const key = multiUnitKey(listing)
      saveMultiUnits(
        mapListingsRef.current.filter((p) => multiUnitKey(p) === key)
      )
    },
    [saveMultiUnits]
  )

  const handleCardClick = useCallback(
    (e: MouseEvent, listing: ApiListing, multiUnit?: boolean) => {
      // this click handler is only suitable for WIDE desktops (1280+px)
      if (!wideScreen) return

      const { mlsNumber, boardId } = listing

      // TODO: we need to figure out why does this multiunit's logic exists at all
      // seems like this flag is no longer in use anywhere
      if (!multiUnit && (e.button === 1 || e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        window.open(getSeoUrl(listing), '_blank')
        return
      }

      // TODO: we need to figure out why does this multiunit's logic exists at all
      if (multiUnit) {
        updateMultiUnits(listing)
        e.preventDefault()
        return
      }

      setListingBrowserCache(mlsNumber, boardId)
      showListingBrowser()
      e.preventDefault()
    },
    [wideScreen, updateMultiUnits, setListingBrowserCache, showListingBrowser]
  )

  const handleCarouselCardClick = useCallback(
    (e: MouseEvent, carousel: ApiListing[], carouselIndex: number) => {
      const listing = carousel[carouselIndex]

      if (e.button === 1 || e.ctrlKey || e.metaKey) {
        e.preventDefault()
        window.open(getSeoUrl(listing), '_blank')
        return
      }

      // Replace with carousel items and set correct index
      setListingBrowserItems(carousel)
      setListingBrowserIndex(carouselIndex)

      showListingBrowser()
      e.preventDefault()
    },
    [showListingBrowser]
  )

  const handleMarkerTap = useCallback(
    (listing: ApiListing, multiUnit: boolean) => {
      if (multiUnit) {
        updateMultiUnits(listing)
      } else {
        clearMultiUnits()
      }

      setDrawerListing(listing)
      setLayout('map')
    },
    [updateMultiUnits, clearMultiUnits, setLayout]
  )

  // Desktop marker click: wide screens open the listing browser dialog; narrower
  // desktops navigate to the listing (mirrors the old marker anchor behaviour).
  const onListingClick = useCallback(
    (event: MarkerClickEvent, listing: ApiListing, multiUnit: boolean) => {
      if (wideScreen) {
        handleCardClick(event as unknown as MouseEvent, listing, multiUnit)
        return
      }
      const url = getSeoUrl(listing)
      if (event.button === 1 || event.ctrlKey || event.metaKey) {
        window.open(url, '_blank')
      } else {
        window.location.assign(url)
      }
    },
    [wideScreen, handleCardClick]
  )

  // One set of handlers for both surfaces: a matched parcel opens exactly what its
  // suppressed price marker would have opened.
  const markerHandlers = {
    touch: mobile || tablet,
    onListingClick,
    onListingTap: handleMarkerTap
  }

  useListingMarkers(markerHandlers)
  useParcelListings(markerHandlers)

  usePoint()

  useEffect(() => {
    multiUnitsRef.current = multiUnits
  }, [multiUnits])

  useEffect(() => {
    mapListingsRef.current = mapListings
  }, [mapListings])

  useEffect(() => {
    mode3DRef.current = mode3D

    // Toggle terrain based on 3D mode
    const map = mapRef.current
    if (map) toggleTerrain(map, mode3D)
  }, [mode3D, mapRef])

  useMapStyleSync()
  useMapPolygon(polygon, region)
  useMapDraw()
  useOverlayPolygonGuard()
  useSelectionPolygons()
  useMapResize(mapVisible)

  useMapInit({
    containerRef: mapContainerRef,
    center,
    zoom,
    // Construct the map already oriented when 3D mode arrives from the URL;
    // buildings layer and terrain react to `mode3D` on their own
    ...(mode3D ? orientation : {}),
    polygon,
    region,
    rotating,
    onInteractionStart,
    onInteractionEnd,
    onLoad,
    onMove,
    onClick: () => setListingPopup(null),
    onInit: (map) => {
      setMapReady(true)

      // Setup style load handler for address label restrictions
      if (features.blurRestrictedProperty) {
        setupStyleLoadHandler({ map, logged })
      }

      // Setup terrain (handles source, style changes, and 3D mode)
      setupTerrain({
        map,
        getMode3D: () => mode3DRef.current
      })
    },
    onCleanup: () => setListingPopup(null)
  })

  return (
    <Stack
      direction={{
        xs: 'row',
        md: gridConfig.gridPosition === 'left' ? 'row-reverse' : 'row'
      }}
      alignItems="stretch"
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        top: gridConfig.mapTopOffset,
        position: 'fixed'
      }}
    >
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <OverlayLayersController />
        <MapContainer ref={mapContainerRef} loading={!mapReady} />

        <MapControls />

        <SunriseSliderContainer>
          <SunriseSlider currentDate={currentDate} />
          <CalendarSlider currentDate={currentDate} onChange={setCurrentDate} />
        </SunriseSliderContainer>

        <MapTitle />
        <SelectedLocationsBar />

        <SaveSearchCanvas />
        {(mobile || tablet) && (
          <>
            <FloatingLayoutSwitch />
            {loading && <MobileCircularProgress />}
          </>
        )}

        <ListingDrawer
          map={mapRef.current}
          multiUnits={multiUnits}
          listing={drawerListing}
          onClose={leaveMarker}
        />
      </Box>

      {mobile || tablet ? (
        <>
          <GridMobileDrawer show={layout === 'grid'}>
            <GridFilters />
            <GridContent
              gridListingsRef={gridListingsRef}
              onCardClick={handleCardClick}
            />
          </GridMobileDrawer>
          {features.aiChat && (
            <GridMobileDrawer show={layout === 'chat'}>
              <ChatContent onCarouselCardClick={handleCarouselCardClick} />
            </GridMobileDrawer>
          )}
        </>
      ) : (
        <GridDesktopContainer>
          <GridFilters />
          <GridContent
            gridListingsRef={gridListingsRef}
            onCardClick={handleCardClick}
          />
          {features.aiChat && (
            <ChatContent onCarouselCardClick={handleCarouselCardClick} />
          )}
        </GridDesktopContainer>
      )}

      <ListingBrowserDialog
        // mapType="static"
        active={listingBrowserIndex}
        listings={listingBrowserItems}
      />

      {features.saveSearch && <SaveSearchDialog />}

      {features.aiAgent && (
        <SupportAgent
          headlessIframeId={aiAgentConfig.headlessIframeId}
          onOpenListing={(mlsNumber, boardId) => {
            const index = setListingBrowserCache(mlsNumber, boardId)
            if (index !== -1) showListingBrowser()
          }}
          onCloseListing={hideListingBrowser}
        />
      )}

      <OverlayMarkerPopup />
      <ListingPopupHost />
    </Stack>
  )
}

/**
 * Memoized: `MapPageContent` re-renders whenever overlay layers toggle (it reads
 * `activeLayers` for URL sync). All props here are stable across that re-render
 * (`onMove`/`onLoad` are `useCallback`, the rest are value-deduped), so memo skips
 * MapRoot's heavy subtree on toggle. The layers menu inside still updates — it
 * subscribes to `useMapLayers` directly, independent of this boundary.
 */
export const MapRoot = memo(MapRootComponent)

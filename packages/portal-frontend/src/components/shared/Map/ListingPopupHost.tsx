'use client'

import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { type Map as MapboxMap, Popup } from 'mapbox-gl'
import { createPortal } from 'react-dom'

import gridConfig from '@configs/cards-grids'
import { CardSurface, ListingCard } from '@shared/Listing'

import { useMapOptions, useMapPopup } from 'providers/MapOptionsProvider'

/**
 * Listing hover popup host — the GL-free replacement for the imperative
 * PopupExtension. Portals a ListingCard into a Mapbox Popup's DOM node, keeping
 * the card in the React tree so theme/intl/features/user providers (and live
 * feature flags) work automatically — no per-show React root, no manual provider
 * stack. The trigger lives in the small MapPopupContext, so showing/hiding it on
 * hover never re-renders useMapOptions consumers.
 */
export const ListingPopupHost = ({
  mapRef: mapRefProp
}: {
  /** Map ref for contexts that own a local map (CMS widget); defaults to the
   *  provider's mapRef, which the search map and LocationMap register. */
  mapRef?: RefObject<MapboxMap | null>
} = {}) => {
  const { mapRef: contextMapRef } = useMapOptions()
  const mapRef = mapRefProp ?? contextMapRef
  const { listingPopup } = useMapPopup()
  const popupRef = useRef<Popup | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  // Create the container + Popup once (client only). The card is a pure hover
  // preview: pointer-events none so it never intercepts the marker's own hover,
  // and an opacity transition so we can show/hide it by fading — never by adding
  // and removing the DOM node (see the positioning effect for why that matters).
  useEffect(() => {
    const div = document.createElement('div')
    const { width, height } = gridConfig.listingCardSizes.small
    div.style.width = `${width}px`
    div.style.height = `${height}px`
    div.style.pointerEvents = 'none'
    div.style.opacity = '0'
    div.style.transition = 'opacity 0.1s ease'
    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 30,
      // The card sits mounted over the map at all times (see the positioning
      // effect). Mapbox gives .mapboxgl-popup-content pointer-events: auto, so
      // without this class the always-present node would swallow hover from the
      // markers beneath it. The class lets us turn that off (see MapContainer).
      className: 'listing-hover-popup'
    }).setDOMContent(div)
    popupRef.current = popup
    setContainer(div)
    return () => {
      popup.remove()
      popupRef.current = null
    }
  }, [])

  // Show / hide the card by fading it, keeping ONE popup node mounted — never
  // adding + removing it per hover. On a short map the card is taller than half
  // the viewport, so Mapbox clamps it back into view and lands it over the marker
  // for anything near the vertical middle. Adding/removing an overlapping node on
  // each hover makes the browser recompute hover under the (stationary) pointer,
  // which fires a spurious mouseleave → we hide → mouseenter → we show → forever
  // (the "blinking" cards). One mounted node that only fades + repositions has no
  // per-hover DOM mutation, so the hover stays put even when the card overlaps.
  useLayoutEffect(() => {
    const popup = popupRef.current
    const map = mapRef?.current
    if (!popup || !container) return
    if (!listingPopup || !map) {
      container.style.opacity = '0'
      return
    }
    // Anchor toward the map region with more room, each axis independent so a
    // side marker with vertical room opens purely left/right (not diagonally).
    // Mapbox has no public anchor setter — toggling options.anchor before
    // setLngLat re-runs positioning with it.
    const mapEl = map.getContainer()
    const { clientWidth: w, clientHeight: h } = mapEl
    const cardW = Number(gridConfig.listingCardSizes.small.width)
    const cardH = Number(gridConfig.listingCardSizes.small.height)
    const point = map.project([listingPopup.lng, listingPopup.lat])

    // Horizontal: a centered card clips past a side edge, so near the left edge
    // anchor left (card grows right), near the right edge anchor right (grows
    // left); null in the middle band so side markers stay purely horizontal.
    const horizontal =
      point.x < cardW / 2 ? 'left' : point.x > w - cardW / 2 ? 'right' : null
    // Vertical: flip only near the top/bottom edges, neutral middle band —
    // EXCEPT a short map (card taller than half the viewport) can't fit either
    // way, so commit to the roomier half; a neutral anchor there lets Mapbox
    // clamp the card over the marker and blink (the flicker fix).
    const vertical =
      cardH > h / 2
        ? point.y < h / 2
          ? 'top'
          : 'bottom'
        : point.y < cardH
          ? 'top'
          : point.y > h - cardH
            ? 'bottom'
            : null

    const popupOptions = popup as unknown as {
      options: {
        anchor?:
          | 'top'
          | 'bottom'
          | 'left'
          | 'right'
          | 'top-left'
          | 'top-right'
          | 'bottom-left'
          | 'bottom-right'
      }
    }
    popupOptions.options.anchor =
      vertical && horizontal
        ? `${vertical}-${horizontal}`
        : (vertical ?? horizontal ?? 'bottom')
    popup.setLngLat([listingPopup.lng, listingPopup.lat])
    if (!popup.isOpen()) popup.addTo(map)
    container.style.opacity = '1'
  }, [listingPopup, mapRef, container])

  if (!container) return null

  return createPortal(
    listingPopup ? (
      <CardSurface surface="map">
        <ListingCard size="small" listing={listingPopup.listing} />
      </CardSurface>
    ) : null,
    container
  )
}

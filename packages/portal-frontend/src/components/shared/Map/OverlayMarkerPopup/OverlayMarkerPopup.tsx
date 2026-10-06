'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { Popup } from 'mapbox-gl'
import { createPortal } from 'react-dom'

import {
  useMapOptions,
  useMapPopup,
  useMapPopupActions
} from 'providers/MapOptionsProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import { easeInOutCubic } from 'utils/map'

import tooltipRegistry from './tooltipRegistry'

/**
 * Generic overlay marker popup.
 *
 * Renders a Mapbox Popup anchored to the hovered marker. Content is a React
 * component looked up by overlay id in tooltipRegistry (overridable per tenant
 * via _<tenant>/tooltipRegistry.tsx). The component renders via createPortal
 * into a stable DOM node owned by the Popup — staying inside the React tree so
 * all providers (theme, intl, etc.) work automatically.
 *
 * Mapbox auto-selects an anchor to keep the popup in view. On mobile, where a
 * card almost as wide as the screen can't fit beside an off-centre marker, the
 * map first recentres the marker so the popup always opens fully on-screen.
 *
 * Performance note: the Popup is shown/repositioned synchronously by the hover
 * handler via overlayPopupRef. React state (overlayPopup) only drives content
 * rendering — the popup appears on the same frame as the polygon/marker highlight.
 */
export const OverlayMarkerPopup = () => {
  const { mapRef } = useMapOptions()
  const { overlayPopup } = useMapPopup()
  const { overlayPopupRef } = useMapPopupActions()
  const { mobile } = useBreakpoints()
  // State (not ref) so setting the container triggers a re-render and createPortal runs
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  // Create container div and Popup once on mount (client only, safe for SSR)
  useEffect(() => {
    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.transition = 'opacity 0.15s ease'
    div.style.opacity = '0'
    // Expose the hover popup to assistive tech + tests: a named tooltip with a
    // stable hook. The name is retargeted per hover in the effect below.
    div.setAttribute('role', 'tooltip')
    div.dataset.testid = 'overlay-marker-popup'
    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: 'none',
      // No explicit anchor → Mapbox picks from 9 positions to stay in-bounds
      // Numeric offset = distance in px from marker edge, direction-independent
      offset: 28
    })
    popup.setDOMContent(div)
    overlayPopupRef.current = popup

    // The popup sits inside Mapbox's canvas container, so a tap on its own
    // controls bubbles to the map and fires the click that dismisses it — the
    // button would close the tooltip it lives in. React delegates at the tree
    // root, which is reached after the map's own listener, so stop it natively.
    const stopEvent = (e: Event) => e.stopPropagation()
    div.addEventListener('click', stopEvent)
    div.addEventListener('touchstart', stopEvent)

    // Triggers re-render so createPortal runs with the real container
    setContainer(div)

    return () => {
      div.removeEventListener('click', stopEvent)
      div.removeEventListener('touchstart', stopEvent)
      popup.remove()
      overlayPopupRef.current = null
    }
  }, [overlayPopupRef])

  // Name the popup from the hovered feature so AT/tests can identify it; the
  // container is stable, so we just retarget its aria-label as the hover changes.
  useEffect(() => {
    if (!container) return
    const props = overlayPopup?.properties as
      | Record<string, unknown>
      | undefined
    const name = props?.name
    if (typeof name === 'string' && name) {
      container.setAttribute('aria-label', name)
    } else {
      container.removeAttribute('aria-label')
    }
  }, [overlayPopup, container])

  const TooltipComponent = overlayPopup
    ? (tooltipRegistry[overlayPopup.overlayId] ?? null)
    : null

  // The popup is added to the map synchronously in the hover handler (before
  // this component renders) — at that moment the container is empty, so Mapbox's
  // auto-anchor reads offsetWidth/Height = 0 and falls through to a default
  // anchor. Mapbox v3 has no ResizeObserver on popups, so once content mounts we
  // re-run _update via setLngLat to recompute the anchor from real dimensions.
  useLayoutEffect(() => {
    const popup = overlayPopupRef.current
    const map = mapRef?.current
    if (!container) return
    if (!overlayPopup || !popup || !popup.isOpen()) {
      container.style.opacity = '0'
      return
    }
    // Mapbox Popup has no public anchor setter; toggling options.anchor before
    // setLngLat re-runs its positioning with that anchor. Start from auto-anchor.
    const popupOptions = popup as unknown as {
      options: { anchor?: 'top' | 'bottom' }
    }
    popupOptions.options.anchor = undefined
    popup.setLngLat(popup.getLngLat())
    const reveal = () => (container.style.opacity = '1')

    // Mobile: a card almost as wide as the screen can't fit beside an off-centre
    // marker — Mapbox's auto-anchor side-anchors it (it picks left/right by which
    // map half the marker is in, ignoring width) so it runs off-edge. Pan the
    // marker to the horizontal centre and force a vertical anchor, so the card is
    // centred on it and fits. Kept hidden during the pan so it never flashes
    // off-edge; skipped while the map is already animating (e.g. a polygon fit).
    if (map && mobile && !map.isMoving()) {
      const mapRect = map.getContainer().getBoundingClientRect()
      const rect = popup.getElement()?.getBoundingClientRect()
      if (rect && (rect.left < mapRect.left || rect.right > mapRect.right)) {
        container.style.opacity = '0'
        const point = map.project(popup.getLngLat())
        popupOptions.options.anchor =
          point.y < mapRect.height / 2 ? 'top' : 'bottom'
        map.panBy([point.x - mapRect.width / 2, 0], {
          duration: 300,
          easing: easeInOutCubic
        })
        map.once('moveend', () => {
          if (!popup.isOpen()) return
          popup.setLngLat(popup.getLngLat())
          reveal()
        })
        return
      }
    }
    reveal()
  }, [overlayPopup, overlayPopupRef, mapRef, container, mobile])

  if (!container) return null

  return createPortal(
    TooltipComponent && overlayPopup ? (
      <TooltipComponent properties={overlayPopup.properties} />
    ) : null,
    container
  )
}

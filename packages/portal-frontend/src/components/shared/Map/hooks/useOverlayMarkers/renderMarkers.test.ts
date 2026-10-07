/** @jest-environment @happy-dom/jest-environment */
import type { FeatureCollection } from 'geojson'

import type { OverlayLayerDefinition } from '@defaults/map'

import {
  createOverlayMarkersState,
  renderOverlayMarkers
} from './renderMarkers'

// The real createMarkerElement builds a styled anchor; a bare div is enough.
// Record the kind/label/selected each marker is built with so tests can assert presentation.
const markerElementCalls: {
  kind: string
  label: string
  selected?: boolean
}[] = []
jest.mock('@shared/Map/markerElement', () => ({
  createMarkerElement: (opts: {
    kind: string
    label: string
    selected?: boolean
  }) => {
    markerElementCalls.push({
      kind: opts.kind,
      label: opts.label,
      selected: opts.selected
    })
    return document.createElement('div')
  }
}))

// Minimal Marker stub that records every instance and whether it is still on the
// map, so the test can find the live marker and click its element.
const markerInstances: { element: HTMLElement; removed: boolean }[] = []
jest.mock('mapbox-gl', () => {
  class Marker {
    element: HTMLElement
    removed = false
    constructor({ element }: { element: HTMLElement }) {
      this.element = element
      markerInstances.push(this)
    }
    setLngLat() {
      return this
    }
    addTo() {
      return this
    }
    remove() {
      this.removed = true
    }
  }
  return { Marker }
})

const point = (properties: Record<string, unknown>): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-79.45, 44.04] },
      properties
    }
  ]
})

// Map stub for the linked-polygon hover path: `getSource` drives whether the
// polygon source is present, `setFeatureState` records the write, `getCanvas`
// satisfies the cursor assignment in the pointerenter handler.
const mapWith = (getSource: () => unknown) => {
  const setFeatureState = jest.fn()
  const map = {
    getSource,
    setFeatureState,
    getCanvas: () => ({ style: {} })
  } as unknown as never
  return { map, setFeatureState }
}

// jsdom ships no PointerEvent — and the handlers only read `pointerType`, so a
// MouseEvent carrying that field is exactly what they see in a browser.
const pointerEvent = (type: string, pointerType: string): MouseEvent => {
  const event = new MouseEvent(type, { bubbles: true })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  return event
}

// A full gesture: the pointerdown that records the pointer type, then the click.
const gesture = (element: HTMLElement, pointerType: string): void => {
  element.dispatchEvent(pointerEvent('pointerdown', pointerType))
  element.dispatchEvent(pointerEvent('click', pointerType))
}

const overlayWith = (
  onMarkerClick: (p: Record<string, unknown>) => boolean
): OverlayLayerDefinition =>
  ({
    id: 'schools',
    cluster: undefined,
    tooltip: true,
    onMarkerClick,
    polygon: {
      showOnMarkerHover: true
    }
  }) as unknown as OverlayLayerDefinition

describe('renderOverlayMarkers — marker freshness across data updates', () => {
  it('clicking a school after its bbox changes invokes onMarkerClick with the NEW properties', () => {
    markerInstances.length = 0
    const state = createOverlayMarkersState()
    let clicked: Record<string, unknown> | null = null
    const overlay = overlayWith((p) => {
      clicked = p
      return true
    })
    const popup = {
      overlayPopupRef: { current: null },
      markerActiveRef: { current: false },
      setOverlayPopup: jest.fn(),
      closeMarkerRef: { current: null }
    }
    const args = {
      map: {} as never,
      overlay,
      state,
      bbox: [-180, -85, 180, 85] as [number, number, number, number],
      zoom: 12,
      dark: false,
      popup
    }

    // 1st render — French mode: no bbox scalars on the marker (frenchBbox null).
    renderOverlayMarkers({
      ...args,
      data: point({ id: 'X', name: 'Armitage' })
    })

    // 2nd render — English mode: same school id, now carrying the English bbox.
    renderOverlayMarkers({
      ...args,
      data: point({
        id: 'X',
        name: 'Armitage',
        swLng: 1,
        swLat: 2,
        neLng: 3,
        neLat: 4
      })
    })

    // The school whose data changed is a different marker now — click the live
    // one and assert its click handler sees the up-to-date bbox.
    const live = markerInstances.filter((m) => !m.removed)
    expect(live).toHaveLength(1)
    gesture(live[0].element, 'mouse')

    expect(clicked).not.toBeNull()
    expect(clicked!.swLng).toBe(1)
    expect(clicked!.neLat).toBe(4)
  })
})

describe('renderOverlayMarkers — linked-polygon hover guards a missing source', () => {
  const render = (map: never): HTMLElement => {
    markerInstances.length = 0
    renderOverlayMarkers({
      map,
      overlay: overlayWith(() => true),
      data: point({ id: 'X', name: 'Armitage' }),
      state: createOverlayMarkersState(),
      bbox: [-180, -85, 180, 85],
      zoom: 12,
      dark: false,
      popup: {
        overlayPopupRef: { current: null },
        setOverlayPopup: jest.fn(),
        markerActiveRef: { current: false },
        closeMarkerRef: { current: null }
      } as never
    })
    return markerInstances.filter((m) => !m.removed)[0].element
  }

  // A DOM marker outlives its linked polygon source (inactive overlay / post-setStyle);
  // hovering it must no-op, not throw "source does not exist".
  it('does not throw and skips setFeatureState when the polygon source is absent', () => {
    const { map, setFeatureState } = mapWith(() => undefined)
    const element = render(map)
    expect(() =>
      element.dispatchEvent(pointerEvent('pointerenter', 'mouse'))
    ).not.toThrow()
    expect(setFeatureState).not.toHaveBeenCalled()
  })

  it('writes the polygon hover state when the source exists', () => {
    const { map, setFeatureState } = mapWith(() => ({}))
    const element = render(map)
    element.dispatchEvent(pointerEvent('pointerenter', 'mouse'))
    expect(setFeatureState).toHaveBeenCalledWith(
      { source: 'schools-polygons', id: 'X' },
      { hover: true }
    )
  })
})

describe('renderOverlayMarkers — clickZoom coexists with selection', () => {
  it('zooms in AND invokes onMarkerClick when the marker both selects and has clickZoom', () => {
    markerInstances.length = 0
    const easeTo = jest.fn()
    let selected = false
    const overlay = {
      id: 'schools',
      tooltip: true,
      marker: { clickZoom: 12 },
      onMarkerClick: () => {
        selected = true
        return true
      },
      polygon: { showOnMarkerHover: true }
    } as unknown as OverlayLayerDefinition

    renderOverlayMarkers({
      map: { getZoom: () => 10, easeTo } as unknown as never,
      overlay,
      data: point({ id: 'X', name: 'Armitage' }),
      state: createOverlayMarkersState(),
      bbox: [-180, -85, 180, 85],
      zoom: 10,
      dark: false,
      popup: {
        overlayPopupRef: { current: null },
        setOverlayPopup: jest.fn(),
        markerActiveRef: { current: false },
        closeMarkerRef: { current: null }
      } as never
    })

    const live = markerInstances.filter((m) => !m.removed)
    gesture(live[0].element, 'mouse')

    expect(selected).toBe(true)
    expect(easeTo).toHaveBeenCalledWith(expect.objectContaining({ zoom: 12 }))
  })
})

describe('renderOverlayMarkers — name-tag overlays', () => {
  it('renders a name-tag with the feature name as label', () => {
    markerInstances.length = 0
    markerElementCalls.length = 0
    const state = createOverlayMarkersState()
    const overlay = {
      id: 'hoods',
      marker: { type: 'name' },
      polygon: { color: '#1565C0' }
    } as unknown as OverlayLayerDefinition

    renderOverlayMarkers({
      map: {} as never,
      overlay,
      data: point({ locationId: 'h1', name: 'Downtown' }),
      state,
      bbox: [-80, 43, -79, 45],
      zoom: 12,
      dark: false,
      popup: {
        overlayPopupRef: { current: null },
        setOverlayPopup: jest.fn(),
        markerActiveRef: { current: false },
        closeMarkerRef: { current: null }
      } as never
    })

    expect(markerElementCalls).toContainEqual(
      expect.objectContaining({ kind: 'name', label: 'Downtown' })
    )
  })
})

describe('renderOverlayMarkers — selected state at render time', () => {
  const renderWith = (
    overlay: OverlayLayerDefinition,
    selectedIds?: Set<string>
  ) =>
    renderOverlayMarkers({
      map: {} as never,
      overlay,
      data: point({ locationId: 'h1', name: 'Downtown' }),
      state: createOverlayMarkersState(),
      bbox: [-80, 43, -79, 45],
      zoom: 12,
      dark: false,
      popup: {
        overlayPopupRef: { current: null },
        setOverlayPopup: jest.fn(),
        markerActiveRef: { current: false },
        closeMarkerRef: { current: null }
      } as never,
      selectedIds
    })

  it('is born selected when its location is in selectedIds and the overlay opts in', () => {
    markerElementCalls.length = 0
    renderWith(
      {
        id: 'hoods',
        marker: { type: 'name', selectedState: true }
      } as unknown as OverlayLayerDefinition,
      new Set(['h1'])
    )
    expect(markerElementCalls).toContainEqual(
      expect.objectContaining({ selected: true })
    )
  })

  it('is not selected without `marker.selectedState`, even if in selectedIds', () => {
    markerElementCalls.length = 0
    renderWith(
      {
        id: 'hoods',
        marker: { type: 'name' }
      } as unknown as OverlayLayerDefinition,
      new Set(['h1'])
    )
    expect(markerElementCalls).toContainEqual(
      expect.objectContaining({ selected: false })
    )
  })
})

describe('renderOverlayMarkers — touch taps preview, never select', () => {
  const setup = () => {
    markerInstances.length = 0
    let selected = false
    const overlay = {
      id: 'schools',
      tooltip: true,
      selectable: 'marker',
      onMarkerClick: () => {
        selected = true
        return true
      },
      polygon: { showOnMarkerHover: true }
    } as unknown as OverlayLayerDefinition
    const { map, setFeatureState } = mapWith(() => ({}))
    const popup = {
      overlayPopupRef: { current: null },
      setOverlayPopup: jest.fn(),
      markerActiveRef: { current: false },
      closeMarkerRef: { current: null }
    }

    renderOverlayMarkers({
      map,
      overlay,
      data: point({ id: 'X', name: 'Armitage', locationId: 'X' }),
      state: createOverlayMarkersState(),
      bbox: [-180, -85, 180, 85],
      zoom: 12,
      dark: false,
      popup: popup as never
    })

    return {
      element: markerInstances.filter((m) => !m.removed)[0].element,
      setOverlayPopup: popup.setOverlayPopup,
      setFeatureState,
      wasSelected: () => selected
    }
  }

  it('opens the tooltip and commits nothing to the selection', () => {
    const { element, setOverlayPopup, wasSelected } = setup()
    gesture(element, 'touch')

    expect(wasSelected()).toBe(false)
    expect(setOverlayPopup).toHaveBeenCalledWith(
      expect.objectContaining({ touch: true, selectable: true })
    )
  })

  it('closes the tooltip on a second tap of the same marker', () => {
    const { element, setOverlayPopup } = setup()
    gesture(element, 'touch')
    gesture(element, 'touch')

    expect(setOverlayPopup).toHaveBeenLastCalledWith(null)
  })

  // Touch emulates mouseenter on tap (and never the matching leave) — the tap
  // path owns the tooltip, so the emulated hover must stay silent.
  it('ignores the hover a touch pointer emulates', () => {
    const { element, setOverlayPopup, setFeatureState } = setup()
    element.dispatchEvent(pointerEvent('pointerenter', 'touch'))

    expect(setOverlayPopup).not.toHaveBeenCalled()
    expect(setFeatureState).not.toHaveBeenCalled()
  })
})

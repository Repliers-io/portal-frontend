import type { FeatureCollection } from 'geojson'
import type { LngLatBounds } from 'mapbox-gl'

import type { OverlayLayerDefinition } from '@defaults/map'

import { toMarkerSelect } from './overlays'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0]
          ]
        ]
      },
      properties: { id: 'zip', longitude: 0.5, latitude: 0.4 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [2, 2] },
      properties: { id: 'school', longitude: 2, latitude: 2 }
    }
  ]
}

const overlay = (
  selectable: OverlayLayerDefinition['selectable']
): OverlayLayerDefinition => ({
  id: 'zips',
  label: 'Zips',
  selectable,
  fetchData: async () => data
})

describe('toMarkerSelect', () => {
  it('selects a polygon overlay through name markers at its polygons’ centres', async () => {
    const layer = toMarkerSelect(overlay('polygon'))

    expect(layer).toMatchObject({
      selectable: 'marker',
      marker: { type: 'name' },
      polygon: { showOnMarkerHover: true }
    })

    const { features } = await layer.fetchData(
      {} as LngLatBounds,
      new AbortController().signal,
      {},
      12,
      layer
    )
    // one point per polygon, linked by the same properties; existing points stay single
    expect(
      features
        .filter((f) => f.geometry.type === 'Point')
        .map((f) => [f.properties?.id, f.geometry])
    ).toEqual([
      ['zip', { type: 'Point', coordinates: [0.5, 0.4] }],
      ['school', { type: 'Point', coordinates: [2, 2] }]
    ])
  })

  it('leaves a marker-select overlay as it is', () => {
    const layer = overlay('marker')
    expect(toMarkerSelect(layer)).toBe(layer)
  })
})

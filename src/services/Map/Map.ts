import { type MouseEvent } from 'react'
import { type Map, type Marker } from 'mapbox-gl'

import { type ApiCluster, type Property } from 'services/API'
import { MAP_CONSTANTS } from 'services/Map/constants'
import MarkerExtensionService, {
  type MarkerExtension
} from 'services/Map/MarkerExtension'
import PopupExtensionService, {
  type PopupExtension
} from 'services/Map/PopupExtension'
import { MapDataMode } from 'services/Map/types'

export class MapService {
  sharedMap: Map | null = null

  popupExtension: PopupExtension
  markerExtension: MarkerExtension

  dataMode: MapDataMode = MapDataMode.SINGLE_MARKER

  settleDataMode(count: number): void {
    this.dataMode =
      count > MAP_CONSTANTS.API_COUNT_TO_ENABLE_CLUSTERING
        ? MapDataMode.CLUSTER
        : MapDataMode.SINGLE_MARKER
  }

  constructor() {
    this.popupExtension = PopupExtensionService
    this.markerExtension = MarkerExtensionService
  }

  setMap(map: Map): void {
    this.sharedMap = map
  }

  removeMap(): void {
    this.sharedMap?.remove()
    this.sharedMap = null

    this.resetMarkersSingleView()
    this.resetMarkersCluster()
  }

  get map(): Map | null {
    return this.sharedMap
  }

  getMarker(mlsNumber: string): Marker | undefined {
    return this.markerExtension.markers[mlsNumber]
  }

  showPopup(mlsNumber: string): void {
    if (!this.map) return
    const marker = this.getMarker(mlsNumber)
    if (!marker) return
    marker.getElement().dispatchEvent(new Event('mouseenter'))
  }

  hidePopup(): void {
    if (!this.map) return
    this.popupExtension.removePopup()
  }

  pinsZoomLevel(): boolean {
    if (!this.map) return false

    return this.map.getZoom() >= MAP_CONSTANTS.MAX_ZOOM_FOR_SHOW_PINS
  }

  update(list: Property[], clusters: ApiCluster[], count: number): void {
    this.setProperties(list)
    this.settleDataMode(count)

    if (!count) {
      // no listings
      this.resetMarkersSingleView()
      this.resetMarkersCluster()
    } else if (count > MAP_CONSTANTS.API_COUNT_TO_ENABLE_CLUSTERING) {
      // enable clustering
      this.resetMarkersSingleView()
      this.smartResetMarkersCluster(clusters)
    } else {
      // listings count is less then the clustering threshold
      this.resetMarkersCluster()
    }
  }

  showMarkers({
    properties,
    onClick,
    onTap
  }: {
    properties: Property[]
    onClick?: (e: MouseEvent, property: Property, multiUnit: boolean) => void
    onTap?: (property: Property, multiUnit: boolean) => void
  }): void {
    if (
      !this.map ||
      !this.pinsZoomLevel() ||
      this.dataMode !== MapDataMode.SINGLE_MARKER ||
      !properties.length
    ) {
      return
    }
    // TODO: refactor markerExtension
    // TODO: remove store and map references
    this.markerExtension.showMarkers({
      map: this.map,
      properties,
      onClick,
      onTap
    })
  }

  showClusterMarkers({ clusters }: { clusters: ApiCluster[] }): void {
    if (
      !this.map ||
      !this.pinsZoomLevel() ||
      this.dataMode !== MapDataMode.CLUSTER ||
      !clusters.length
    ) {
      return
    }
    // TODO: refactor markerExtension
    this.markerExtension.showClusterMarkers({ clusters, map: this.map })
  }

  resetMarkersSingleView(): void {
    this.markerExtension.resetMarkers()
    this.markerExtension.resetMultiUnits()
  }

  resetMarkersCluster(): void {
    this.markerExtension.resetClusters()
  }

  smartResetMarkersCluster(clusters: ApiCluster[]): void {
    this.markerExtension.smartResetClusters(clusters)
  }

  setProperties(properties: Property[]): void {
    this.markerExtension.resetUniqueProperty()
    properties.forEach((property) =>
      this.markerExtension.putUniqueProperty(property)
    )
  }
}
const mapServiceInstance = new MapService()
export default mapServiceInstance

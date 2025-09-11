'use client'

import { type MouseEvent } from 'react'
import { type Map, Marker } from 'mapbox-gl'

import { propertyCardSizes } from '@configs/cards-grids'

import { type ApiCluster as Cluster, type Property } from 'services/API'
import { createMarkerElement, MAP_CONSTANTS, type Markers } from 'services/Map'
import PopupExtensionService, {
  type PopupExtension
} from 'services/Map/PopupExtension'
import { formatPrice } from 'utils/formatters'
import {
  getMapUrl,
  getMarkerName,
  toMapboxBounds,
  toMapboxPoint
} from 'utils/map'
import {
  getCardName,
  getMarkerLabel,
  getSeoUrl,
  scrubbed
} from 'utils/properties'

export interface UniqProperty {
  count: number
  property: Property
  mls: string[]
}

export class MarkerExtension {
  markers: Markers = {}
  multiUnitMarkers: Markers = {}
  clusterMarkers: Markers = {}

  popupExtension: PopupExtension

  uniqueProperties: { [key: string]: UniqProperty } = {}

  lastCardRef: HTMLElement | null = null

  constructor() {
    this.popupExtension = PopupExtensionService
  }

  showMarkers({
    map,
    properties,
    onClick,
    onTap
  }: {
    map: Map
    properties: Property[]
    onClick?: (e: MouseEvent, property: Property, multiUnit: boolean) => void
    onTap?: (property: Property, multiUnit: boolean) => void
  }): void {
    let muMarkersPotentiallyToRemove = Object.keys(this.multiUnitMarkers)

    const hoverCard = ({ mlsNumber }: Property) => {
      const card = document.getElementById(getCardName(mlsNumber))
      if (card) {
        card.classList.add('active')
        this.lastCardRef = card
      }
    }

    const leaveCard = () => {
      const card = this.lastCardRef
      card?.classList.remove('active')
    }

    properties.forEach((property) => {
      const {
        address: { streetName, streetNumber, city },
        mlsNumber,
        listPrice,
        status
      } = property

      const propertyCenter = {
        lng: Number(property.map.longitude),
        lat: Number(property.map.latitude)
      }

      const uniqueProperty = this.getUniqueRecord(property)
      const multiUnit = uniqueProperty ? uniqueProperty.count > 1 : false
      const muKey = this.getMUKey(streetName, streetNumber, city)

      const singleViewOnMap = this.markers[mlsNumber]
      const multiUnitOnMap = this.multiUnitMarkers[muKey]

      if (multiUnitOnMap) {
        muMarkersPotentiallyToRemove = muMarkersPotentiallyToRemove.filter(
          (key) => key !== muKey
        )
        return
      }

      if (singleViewOnMap) return

      const label = multiUnit
        ? `${uniqueProperty!.count} units`
        : !scrubbed(listPrice)
          ? formatPrice(listPrice)
          : getMarkerLabel(property)

      const link = getSeoUrl(property)

      // eslint-disable-next-line prefer-const
      let marker: Marker

      const markerElement = createMarkerElement({
        id: getMarkerName(mlsNumber),
        link,
        label,
        status,
        onClick: (e: MouseEvent) => onClick?.(e, property, multiUnit),
        onTap: () => {
          const markerCenterPixels = map.project([
            propertyCenter.lng,
            propertyCenter.lat
          ])

          markerCenterPixels.y += Number(propertyCardSizes.drawer.height) / 2 // half of the drawer height
          const markerCenterCoords = map.unproject(markerCenterPixels)

          map.flyTo({
            center: markerCenterCoords,
            curve: 1
          })

          map.once('moveend', () => {
            onTap?.(property, multiUnit)
          })
        },
        onMouseEnter: () => {
          this.popupExtension.showPopup(property, marker, map)
          hoverCard(property)
        },
        onMouseLeave: () => {
          this.popupExtension.removePopup()
          leaveCard()
        }
      })

      marker = new Marker(markerElement).setLngLat(propertyCenter).addTo(map)

      if (multiUnit) {
        this.addMultiUnit(muKey, marker)
        // TODO: double check this
        // not working properly in some edge cases
        muMarkersPotentiallyToRemove = muMarkersPotentiallyToRemove.filter(
          (key) => key !== muKey
        )
      } else {
        this.add(property.mlsNumber, marker)
      }
    })

    // Clearing Marker Residues
    const markersToRemove = Object.keys(this.markers).filter(
      (markerKey) => !properties.some((prop) => prop.mlsNumber === markerKey)
    )

    this.removeMarkers(markersToRemove)
    this.removeMUMarkers(muMarkersPotentiallyToRemove)
  }

  add(key: string, marker: Marker) {
    if (!this.markers[key]) {
      this.markers[key] = marker
    }
  }

  removeMarkers(keys: string[]) {
    const markers = { ...this.markers }
    keys.forEach((key) => {
      if (this.markers[key]) {
        this.markers[key].remove()
      }
      delete markers[key]
    })
    this.markers = { ...markers }
  }

  removeMUMarkers(keys: string[]) {
    const markers = { ...this.multiUnitMarkers }
    keys.forEach((key) => {
      if (this.multiUnitMarkers[key]) {
        this.multiUnitMarkers[key].remove()
      }
      delete markers[key]
    })
    this.multiUnitMarkers = { ...markers }
  }

  resetMarkers() {
    const markers = Object.values(this.markers)
    markers.forEach((marker) => marker.remove())

    this.markers = {}
  }

  // MultiUnit Utils
  getMUKey(streetName: string, streetNumber: string, city: string): string {
    return `${streetName}-${streetNumber}-${city}`.toLowerCase()
  }

  getUniqueRecord(property: Property): UniqProperty | undefined {
    const { streetName, streetNumber, city } = property.address
    const addressKey = this.getMUKey(streetName, streetNumber, city)

    return this.uniqueProperties[addressKey]
  }

  // TODO: rename and clarify the logic
  putUniqueProperty(property: Property): void {
    const hashTable = this.uniqueProperties
    const { address } = property
    const addressKey = this.getMUKey(
      address.streetName,
      address.streetNumber,
      address.city
    )

    if (
      property.class === 'CommercialProperty' ||
      property.class === 'ResidentialProperty'
    ) {
      return
    }

    if (hashTable[addressKey]) {
      hashTable[addressKey].count += 1
      hashTable[addressKey].mls.push(property.mlsNumber)
    } else {
      hashTable[addressKey] = { count: 1, property, mls: [property.mlsNumber] }
    }
  }

  resetUniqueProperty(): void {
    this.uniqueProperties = {}
  }

  addMultiUnit(key: string, marker: Marker) {
    if (!this.multiUnitMarkers[key]) {
      this.multiUnitMarkers[key] = marker
    }
  }

  resetMultiUnits() {
    const markers: Marker[] = Object.values(this.multiUnitMarkers)
    markers.forEach((marker) => marker.remove())

    this.multiUnitMarkers = {}
  }

  // Clustering
  showClusterMarkers({
    clusters,
    map
  }: {
    clusters: Cluster[]
    map: Map
  }): void {
    clusters.forEach((cluster) => {
      if (this.clusterMarkers[this.getClusterKey(cluster)]) return

      const { bounds, location } = cluster
      const center = toMapboxPoint(location)
      const zoom = map.getZoom()

      const diff = bounds.bottom_right.longitude - bounds.top_left.longitude
      const buffer = diff * MAP_CONSTANTS.ZOOM_TO_MARKER_BUFFER
      const mapboxBounds = toMapboxBounds(bounds, buffer)

      const markerElement = createMarkerElement({
        size: 'cluster',
        link: getMapUrl({ center, zoom }),
        label: cluster.count.toString(),
        onClick: (e) => {
          map.fitBounds(mapboxBounds)
          e.preventDefault()
        }
      })

      const marker = new Marker(markerElement).setLngLat(center).addTo(map)

      this.addCluster(this.getClusterKey(cluster), marker)
    })
  }

  addCluster(key: string, marker: Marker) {
    if (!this.clusterMarkers[key]) {
      this.clusterMarkers[key] = marker
    }
  }

  resetClusters() {
    const markers: Marker[] = Object.values(this.clusterMarkers)
    markers.forEach((marker) => marker.remove())

    this.clusterMarkers = {}
  }

  smartResetClusters(clusters: Cluster[]) {
    const newClusterKeys = clusters.map((cluster) =>
      this.getClusterKey(cluster)
    )
    const renderedClusterKeys = Object.keys(this.clusterMarkers)

    renderedClusterKeys.forEach((key) => {
      if (!newClusterKeys.includes(key)) {
        this.clusterMarkers[key].remove()
        delete this.clusterMarkers[key]
      }
    })
  }

  private getClusterKey(cluster: Cluster): string {
    return `c-${cluster.count}-lat-${cluster.location.latitude}-lng-${cluster.location.longitude}`
  }
}

const markerExtensionInstance = new MarkerExtension()
export default markerExtensionInstance

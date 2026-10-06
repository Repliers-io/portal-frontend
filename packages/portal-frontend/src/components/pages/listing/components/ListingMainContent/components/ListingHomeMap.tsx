import React from 'react'
import mapboxgl from 'mapbox-gl'

import mapConfig from '@configs/map'
import { HomeMap } from '@shared/Map'

import { useDialog } from 'providers/DialogProvider'
import { useListing } from 'providers/ListingProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { formatShortAddress, getMakiSymbol } from 'utils/listings'

const { mapFlyCurve } = mapConfig

export const ListingHomeMap = ({
  type = 'interactive'
}: {
  type?: 'interactive' | 'static'
}) => {
  const { hideDialog } = useDialog('listing')

  const {
    setLayout,
    mapRef: pageMapRef // main map instance from <MapPageContent />
  } = useMapOptions()

  const { listing } = useListing()
  const {
    address,
    map: { longitude, latitude },
    listPrice,
    status
  } = listing

  const lng = Number(longitude)
  const lat = Number(latitude)
  const zoom = mapConfig.zoom.listingAddress

  const handleStaticMapClick = (e: React.MouseEvent) => {
    if (pageMapRef.current) {
      e.preventDefault()
      setLayout('map')
      hideDialog()
      pageMapRef.current.flyTo({
        center: new mapboxgl.LngLat(lng, lat),
        zoom,
        ...mapFlyCurve
      })
    }
  }

  const symbol = getMakiSymbol(listing)
  const title = `${formatShortAddress(address)}, ${address.city}`

  return (
    <HomeMap
      type={type}
      lng={lng}
      lat={lat}
      zoom={zoom}
      title={title}
      recenterThreshold={20}
      marker={{ symbol, status, price: listPrice, size: 'tag' }}
      onClick={handleStaticMapClick}
    />
  )
}

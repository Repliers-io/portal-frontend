import { useEffect, useState } from 'react'
import queryString from 'query-string'

import { gmapsApiKey, gmapsApiUrl } from '@configs/api'
import IcoMap from '@icons/IcoMap'

import { useProperty } from 'providers/PropertyProvider'

import { size } from '../constants'

import CardTemplate from './CardTemplate'

const MapCard = () => {
  const {
    property: {
      mlsNumber,
      map: { longitude, latitude }
    }
  } = useProperty()
  const [mapStaticImage, setMapStaticImage] = useState('')

  const center = `${latitude},${longitude}`
  const url = `https://www.google.com/maps/search/?api=1&query=${center}&zoom=15`

  useEffect(() => {
    const params = queryString.stringify({
      size,
      center,
      zoom: 15,
      scale: 2,
      format: 'webp',
      maptype: 'satellite',
      key: gmapsApiKey
    })

    setMapStaticImage(`${gmapsApiUrl}staticmap?${params}`)
  }, [mlsNumber])

  return (
    <CardTemplate
      url={url}
      title="Map"
      description="See property on map"
      backgroundImage={mapStaticImage}
      icon={<IcoMap size={36} color="white" />}
    />
  )
}

export default MapCard

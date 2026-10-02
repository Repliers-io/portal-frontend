import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import queryString from 'query-string'

import apiConfig from '@configs/api'
import { MapIcon } from '@configs/icons'

import { useListing } from 'providers/ListingProvider'

import { size } from '../constants'

import { CardTemplate } from '.'

const { gmapsApiKey: key, gmapsApiUrl } = apiConfig

export const MapCard = () => {
  const t = useTranslations()
  const { listing } = useListing()
  const [mapStaticImage, setMapStaticImage] = useState('')

  const {
    mlsNumber,
    map: { longitude, latitude }
  } = listing

  const center = `${latitude},${longitude}`
  const staticGmapsUrl = `https://www.google.com/maps/search/?api=1&query=${center}&zoom=15`

  useEffect(() => {
    const params = queryString.stringify({
      size,
      center,
      zoom: 15,
      scale: 2,
      format: 'webp',
      maptype: 'satellite',
      key
    })

    setMapStaticImage(`${gmapsApiUrl}staticmap?${params}`)
  }, [mlsNumber])

  return (
    <CardTemplate
      url={staticGmapsUrl}
      title={t('PDP.showcaseCards.map.title')}
      description={t('PDP.showcaseCards.map.description')}
      backgroundImage={mapStaticImage}
      bgcolor="#e9e6e0"
      icon={<MapIcon size={36} color="white" />}
    />
  )
}

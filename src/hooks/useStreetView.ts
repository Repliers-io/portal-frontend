import { useEffect, useState } from 'react'

import { type PropertyAddress } from 'services/API'
import {
  getFullAddress,
  getStreetViewImageUrl,
  getStreetViewLink,
  type MapCoordinates,
  type StreetViewOptions
} from 'utils/street-view'

interface StreetViewProps {
  address: Partial<PropertyAddress>
  map: MapCoordinates
  options?: StreetViewOptions
}

export default function useStreetView({
  address,
  map,
  options
}: StreetViewProps) {
  const [url, setUrl] = useState('')
  const [thumbnailImage, setThumbnailImage] = useState('')

  useEffect(() => {
    const fullAddress = getFullAddress(address)

    setThumbnailImage(getStreetViewImageUrl(fullAddress, map, options))

    getStreetViewLink(fullAddress, map, options)
      .then(setUrl)
      .catch(() => setUrl(''))
  }, [address, map, options])

  return { url, thumbnailImage }
}

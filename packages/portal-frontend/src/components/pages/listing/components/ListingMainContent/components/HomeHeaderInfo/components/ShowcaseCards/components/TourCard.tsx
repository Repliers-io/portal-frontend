import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { PlayArrowRoundedIcon, ViewInArIcon } from '@configs/icons'

import { useListing } from 'providers/ListingProvider'
import { type TourMedia } from 'utils/listings'
import { getCDNPath, getYoutubeVideoId } from 'utils/urls'

import { CardTemplate } from '.'

const icons = {
  '3d': <ViewInArIcon sx={{ color: 'white', fontSize: 38 }} />,
  video: <PlayArrowRoundedIcon sx={{ color: 'white', fontSize: 38 }} />
}

// maps the media type to its PDP.showcaseCards translation key
const messageKeys = {
  '3d': 'tour3d',
  video: 'tourVideo'
} as const

export const TourCard = ({ url, type }: TourMedia) => {
  const t = useTranslations()
  const {
    listing: { mlsNumber, images = [], timestamps }
  } = useListing()
  const [image, setImage] = useState('')

  const setFallbackImage = (): void => {
    // Failed to fetch the tour thumbnail, using second image of the property —
    // the first one is already the gallery's main image, so this avoids a
    // duplicate between the gallery and the tour card.
    setImage(
      getCDNPath(
        images[images.length > 1 ? 1 : 0],
        'small',
        timestamps?.photosUpdated
      )
    )
  }

  const fetchVimeoThumbnail = async () => {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${url}`)
    const videoDetails = await res.json()
    setImage(videoDetails.thumbnail_url)
  }

  const fetchOpenGraphImage = async () => {
    try {
      const res = await fetch(`/api/fetchMeta?url=${encodeURIComponent(url)}`)
      const html = await res.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const ogImage = doc.querySelector('meta[property="og:image"]')
      const imageUrl = ogImage?.getAttribute('content')
      if (imageUrl) {
        setImage(imageUrl)
      } else {
        setFallbackImage()
      }
    } catch {
      // all our thumbnail attempts failed — fall back to a property image
      setFallbackImage()
    }
  }

  // reset image when listing.mlsNumber changes
  useEffect(() => {
    setImage('')
  }, [mlsNumber])

  useEffect(() => {
    if (url.includes('youtu')) {
      // no need to fetch the thumbnail for youtube videos,
      // we can generate it on the fly
      const videoId = getYoutubeVideoId(url)
      if (videoId) {
        setImage(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`)
      } else {
        setFallbackImage()
      }
    } else if (url.includes('vimeo')) {
      fetchVimeoThumbnail()
    } else {
      fetchOpenGraphImage()
    }
  }, [url])

  const key = messageKeys[type]

  return (
    <CardTemplate
      url={url}
      title={t(`PDP.showcaseCards.${key}.title`)}
      description={t(`PDP.showcaseCards.${key}.description`)}
      backgroundImage={image}
      icon={icons[type]}
    />
  )
}

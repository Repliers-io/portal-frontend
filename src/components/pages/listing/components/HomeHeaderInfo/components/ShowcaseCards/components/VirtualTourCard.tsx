/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react'

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'

import { useProperty } from 'providers/PropertyProvider'
import { scrubbed } from 'utils/properties'
import { getCDNPath, getYoutubeVideoId } from 'utils/urls'

import CardTemplate from './CardTemplate'

const VirtualTourCard = () => {
  const {
    property: {
      mlsNumber,
      details: { virtualTourUrl },
      images
    }
  } = useProperty()
  const [image, setImage] = useState('')

  const setFallbackImage = (): void => {
    // Failed to fetch virtual tour thumbnail, using second image of the property
    // second image is used because the first one is already used as a main image of the gallery
    // so we want to avoid a mess with the same image duplicated in the gallery and the virtual tour card
    setImage(getCDNPath(images[images.length > 1 ? 1 : 0], 'small'))
  }

  const fetchVimeoThumbnail = async () => {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${virtualTourUrl}`
    )
    const videoDetails = await res.json()
    // setVideoTourIcon(true)
    setImage(videoDetails.thumbnail_url)
  }

  const fetchOpenGraphImage = async () => {
    try {
      const res = await fetch(
        `/api/fetchMeta?url=${encodeURIComponent(virtualTourUrl)}`
      )
      // const res = await fetch(virtualTourUrl, { headers })
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // all our API attempts failed
      // fallback to the first image of the property
      setFallbackImage()
    }
  }

  // reset image when property.mlsNumber changes
  useEffect(() => {
    setImage('')
  }, [mlsNumber])

  useEffect(() => {
    if (!virtualTourUrl || scrubbed(virtualTourUrl)) return

    if (virtualTourUrl.includes('youtu')) {
      // no need to fetch the thumbnail for youtube videos,
      // we can generate it on the fly
      const videoId = getYoutubeVideoId(virtualTourUrl)
      if (videoId) {
        setImage(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`)
      } else {
        setFallbackImage()
      }
    } else if (virtualTourUrl.includes('vimeo')) {
      fetchVimeoThumbnail()
    } else {
      fetchOpenGraphImage()
    }
  }, [virtualTourUrl])

  if (!virtualTourUrl || scrubbed(virtualTourUrl)) return null

  return (
    <CardTemplate
      title="Virtual tour"
      url={virtualTourUrl}
      backgroundImage={image}
      description="Visit property virtually"
      icon={<PlayArrowRoundedIcon sx={{ color: 'white', fontSize: 38 }} />}
    />
  )
}

export default VirtualTourCard

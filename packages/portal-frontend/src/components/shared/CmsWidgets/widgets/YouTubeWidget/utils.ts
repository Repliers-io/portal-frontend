const youtubeRssUrl = 'https://www.youtube.com/feeds/videos.xml'
const channelId = 'UC-4K22DNaXxTYIP9iwx2MTQ' // Urban living channel ID
const cacheTtl = 3600 // 1 hour cache for RSS feed

export const fetchYouTubeVideoIds = async (
  maxResults: number = 2
): Promise<string[]> => {
  const response = await fetch(`${youtubeRssUrl}?channel_id=${channelId}`, {
    next: { revalidate: cacheTtl }
  })

  if (!response.ok) {
    console.error('YouTubeWidget::Failed to fetch RSS feed')
    return []
  }

  const xml = await response.text()

  const videoIds = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)]
    .slice(0, maxResults)
    .map((match) => match[1])

  return videoIds
}

// Starts at the tallest layout (4:5 media + 208px header/footer, measured), then takes the
// real height Instagram posts back (see InstagramEmbedSizer).
const instagramEmbed = (_match: string, type: string, code: string) =>
  `<div style="container-type:inline-size;max-width:540px;margin:2rem auto"><iframe src="https://www.instagram.com/${type}/${code}/embed/" scrolling="no" allowfullscreen style="display:block;width:100%;height:calc(125cqw + 208px);border:0"></iframe></div>`

// Instagram links and bare URLs in the text (not in other attributes) become embeds.
export const replaceInstagramWithIframes = (content: string) =>
  content
    .replace(
      /<a [^>]*href="https:\/\/www\.instagram\.com\/(reel|p)\/([\w-]+)[^>]*>.*?<\/a>/g,
      instagramEmbed
    )
    .replace(
      /(?<!["'=])https:\/\/www\.instagram\.com\/(reel|p)\/([\w-]+)[^\s<]*/g,
      instagramEmbed
    )

'use client'

import { Box, type BoxProps } from '@mui/material'

// React sets `muted` only as a DOM property, so a video it creates on the client (a lazy
// mount, a soft navigation to the page) has no `muted` attribute, and iOS Safari autoplays
// only a video carrying that attribute. `defaultMuted` reflects the attribute.
const muteAttribute = (video: HTMLVideoElement | null) => {
  if (video) video.defaultMuted = true
}

// The lighter encodings go first so a phone that decodes them streams half the H.264
// bitrate; the H.264 `src` last is what every browser can play.
export const AutoplayVideo = ({
  src,
  hevc,
  webm,
  ...props
}: BoxProps<'video'> & { src: string; hevc?: string; webm?: string }) => (
  <Box
    component="video"
    ref={muteAttribute}
    autoPlay
    loop
    muted
    playsInline
    {...props}
  >
    {webm && <source src={webm} type="video/webm; codecs=vp9" />}
    {hevc && <source src={hevc} type='video/mp4; codecs="hvc1"' />}
    <source src={src} type="video/mp4" />
  </Box>
)

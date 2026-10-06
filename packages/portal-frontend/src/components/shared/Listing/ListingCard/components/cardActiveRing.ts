import { keyframes } from '@mui/system'

// Highlight ring shown when a listing card is "active" — i.e. its map marker is
// hovered (the marker handler toggles `.active` on the card). Mirrors the map
// marker's ring pop (see markerElement.ts): the box-shadow ring grows from nothing
// and its colour fades in, so the same quick scale-out cue reads on both the marker
// and its grid card. The ring is identical across tenants, so it lives here once.
const ringPop = keyframes({
  from: { boxShadow: '0 0 0 0 #FD60, 0 0 0 0 #FD60' },
  to: { boxShadow: '0 0 0 4px #FD66, 0 0 0 8px #FD66' }
})

export const cardActiveRing = {
  '&.active': {
    boxShadow: '0 0 0 4px #FD66, 0 0 0 8px #FD66',
    animation: `${ringPop} 150ms ease-out`
  }
}

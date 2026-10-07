import mapConfig from '@configs/map'
import typography from '@configs/theme/typography'

import { type Primitive, toSafeNumber } from 'utils/formatters'

import { alpha, darken, lighten } from '@mui/material/styles'

// Builds a marker DOM element cheaply: plain nodes + one shared stylesheet, no
// React root and no per-marker MUI `sx`. The previous React-root version spun up
// a React root + emotion render per marker, which React 18 scheduled across frames
// (the visible staggered pop-in). Static DOM creates ~100 markers in well under
// a frame. This is a faithful port of the old Marker.tsx look (border, double-ring
// hover, recolor, optional link anchor) into a single injected stylesheet.
//
// Mapbox owns the OUTER element (adds `.mapboxgl-marker`, position:absolute +
// transform). The styled `.lm` is an INNER child so our `position:relative`
// (the ring anchor) never fights Mapbox's positioning — passing the styled node
// directly made it 100% map-width and offset the rings.

const STYLE_ID = 'listing-marker-styles'
const font = typography.fontFamily

// Name-tag markers (overlay name labels) are single-line and truncate with an
// ellipsis past this width, so long names don't produce huge markers. A phone or
// tablet map (below `md`) gives them up to 70% of the screen and a second line
// instead — 16px lines in 3px padding keep a one-line tag at the same 26px.
const nameMaxWidth = 140

// Pop-in animation, configurable via @configs/map (enable/disable + speed).
// Opacity fades over the first (opacityRatio * duration) — relative to speed,
// so it scales with the duration. easeOutBack overshoot mirrors the vector pop.
const pop = mapConfig.marker.animation
const popKeyframes = pop.enabled
  ? `@keyframes lm-pop{0%{transform:scale(0);opacity:0}${Math.round(pop.opacityRatio * 100)}%{opacity:1}100%{transform:scale(1);opacity:1}}\n`
  : ''
const popAnimation = pop.enabled
  ? `;animation:lm-pop ${pop.duration}ms cubic-bezier(0.34,1.56,0.64,1) both`
  : ''

const ensureStyles = (): void => {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
${popKeyframes}.lm{position:relative;cursor:pointer;border-radius:40px;width:max-content${popAnimation}}
.lm::before,.lm::after{content:'';position:absolute;display:none;border-radius:32px;pointer-events:none;border:8px solid var(--lm-ring);box-sizing:content-box}
.lm::before{top:-8px;left:-8px;width:100%;height:100%}
.lm::after{top:-16px;left:-16px;width:100%;height:100%;border-width:16px}
@keyframes lm-ring{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.lm.active::before,.lm.active::after{display:block;animation:lm-ring 150ms ease-out both}
.lm.active::after{animation-delay:40ms}
.lm.active .lm__shape{background:var(--lm-hover)}
@media(hover:hover){.lm:hover::before,.lm:hover::after{display:block;animation:lm-ring 150ms ease-out both}.lm:hover::after{animation-delay:40ms}.lm:hover .lm__shape{background:var(--lm-hover)}}
.lm.selected .lm__shape{background:var(--lm-select-bg);border-color:var(--lm-select-border)}
.lm__link{display:block;text-decoration:none;color:inherit}
.lm__shape{box-sizing:border-box;border:2px solid #fff;background:var(--lm-color);color:#fff;font:12px/22px ${font};text-align:center;user-select:none;position:relative;z-index:10}
.lm__pill{min-width:44px;min-height:26px;padding:0 4px;border-radius:8px}
.lm__name{max-width:${nameMaxWidth}px;min-height:26px;padding:0 8px;border-radius:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:959.95px){.lm__name{max-width:70vw;padding:3px 8px;line-height:16px;white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}}
.lm__dot{width:16px;height:16px;border-radius:50%}
.lm__hit{display:none;position:absolute;top:50%;left:50%;width:44px;height:44px;transform:translate(-50%,-50%);border-radius:50%}
@media(hover:none){.lm__hit{display:block}}
.lm__icon-dot{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.lm__icon-dot svg{width:16px;height:16px;fill:currentColor;pointer-events:none}
.lm__cluster{border-radius:50%;overflow:hidden}`
  document.head.appendChild(style)
}

// Zoom-bucket marker size: dot below the point threshold, price tag above.
export type MarkerSize = 'point' | 'tag' | 'cluster'

export type MarkerKind = 'pill' | 'name' | 'dot' | 'icon-dot' | 'cluster'

// Map the zoom-bucket size to a marker shape. cluster→cluster, tag→pill — but the
// price pill is opt-in: a present price must be positive, otherwise it falls back
// to a dot so a caller never renders a "$0" tag (a scrubbed/hidden price collapses
// to 0). An absent price keeps the legacy tag→pill behaviour.
export const markerKind = (size?: MarkerSize, price?: Primitive): MarkerKind =>
  size === 'cluster'
    ? 'cluster'
    : size === 'tag' && (!price || toSafeNumber(price) > 0)
      ? 'pill'
      : 'dot'

// Set every colour CSS var on a `.lm` element. Used at create time and to recolour
// LIVE markers in place when the map style flips the dark palette (vector ⇄ satellite),
// so a recolour never drops + recreates the marker (which flickers it out and back).
export const applyMarkerColors = (
  lm: HTMLElement,
  color: string,
  hoverColor?: string
): void => {
  // Hover halo (ring) + shape recolor default to the marker's own colour; a marker
  // with a distinct hover colour passes `hoverColor` (e.g. listings → showOnMarkerHover).
  const hover = hoverColor ?? color
  lm.style.setProperty('--lm-color', color)
  lm.style.setProperty('--lm-hover', hover)
  lm.style.setProperty('--lm-ring', alpha(hover, 0.3))
  // Selected state (`.lm.selected`): darker border + lighter fill.
  lm.style.setProperty('--lm-select-bg', lighten(color, 0.2))
  lm.style.setProperty('--lm-select-border', darken(color, 0.4))
}

// Returns the OUTER wrapper for mapboxgl.Marker; callers wire events on it.
export const createMarkerElement = ({
  id,
  kind,
  link,
  label,
  color,
  hoverColor,
  members,
  icon,
  selected,
  hitArea
}: {
  id?: string
  link?: string
  kind: MarkerKind
  label: string
  color: string
  hoverColor?: string
  /** Every same-address mlsNumber this marker stands in for — lets a grid card
   *  hover resolve to its (possibly multi-unit) marker via `[data-members~=]`. */
  members?: string[]
  /** Wraps the shape in an `<a>` for native navigation + SEO (optional). */
  /** Override the hover recolor + ring with this colour — overlay markers use
   *  their own accent instead of the shared listing hover colour. */
  /** Full inline SVG string rendered inside the dot. Requires kind 'icon-dot'. */
  icon?: string
  /** Render already in the selected state (`.lm.selected`) — so a marker created
   *  for an already-selected location (e.g. a `locationId` from the URL) shows it
   *  immediately, before any runtime toggle. */
  selected?: boolean
  /** Add a transparent 44×44 tap target around the shape, active on touch only.
   *  A 16px dot is far below the finger-size minimum. */
  hitArea?: boolean
}): HTMLElement => {
  ensureStyles()

  // Plain wrapper Mapbox positions (absolute) — keeps its class off our styles.
  const root = document.createElement('div')

  const lm = document.createElement('div')
  lm.className = 'lm'
  if (id) lm.id = id
  if (members?.length) lm.dataset.members = members.join(' ')
  applyMarkerColors(lm, color, hoverColor)
  // Selected at create time so a marker for an already-selected location shows it
  // immediately (enabled per overlay via `marker.selectedState`).
  if (selected) lm.classList.add('selected')

  // Sits UNDER the shape (which carries z-index 10), so it only catches taps that
  // miss the visual. Empty by design: the CSS gives it size on coarse pointers.
  if (hitArea) {
    const hit = document.createElement('div')
    hit.className = 'lm__hit'
    lm.appendChild(hit)
  }

  const shape = document.createElement('div')
  shape.className = `lm__shape lm__${kind}`

  if (kind === 'cluster') {
    // Old cluster sizing: diameter = 20 + digitCount*4.
    const diameter = 20 + label.length * 4
    shape.style.width = `${diameter}px`
    shape.style.height = `${diameter}px`
    shape.style.lineHeight = `${diameter - 4}px`
    shape.textContent = label
  } else if (kind === 'pill' || kind === 'name') {
    shape.textContent = label
  } else if (kind === 'icon-dot' && icon) {
    // icon is a static SVG string from our own config — never from user input or API.
    shape.innerHTML = icon
  }

  // Accessible name from the `label` the marker already carries (price, cluster
  // count, or overlay name) — one place covers every kind. `data-name` is a
  // copy-independent hook for tests. The name + role land on the focusable node:
  // the anchor when the marker links out (implicit role="link"), else `.lm` as a
  // button (every non-link marker is clickable: select / zoom / open browser).
  if (label) lm.dataset.name = label

  if (link) {
    const anchor = document.createElement('a')
    anchor.className = 'lm__link'
    anchor.href = link
    if (label) anchor.setAttribute('aria-label', label)
    anchor.appendChild(shape)
    lm.appendChild(anchor)
  } else {
    lm.setAttribute('role', 'button')
    if (label) lm.setAttribute('aria-label', label)
    lm.appendChild(shape)
  }

  root.appendChild(lm)
  return root
}

// A marker's hover. The parcel under the marker calls `enter`/`leave` too and sets
// `onParcel`, so the marker's own mouse events do nothing while the pointer is there.
export type MarkerHover = {
  enter: () => void
  leave: () => void
  onParcel: boolean
}

const markerHovers = new WeakMap<Element, MarkerHover>()

export const setMarkerHover = (root: Element, hover: MarkerHover): void => {
  markerHovers.set(root, hover)
}

// By `data-members`, so a multi-unit marker answers for every member.
export const markerHover = (mlsNumber: string): MarkerHover | undefined => {
  const lm = document.querySelector(`.lm[data-members~="${mlsNumber}"]`)
  const root = lm?.parentElement
  return root ? markerHovers.get(root) : undefined
}

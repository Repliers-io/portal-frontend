/**
 * Base brand color palette. Unlike most configs this exports flat **named**
 * constants (not a default object); `@configs/theme/palette` maps these onto the MUI
 * palette. A tenant overrides by shipping its own `configs/<tenant>/colors.ts` that
 * re-exports the same names with new values.
 */
import { darken, lighten } from '@mui/material'

import { type ListingMarkerColor } from 'utils/listings'

/** Pure white surface color. */
export const white = '#FFFFFF'
/** Light grey — hints, disabled text, muted UI. */
export const light = '#7B7B7B'
/** Medium grey — secondary text/icons. */
export const medium = '#3E494B'
/** Dark grey — primary text. */
export const dark = '#363636'
/** Near-black — headings / strongest text. */
export const black = '#130F26'

/** Default page background. */
export const background = '#F4F4F4'

/** Primary brand color (main green) — buttons, links, accents. */
export const primary = '#32735F'
/** Secondary/accent brand color (main coral) — CTAs, highlights, markers. */
export const secondary = '#EC6932'

export const hint = light
export const disabled = light
export const divider = '#E9E9E9'

export const hoverBg = '#F0F0F0'
export const activeBg = '#E5E5E5'

/** Alert / toast / snackbar colors. */
export const info = '#2196F3'
export const error = '#F44336'
export const success = '#4CAF50'
export const warning = '#FFC107'

/**
 * Listing marker colours by status variant. Defaults fill only sold/rent (+ the
 * `default` fallback); a tenant with richer marker coding overrides this whole
 * object. `hoverColor` is optional — when absent the marker's hover halo falls
 * back to its base `color`.
 */
export const markerColors: Record<string, ListingMarkerColor> = {
  default: { color: secondary },
  sold: { color: darken(secondary, 0.2) },
  rent: { color: secondary }
}

/** Palette for demographic/market charts. */
export const chartColors = [secondary, lighten(primary, 0.5), success]
/** Palette for inventory (supply) charts: healthy → tight → oversupply. */
export const inventoryColors = [success, warning, error]

/**
 * Demographic chart palette — 10 perceptually distinct colors for 6-10 item
 * distributions. Ordered so any N-item subset (taking the first N) is visually balanced.
 */
export const demographicsPalette = [
  '#2E86AB', // cerulean
  '#EC6932', // coral
  '#32735F', // teal
  '#8087D0', // lavender
  '#A91752', // crimson
  '#21836A', // emerald
  '#E4A817', // amber
  '#83716D', // mauve
  '#4B5563', // charcoal
  '#9C3FA0' // plum
]

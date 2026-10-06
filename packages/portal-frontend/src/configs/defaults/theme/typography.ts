import { toRem } from 'utils/theme'

import { type TypographyVariantsOptions } from '@mui/material/styles'

/**
 * MUI theme typography. Defines the base font family and the size/weight/
 * line-height for each variant (`h1`–`h6`, `body1`/`body2`, `caption`,
 * `button`). Sizes are authored in px and converted to rem via `toRem` so they
 * scale with the user's root font size.
 *
 * A tenant customizes fonts by overriding `--font-primary` (its own webfont)
 * and, when the scale must differ, a tenant `theme/typography.ts` spreads this
 * default and overrides only the variants that change.
 */
const typography: TypographyVariantsOptions = {
  /** Root font size (px) MUI assumes for its rem↔px conversions. */
  htmlFontSize: 16,
  /** Base font size (px) that `body1`/rem values are relative to. */
  fontSize: 16,
  /** Primary font stack — resolves `--font-primary` (tenant webfont), falling back to the system sans-serif. */
  fontFamily: ['var(--font-primary)', 'sans-serif'].join(','),

  /**
   * Heading scale `h1`–`h6`, all weight 600 (semibold), descending in size
   * (56 → 16px). `h1` is the page hero; `h6` is the smallest heading, matching
   * `body1` size but bolder.
   */
  h1: {
    fontWeight: 600,
    fontSize: toRem(56),
    lineHeight: toRem(72)
  },
  h2: {
    fontWeight: 600,
    fontSize: toRem(28),
    lineHeight: toRem(36)
  },
  h3: {
    fontWeight: 600,
    fontSize: toRem(24),
    lineHeight: toRem(32)
  },
  h4: {
    fontWeight: 600,
    fontSize: toRem(20),
    lineHeight: toRem(28)
  },
  h5: {
    fontWeight: 600,
    fontSize: toRem(18),
    lineHeight: toRem(24)
  },
  h6: {
    fontWeight: 600,
    fontSize: toRem(16),
    lineHeight: toRem(24)
  },

  subtitle2: {},

  /** Default body text (16px, regular weight) — MUI's baseline text variant. */
  body1: {
    fontWeight: 400,
    fontSize: toRem(16),
    lineHeight: toRem(24)
  },

  /** Smaller body text (14px) for secondary/dense content. */
  body2: {
    fontSize: toRem(14),
    lineHeight: toRem(20)
  },

  /** Smallest text (10px) for captions, labels, and fine print. */
  caption: {
    fontSize: toRem(10),
    lineHeight: toRem(16)
  },

  /** Button label style — medium weight, no uppercasing (MUI's default `textTransform` is overridden to `none`). */
  button: {
    lineHeight: 1.75,
    fontSize: toRem(16),
    fontWeight: 'medium',
    textTransform: 'none'
  }
}

export default typography

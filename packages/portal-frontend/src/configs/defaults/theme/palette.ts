import {
  background,
  black,
  dark,
  disabled,
  divider,
  error,
  hint,
  info,
  medium,
  primary,
  secondary,
  success,
  warning,
  white
} from '@configs/colors'

import { darken, lighten } from '@mui/material/styles'

/**
 * MUI theme palette. Maps the raw brand colors from `@configs/colors` onto the
 * semantic slots MUI consumes (`primary`, `secondary`, `error`, …), deriving the
 * `light`/`dark` variants from each `main` value via `lighten`/`darken`.
 *
 * A tenant customizes color by overriding `@configs/colors` — the derived slots
 * here update automatically. To reshape a slot itself (e.g. a fixed `dark`
 * instead of a computed one), a tenant `theme/palette.ts` spreads this default
 * and overrides only the specific slots that differ.
 */
const palette = {
  /** Absolute black/white, independent of light/dark theme. */
  common: {
    black,
    white
  },

  /** Surface colors: `default` is the page/app background, `paper` is raised surfaces (cards, menus, dialogs). */
  background: {
    default: background,
    paper: white
  },

  /** Foreground text colors by prominence: `primary` (body), `secondary` (muted), `disabled`, and `hint` (placeholders). */
  text: {
    primary: dark,
    secondary: medium,
    disabled,
    hint
  },

  /** Color of hairline separators (dividers, borders). */
  divider,

  /**
   * Brand color — the dominant accent (buttons, links, active states).
   * `light`/`dark` are derived from `main`; `contrastText` is the readable
   * text/icon color placed on top of `main`.
   */
  primary: {
    main: primary,
    light: lighten(primary, 0.5),
    dark: darken(primary, 0.2),
    contrastText: white
  },

  /** Secondary accent — used for alternate emphasis alongside `primary`. */
  secondary: {
    main: secondary,
    light: lighten(secondary, 0.5),
    dark: darken(secondary, 0.2),
    contrastText: white
  },

  /** Positive/confirmation state (valid input, success alerts). */
  success: {
    main: success,
    light: lighten(success, 0.5),
    dark: darken(success, 0.2),
    contrastText: white
  },

  /** Error/destructive state (validation failures, error alerts). */
  error: {
    main: error,
    light: lighten(error, 0.5),
    dark: darken(error, 0.2),
    contrastText: white
  },

  /** Caution state (non-blocking warnings). */
  warning: {
    main: warning,
    light: lighten(warning, 0.5),
    dark: darken(warning, 0.2),
    contrastText: white
  },

  /** Informational state (neutral notices, hints). */
  info: {
    main: info,
    light: lighten(info, 0.5),
    dark: darken(info, 0.2),
    contrastText: white
  }
}

export default palette

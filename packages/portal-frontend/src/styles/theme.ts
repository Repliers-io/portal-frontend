'use client'

import breakpoints from '@configs/theme/breakpoints'
import components from '@configs/theme/components'
import mixins from '@configs/theme/mixins'
import palette from '@configs/theme/palette'
import shadows from '@configs/theme/shadows'
import typography from '@configs/theme/typography'

import { createTheme } from '@mui/material/styles'

// Raw theme configuration for reuse (e.g. dark mode variant)
export const themePreset = {
  spacing: 8,
  breakpoints,
  palette,
  mixins,
  shadows,
  typography,
  components
}

const theme = createTheme(themePreset)

// Extend Theme interface to add sx as alias for unstable_sx
declare module '@mui/material/styles' {
  interface Theme {
    sx: Theme['unstable_sx']
  }
}

// Add sx as an alias for unstable_sx
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(theme as any).sx = theme.unstable_sx.bind(theme)

export default theme

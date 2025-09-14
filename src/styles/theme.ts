'use client'

import breakpoints from '@configs/theme/breakpoints'
import components from '@configs/theme/components'
import mixins from '@configs/theme/mixins'
import palette from '@configs/theme/palette'
import shadows from '@configs/theme/shadows'
import typography from '@configs/theme/typography'

import { createTheme } from '@mui/material/styles'

// final custom theme with components and overrides
const theme = createTheme({
  spacing: 8,
  breakpoints,
  palette,
  mixins,
  shadows,
  typography,
  components
})

export default theme

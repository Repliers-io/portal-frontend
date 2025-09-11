import { darken, lighten } from '@mui/material'

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

const palette = {
  common: {
    black,
    white
  },

  background: {
    default: background,
    paper: white
  },

  text: {
    primary: dark,
    secondary: medium,
    disabled,
    hint
  },

  divider,

  primary: {
    main: primary,
    light: lighten(primary, 0.5),
    dark: darken(primary, 0.2),
    contrastText: white
  },

  secondary: {
    main: secondary,
    light: lighten(secondary, 0.5),
    dark: darken(secondary, 0.2),
    contrastText: white
  },

  success: {
    main: success,
    light: lighten(success, 0.5),
    dark: darken(success, 0.2),
    contrastText: white
  },

  error: {
    main: error,
    light: lighten(error, 0.5),
    dark: darken(error, 0.2),
    contrastText: white
  },

  warning: {
    main: warning,
    light: lighten(warning, 0.5),
    dark: darken(warning, 0.2),
    contrastText: white
  },

  info: {
    main: info,
    light: lighten(info, 0.5),
    dark: darken(info, 0.2),
    contrastText: white
  }
}

export default palette

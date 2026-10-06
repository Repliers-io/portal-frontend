import React from 'react'

import { FormHelperText, Stack, type SxProps, type Theme } from '@mui/material'

import Asterisk from './Asterisk'
import SelectLabel from './SelectLabel'

type FieldShellProps = {
  label: string
  required?: boolean
  error?: string
  sx?: SxProps<Theme>
  children: React.ReactNode
}

// Shared top-label field wrapper: label (+ optional asterisk) above the control,
// error below. Visual styling of the control itself comes from the theme; `sx`
// is layout-only (e.g. flex for side-by-side fields).
export const FieldShell = ({
  label,
  required = true,
  error,
  sx,
  children
}: FieldShellProps) => (
  <Stack direction="column" sx={sx}>
    <SelectLabel variant="caption" sx={{ color: 'text.hint', fontWeight: 300 }}>
      {label}
      {required && <Asterisk fontWeight="300" variant="inherit" />}
    </SelectLabel>
    {children}
    {error && (
      <FormHelperText error sx={{ mt: 0.5 }}>
        {error}
      </FormHelperText>
    )}
  </Stack>
)

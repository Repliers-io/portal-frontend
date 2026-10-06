'use client'

import { useMemo } from 'react'

import { useMediaQuery, useTheme } from '@mui/material'

import useClientSide from './useClientSide'

export const breakpointsOrder = ['xs', 'sm', 'md', 'lg', 'xl'] as const
export type BreakpointKeys = (typeof breakpointsOrder)[number]

const useBreakpoints = () => {
  const theme = useTheme()

  const breakpoints = {
    xs: useClientSide(),
    sm: useMediaQuery(theme.breakpoints.up('sm')),
    md: useMediaQuery(theme.breakpoints.up('md')),
    lg: useMediaQuery(theme.breakpoints.up('lg')),
    xl: useMediaQuery(theme.breakpoints.up('xl'))
  }

  const values = useMemo(
    () =>
      Object.fromEntries(
        breakpointsOrder.map((key) => [key, theme.breakpoints.values[key]])
      ) as Record<BreakpointKeys, number>,
    [theme.breakpoints]
  )

  return {
    // states
    ...breakpoints,
    // theme breakpoint values,
    values,
    // aliases
    mobile: breakpoints.xs && !breakpoints.sm,
    tablet: breakpoints.sm && !breakpoints.md,
    desktop: breakpoints.md,
    wideScreen: breakpoints.lg
  }
}

export default useBreakpoints

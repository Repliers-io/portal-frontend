import useBreakpoints, {
  type BreakpointKeys,
  breakpointsOrder
} from './useBreakpoints'

export const useBreakpoint = () => {
  const breakpoints = useBreakpoints()
  return breakpointsOrder.findLast((bp) => breakpoints[bp])
}

const useResponsiveValue = <T>(
  values: Partial<Record<BreakpointKeys, T>>
): T | undefined => {
  const breakpoint = useBreakpoint()
  if (breakpoint) {
    const index = breakpointsOrder.indexOf(breakpoint)
    for (let i = index; i >= 0; i--) {
      const currentValue = values[breakpointsOrder[i]]
      if (currentValue !== undefined) {
        return currentValue
      }
    }
  }
  return undefined
}

export default useResponsiveValue

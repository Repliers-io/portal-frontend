import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { Box, Skeleton, Stack } from '@mui/material'

import { useEstimate } from 'providers/EstimateProvider'
import { useUser } from 'providers/UserProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

import { StepsTabList } from './components'

const StepsTabBar = () => {
  const { agentRole } = useUser()
  const clientSide = useClientSide()
  const { desktop } = useBreakpoints()
  const { preloading, step, estimateId, editing } = useEstimate()

  const scrollRef = useRef<HTMLDivElement>(null)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)
  const [containerHeight, setContainerHeight] = useState(0)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return

    const { scrollTop, scrollHeight, clientHeight } = el
    setShowTopFade(scrollTop > 0)
    setShowBottomFade(scrollTop + clientHeight < scrollHeight)
  }

  const gradientStyles = useMemo(() => {
    const styles = {
      content: '""',
      left: 0,
      right: 0,
      height: 24,
      zIndex: 10000,
      position: 'absolute',
      pointerEvents: 'none',
      transition: 'opacity 0.3s'
    }

    return {
      topFade: {
        ...styles,
        top: 0,
        opacity: showTopFade ? 1 : 0,
        background: 'linear-gradient(to bottom, #F7F7F7, transparent)'
      },
      bottomFade: {
        ...styles,
        bottom: 0,
        opacity: showBottomFade ? 1 : 0,
        background: 'linear-gradient(to top, #F7F7F7, transparent)'
      }
    }
  }, [showTopFade, showBottomFade])

  const scrollToStep = (step: number, behavior: ScrollBehavior = 'smooth') => {
    const activeTab = document.getElementById(`estimate-step-${step}`)
    const container = scrollRef.current

    if (!activeTab || !container) return

    const tabRect = activeTab.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    let top = 0
    if (!desktop) {
      const index = step - (agentRole ? 0 : 1)
      top = (tabRect.height + 16) * index
    } else {
      const tabMiddle = tabRect.height / 2
      const containerMiddle = containerRect.height / 2
      const tabRelativePos = tabRect.top - containerRect.top
      top = tabRelativePos - containerMiddle + tabMiddle + container.scrollTop
    }

    container.scrollTo({ top, behavior })
  }

  // Check scroll position after ref is assigned
  useEffect(() => {
    scrollToStep(step, 'instant')
    handleScroll()
  }, [scrollRef.current])

  // Scroll to active step when step changes
  useEffect(() => {
    if (!clientSide) return
    scrollToStep(step)
  }, [step])

  // measure container height after it's rendered
  useLayoutEffect(() => {
    if (scrollRef.current) {
      setContainerHeight(scrollRef.current.clientHeight)
    }
  }, [clientSide])

  if (!clientSide || (preloading && (!agentRole || estimateId))) {
    const skeletons = editing ? 3 : 4 // skip address step
    return (
      <Stack spacing={2}>
        {Array.from({ length: skeletons }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={74} />
        ))}
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        ...(desktop && {
          '&::before': gradientStyles.topFade,
          '&::after': gradientStyles.bottomFade
        })
      }}
    >
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: desktop ? 'none' : 'thin'
        }}
      >
        <Stack
          spacing={2}
          sx={{
            '& .MuiAccordion-root': {
              margin: '0 !important'
            },
            '& .MuiAccordion-root:before': {
              display: 'none'
            }
          }}
        >
          <StepsTabList height={containerHeight} />
        </Stack>
      </Box>
    </Box>
  )
}

export default StepsTabBar

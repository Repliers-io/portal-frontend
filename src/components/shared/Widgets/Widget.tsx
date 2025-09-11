import React, { useEffect, useState } from 'react'

import { Box, Paper, Stack } from '@mui/material'

import useIntersectionObserver from 'hooks/useIntersectionObserver'

import WidgetSkeleton from './WidgetSkeleton'
import WidgetTitle from './WidgetTitle'

export type WidgetProps = {
  title?: string | React.ReactNode
  icon?: string
  index?: number
  loading?: boolean
  onVisible?: () => void
  children?: React.ReactNode
}

const Widget = ({
  title = '',
  icon,
  index = -1,
  loading = true,
  onVisible = () => false,
  children,
  ...props
}: WidgetProps) => {
  const [visible, ref] = useIntersectionObserver(0.2)
  const [opacity, setOpacity] = useState(0)
  const transitionDelay = `${index * 0.1}s`

  useEffect(() => {
    if (visible && !loading && index !== -1) {
      setOpacity(visible ? 1 : 0)
      onVisible()
    }
  }, [visible, loading])

  return (
    <Paper ref={ref} sx={{ height: '100%', overflow: 'hidden' }} {...props}>
      {loading ? (
        <WidgetSkeleton />
      ) : (
        <Stack height="100%" direction="column">
          {(icon || title) && <WidgetTitle title={title} icon={icon} />}
          <Box p={3} bgcolor="common.white" flexGrow="1" display="flex">
            <Box
              flexGrow="1"
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={
                index !== -1
                  ? {
                      opacity,
                      transition: 'opacity 0.2s ease',
                      transitionDelay
                    }
                  : {}
              }
            >
              {children}
            </Box>
          </Box>
        </Stack>
      )}
    </Paper>
  )
}

export default Widget

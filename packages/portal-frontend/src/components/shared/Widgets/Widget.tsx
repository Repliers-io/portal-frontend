import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Paper, Stack, Typography } from '@mui/material'

import useIntersectionObserver from 'hooks/useIntersectionObserver'

import { WidgetContent, WidgetSkeleton, WidgetTitle } from './components'

export type WidgetProps = {
  title?: string | React.ReactNode
  icon?: string
  index?: number
  loading?: boolean
  error?: boolean
  onVisible?: () => void
  children?: React.ReactNode
}

export const Widget = ({
  title = '',
  icon,
  index = -1,
  loading = true,
  error = false,
  onVisible = () => false,
  children,
  ...props
}: WidgetProps) => {
  const [visible, ref] = useIntersectionObserver(0.2)
  const [contentVisible, setContentVisible] = useState(false)
  const t = useTranslations('Widgets')

  useEffect(() => {
    if (visible && !loading && index !== -1) {
      setContentVisible(visible)
      onVisible()
    }
  }, [visible, loading])

  return (
    <Paper
      ref={ref}
      sx={{ height: '100%', overflow: 'hidden', bgcolor: 'background.paper' }}
      {...props}
    >
      {loading ? (
        <WidgetSkeleton />
      ) : (
        <Stack height="100%" direction="column">
          {(icon || title) && <WidgetTitle title={title} icon={icon} />}
          <WidgetContent index={index} visible={contentVisible}>
            {error ? (
              <Typography variant="h6">{t('noData')}</Typography>
            ) : (
              children
            )}
          </WidgetContent>
        </Stack>
      )}
    </Paper>
  )
}

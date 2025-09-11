import React from 'react'
import { useTranslations } from 'next-intl'

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { Divider, Stack, Tooltip, Typography } from '@mui/material'

import MetricsCardContainer from './WidgetsCardContainer'

type WidgetsCardData = {
  values: (number | string)[]
  labels: string[]
}

type WidgetsCardProps = {
  data?: WidgetsCardData
  name: string
  title?: string
  tooltip?: string
  loading?: boolean
  multiValue?: boolean
}

const WidgetsCard: React.FC<WidgetsCardProps> = ({
  data,
  name,
  title,
  tooltip,
  loading = false,
  multiValue = false
}) => {
  const { values, labels } = data || {
    values: [],
    labels: []
  }

  const t = useTranslations('Statistics')
  return (
    <MetricsCardContainer loading={loading}>
      {/* Top */}
      <Stack direction="column" gap={1} alignItems="center">
        <Stack direction="row" gap={1} width="100%" alignItems="center">
          {title && <Typography variant="body1">{title}</Typography>}
          {tooltip && (
            <Tooltip
              title={tooltip}
              placement="top"
              enterTouchDelay={0}
              leaveTouchDelay={3000}
              arrow
            >
              <ErrorOutlineIcon
                sx={{
                  fontSize: 18,
                  m: -0.5,
                  p: 0.5,
                  cursor: 'pointer',
                  borderRadius: '50%',
                  '&:hover': { opacity: 0.7 }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* Body */}
      {multiValue ? (
        <Stack
          direction="row"
          justifyContent="space-between"
          divider={
            <Divider
              flexItem
              orientation="vertical"
              sx={{ height: 32, alignSelf: 'top' }}
            />
          }
        >
          {values?.map((value, index) => (
            <Stack key={index} spacing={0.5} alignItems="center">
              <Typography variant="h2" lineHeight={1.2}>
                {value}
              </Typography>
              <Typography variant="body2" lineHeight={1} color="text.secondary">
                {labels[index]}
              </Typography>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Stack spacing={0.5}>
          <Typography variant="h2" lineHeight={1.2}>
            {t(`${name}Value`, { value: values[0] })}
          </Typography>
          <Typography variant="body2" lineHeight={1} color="text.secondary">
            {t(`${name}Month`, { month: labels[0] })}
          </Typography>
        </Stack>
      )}
    </MetricsCardContainer>
  )
}

export default WidgetsCard

import type React from 'react'

import { Box, Button, Stack, Tooltip, Typography } from '@mui/material'

import { type PropertyInsightFeature } from 'services/API'
import { type GalleryDialogProps, useDialog } from 'providers/DialogProvider'
import { useProperty } from 'providers/PropertyProvider'

const QualityBar = ({
  label,
  quality,
  quantity,
  groupKey,
  color = 'info.light',
  emptyColor = 'grey.400'
}: {
  label: string
  quality?: string | null
  quantity?: number | null
  groupKey?: PropertyInsightFeature
  color?: string
  emptyColor?: string
}) => {
  const { showDialog } = useDialog<GalleryDialogProps>('gallery')
  const { property } = useProperty()
  const { images } = property

  const handleGroupClick = () => {
    showDialog({ images, active: 0, tab: 'groups', group: groupKey })
  }

  return (
    <Tooltip
      arrow
      placement="top"
      title={`★ ${quantity?.toFixed(2) || 0} / ${quality} `}
    >
      <Button
        variant="text"
        color="inherit"
        onClick={handleGroupClick}
        sx={{ m: -1, p: 1 }}
      >
        <Stack direction="column" alignItems="flex-start">
          <Typography variant="body2" noWrap>
            {label}
          </Typography>
          <Stack
            direction="row"
            spacing="2px"
            sx={{
              height: '5px',
              width: '95px',
              borderRadius: '2px',
              position: 'relative',
              overflow: 'hidden',
              mt: 1,
              mb: 0.5
            }}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  bgcolor: index + 1 < (quantity || 0) ? color : emptyColor,
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Button>
    </Tooltip>
  )
}

export default QualityBar

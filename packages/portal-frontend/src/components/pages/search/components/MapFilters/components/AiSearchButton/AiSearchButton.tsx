import React from 'react'
import { useTranslations } from 'next-intl'

import { Badge, Box, Button, Skeleton, Stack } from '@mui/material'

import { secondary } from '@configs/colors'
import { AiIcon } from '@configs/icons'

import { useAiSearch } from 'providers/AiSearchProvider'
import { useDialog } from 'providers/DialogProvider'
import useClientSide from 'hooks/useClientSide'

import { FeatureChip, ImageChip } from '.'

export const AiSearchButton = ({ size }: { size: 'medium' | 'small' }) => {
  const t = useTranslations()
  const clientSide = useClientSide()
  const { showDialog } = useDialog('ai')
  const { images, features, removeItem } = useAiSearch()
  const showChip = images.length || features.length
  const showImage = images.length > 0 && !features.length

  const totalCount = images.length + features.length
  const hasMore = totalCount > 1

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: { xs: 42, sm: 155 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )
  }

  if (size === 'small') {
    return (
      <Button
        size="small"
        color="secondary"
        variant="outlined"
        onClick={showDialog}
        sx={{
          minWidth: 32,
          px: { xs: 1.25, sm: 1.5 },
          display: { xs: 'block', sm: 'none' }
        }}
      >
        <AiIcon color={secondary} />
      </Button>
    )
  }
  return (
    <Badge
      color="secondary"
      badgeContent={hasMore ? `+${totalCount - 1}` : null}
      sx={{
        '& .MuiBadge-badge': { right: 4, top: 2, fontSize: 12 }
      }}
    >
      <Button
        size="medium"
        component="div"
        color="secondary"
        variant="outlined"
        onClick={showDialog}
        sx={{ minWidth: { xs: 46, sm: 155 }, px: 2 }}
        startIcon={<AiIcon />}
      >
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          sx={{
            maxWidth: 306,
            overflow: 'hidden',
            mr: showImage ? -1.25 : showChip ? -1 : 0
          }}
        >
          <Box sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            {t('MapFilters.aiSearch')}
          </Box>
          {features.length > 0 && (
            <FeatureChip
              key={features[0]}
              label={features[0]}
              onDelete={() => removeItem(features[0], 'text')}
            />
          )}
          {showImage && (
            <ImageChip
              image={images[0]}
              onDelete={() => removeItem(images[0], 'image')}
            />
          )}
        </Stack>
      </Button>
    </Badge>
  )
}

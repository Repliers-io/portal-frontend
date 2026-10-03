'use client'

import { useTranslations } from 'next-intl'

import { Box, Button, Stack, Typography } from '@mui/material'

import { WindowOutlinedIcon } from '@configs/icons'
import { ListingsCounter } from '@shared/Filters'

import { singleColumnQuery } from '../constants'
import { type ChatCarouselData } from '../types'

type ChatCarouselTitleProps = {
  carousel?: ChatCarouselData
  onOpenGrid?: () => void
}

export const ChatCarouselTitle = ({
  carousel,
  onOpenGrid
}: ChatCarouselTitleProps) => {
  const t = useTranslations('AiChat')

  if (!carousel) return null

  return (
    <Stack
      spacing={1}
      useFlexGap
      direction="row"
      alignItems="center"
      flexWrap="wrap"
    >
      <ListingsCounter filters={carousel.filters} count={carousel.count} />

      {carousel.count > carousel.listings.length && (
        <Typography
          variant="body2"
          component="span"
          color="text.hint"
          sx={{ mb: -0.25 }}
        >
          ({carousel.listings.length} shown)
        </Typography>
      )}

      <Box
        sx={{
          flex: 1,
          textAlign: 'right',
          // one column wide, Open grid starts the second row on the left
          [singleColumnQuery]: { flexBasis: '100%', display: 'flex' }
        }}
      >
        <Button
          size="small"
          variant="text"
          onClick={onOpenGrid}
          endIcon={<WindowOutlinedIcon fontSize="small" />}
          // starting its row, the label (not the padding) lines up with the counter
          sx={{ [singleColumnQuery]: { ml: -2 } }}
        >
          {t('openGrid')}
        </Button>
      </Box>
    </Stack>
  )
}

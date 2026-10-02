import { useTranslations } from 'next-intl'

import { Button, Stack } from '@mui/material'

import { SmartDisplayOutlinedIcon } from '@configs/icons'
import listingsConfig from '@configs/listings'

const { thumbWidth, thumbHeight } = listingsConfig.gallery

export const SlideshowButton = ({ onClick }: { onClick: () => void }) => {
  const t = useTranslations('HeroGallery')

  return (
    <Button
      color="primary"
      variant="contained"
      disableFocusRipple
      onClick={onClick}
      sx={{
        display: 'flex',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.light',
        width: thumbWidth,
        height: thumbHeight
      }}
    >
      <Stack
        spacing={1}
        alignItems="center"
        sx={{ position: 'relative', zIndex: 2 }}
      >
        <SmartDisplayOutlinedIcon sx={{ fontSize: 48 }} />
        {t('startSlideshow')}
      </Stack>
    </Button>
  )
}

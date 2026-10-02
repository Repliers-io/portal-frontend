import { useTranslations } from 'next-intl'

import { IconButton, Stack, Typography } from '@mui/material'

import { PhotoLibraryIcon } from '@configs/icons'

import type { HistoryItemType } from 'services/API'
import { useListing } from 'providers/ListingProvider'
import { getCDNPath } from 'utils/urls'

import { getHistoryItemLink } from '../utils'

export const HistoryItemPhoto = ({
  item,
  active = false
}: {
  item: HistoryItemType
  active?: boolean
}) => {
  const t = useTranslations()
  const { mlsNumber, images } = item

  const { listing } = useListing()
  const link = getHistoryItemLink(listing, item, active)

  const imgSrc = getCDNPath(images?.[0] ?? '', 'small')

  return (
    <Stack
      spacing={{ xs: 1, sm: 2, lg: 4 }}
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-end', sm: 'center' }}
    >
      <Typography
        variant="body2"
        color="text.hint"
        textAlign="right"
        maxWidth="100px"
      >
        {t('PDP.mlsNumberLabel')} {mlsNumber}
      </Typography>

      <IconButton
        sx={{
          width: '80px',
          height: '50px',
          borderRadius: 2,
          bgcolor: 'divider',
          color: 'common.white',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: `url(${imgSrc})`,
          ...(!link ? { cursor: 'default' } : {})
        }}
        {...(link
          ? {
              href: link,
              component: 'a',
              target: '_blank'
            }
          : {})}
      >
        <PhotoLibraryIcon />
      </IconButton>
    </Stack>
  )
}

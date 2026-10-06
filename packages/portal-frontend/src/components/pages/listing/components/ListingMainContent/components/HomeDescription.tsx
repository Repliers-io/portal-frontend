import { useTranslations } from 'next-intl'
import type React from 'react'

import { Stack, Typography } from '@mui/material'

import listingsConfig from '@configs/listings'

import { ScrubbedText } from 'components/atoms'

import { useListing } from 'providers/ListingProvider'
import { formatMultiLineText, scrubbed } from 'utils/listings'

export const HomeDescription = () => {
  const t = useTranslations()
  const {
    listing: {
      details: { description }
    }
  } = useListing()

  // WARN: multiline formatter returns non-empty string for any type of input
  const formattedDescription = formatMultiLineText(description || '')

  return (
    <Stack spacing={3} id="description" sx={{ mt: '-33px', pt: 4 }}>
      <Typography variant="h4">{t('PDP.sections.description.name')}</Typography>
      <Typography
        component="div"
        sx={{
          my: -2,
          overflow: 'hidden',
          color: 'text.secondary'
        }}
      >
        {scrubbed(description) ? (
          <p>
            <ScrubbedText replace={listingsConfig.scrubbed.descriptionLabel} />
          </p>
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: formattedDescription
            }}
          />
        )}
      </Typography>
    </Stack>
  )
}

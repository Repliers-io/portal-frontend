'use client'

import { useTranslations } from 'next-intl'

import { Box, Button, Stack } from '@mui/material'
import Grid from '@mui/material/Grid'

import {
  FormField,
  FormRequirements,
  RequiredAnyHint,
  useContactForm
} from '@shared/Forms'

import { useListing } from 'providers/ListingProvider'
import { formatPhoneNumberAsYouType } from 'utils/formatters'
import { formatFullAddress } from 'utils/listings'

import { AgreementText } from '.'

export const RequestInfoForm = () => {
  const t = useTranslations('Forms')
  const {
    listing: { address, mlsNumber }
  } = useListing()
  const message = `${t('contactMessagePrefix')} ${formatFullAddress(address)}`

  const { control, handleSubmit, isSubmitting, requirements } = useContactForm({
    message,
    mlsNumber,
    form: 'requestInfo'
  })

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
      <FormRequirements requirements={requirements}>
        <Stack spacing={2}>
          <Grid container columns={2} spacing={2}>
            <Grid size={2}>
              <FormField
                name="name"
                control={control}
                label={t('nameLabel')}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 2, sm: 1, md: 2 }}>
              <FormField
                name="email"
                control={control}
                type="email"
                label={t('emailLabel')}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 2, sm: 1, md: 2 }}>
              <FormField
                name="phone"
                control={control}
                type="tel"
                formatter={formatPhoneNumberAsYouType}
                label={t('phoneLabel')}
                placeholder={t('phonePlaceholder')}
                fullWidth
              />
            </Grid>
            {/* without its hint the cell would still take a row gap between Phone and Message */}
            <Grid size={2} sx={{ '&:empty': { display: 'none' } }}>
              <RequiredAnyHint control={control} />
            </Grid>
            <Grid size={2}>
              <FormField
                name="message"
                control={control}
                label={t('messageLabel')}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            size="large"
            loading={isSubmitting}
            variant="contained"
          >
            {t('requestInfoButton')}
          </Button>

          <AgreementText />
        </Stack>
      </FormRequirements>
    </Box>
  )
}

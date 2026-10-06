'use client'

import { useTranslations } from 'next-intl'

import { Box, Button, Stack } from '@mui/material'
import Grid from '@mui/material/Grid'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import i18nConfig from '@configs/i18n'
import { CardPaper } from '@shared/Containers'
import { FormField, FormRequirements, RequiredAnyHint } from '@shared/Forms'
import { DateField, useScheduleForm } from '@shared/Forms/ScheduleForm'

import { APIContact } from 'services/API'
import { useEstimate } from 'providers/EstimateProvider'
import { formatPhoneNumberAsYouType } from 'utils/formatters'
import { sanitizePhoneNumber } from 'utils/listings/sanitizers'

import Profile from './Profile'

const ScheduleMeeting = () => {
  const t = useTranslations('Forms')
  const { estimateData } = useEstimate()
  const { estimateId } = estimateData || {}

  const { control, handleSubmit, isSubmitting, requirements } = useScheduleForm(
    {
      form: 'meeting',
      send: ({ name, email, phone, date, time }) =>
        APIContact.meetingRequest({
          name,
          email,
          estimateId: estimateId as number,
          phone: sanitizePhoneNumber(phone),
          date: date ? date.format(i18nConfig.dateFormat) : '',
          time: time ? time.format(i18nConfig.timeFormat) : ''
        })
    }
  )

  return (
    <CardPaper sx={{ p: 3 }}>
      <Stack width="100%" direction="column" spacing={2}>
        <Profile />
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FormRequirements requirements={requirements}>
              <Stack spacing={2}>
                <Grid container columns={2} spacing={2}>
                  <Grid size={{ xs: 2, sm: 1, md: 2 }}>
                    <DateField
                      name="date"
                      control={control}
                      label={t('dateLabel')}
                    />
                  </Grid>
                  <Grid size={{ xs: 2, sm: 1, md: 2 }}>
                    <DateField
                      name="time"
                      control={control}
                      label={t('timeLabel')}
                    />
                  </Grid>
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
                  {/* without its hint the cell would still take a row gap under Phone */}
                  <Grid size={2} sx={{ '&:empty': { display: 'none' } }}>
                    <RequiredAnyHint control={control} />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  loading={isSubmitting}
                  variant="contained"
                >
                  {t('scheduleMeetingButton')}
                </Button>
              </Stack>
            </FormRequirements>
          </LocalizationProvider>
        </Box>
      </Stack>
    </CardPaper>
  )
}

export default ScheduleMeeting

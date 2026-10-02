'use client'

import { useReducer, useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import i18nConfig from '@configs/i18n'
import listingsConfig from '@configs/listings'
import { FormField, FormRequirements, RequiredAnyHint } from '@shared/Forms'
import { DateField, useScheduleForm } from '@shared/Forms/ScheduleForm'

import { APIContact, type ContactScheduleMethod } from 'services/API'
import { useListing } from 'providers/ListingProvider'
import { formatPhoneNumberAsYouType } from 'utils/formatters'
import { sanitizePhoneNumber } from 'utils/listings/sanitizers'

import { useTourSteps } from './useTourSteps'
import { AgreementText, TourMethodSelector } from '.'

export const TourHomeForm = () => {
  const t = useTranslations('Forms')
  const {
    listing: { mlsNumber }
  } = useListing()
  const [method, setMethod] = useState<ContactScheduleMethod>('InPerson')
  const [askFinancing, toggleFinancing] = useReducer((value) => !value, false)

  const { control, handleSubmit, isSubmitting, requirements, trigger } =
    useScheduleForm({
      form: 'tour',
      send: ({ name, email, phone, date, time }) =>
        APIContact.homeTourRequest({
          name,
          email,
          method,
          mlsNumber,
          phone: sanitizePhoneNumber(phone),
          date: date ? date.format(i18nConfig.dateFormat) : '',
          time: time ? time.format(i18nConfig.timeFormat) : '',
          message: askFinancing ? t('financingLabel') : undefined
        })
    })
  const { step, next, change } = useTourSteps(trigger)
  const { tourSteps } = listingsConfig.components
  // with the steps off, both halves render at once
  const schedule = !tourSteps || step === 1
  const contact = !tourSteps || step === 2

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FormRequirements requirements={requirements}>
          <Stack spacing={2}>
            {schedule && (
              <TourMethodSelector value={method} onChange={setMethod} />
            )}

            <Grid container columns={2} spacing={2}>
              {schedule && (
                <>
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
                </>
              )}
              {contact && (
                <>
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
                  {/* without its hint the cell would still take a row gap above the checkbox */}
                  <Grid size={2} sx={{ '&:empty': { display: 'none' } }}>
                    <RequiredAnyHint control={control} />
                  </Grid>
                  <Grid size={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={askFinancing}
                          onClick={toggleFinancing}
                          // the label's own -11px already pulls the box's padding out;
                          // the theme's `edge="start"` would pull it 12px past the fields
                          sx={{ ml: 0 }}
                        />
                      }
                      label={
                        <Typography variant="body2" noWrap>
                          {t('financingLabel')}
                        </Typography>
                      }
                    />
                  </Grid>
                </>
              )}
            </Grid>

            {contact && (
              <Button
                type="submit"
                fullWidth
                size="large"
                loading={isSubmitting}
                variant="contained"
              >
                {t('requestTourButton')}
              </Button>
            )}
            {tourSteps &&
              (step === 1 ? (
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={next}
                >
                  {t('nextButton')}
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  onClick={change}
                >
                  {t('changeButton')}
                </Button>
              ))}

            {contact && <AgreementText />}
          </Stack>
        </FormRequirements>
      </LocalizationProvider>
    </Box>
  )
}

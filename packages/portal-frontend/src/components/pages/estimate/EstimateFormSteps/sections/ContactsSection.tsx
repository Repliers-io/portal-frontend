import React from 'react'
import { useTranslations } from 'next-intl'
import { Controller, useFormContext } from 'react-hook-form'

import { TextField } from '@mui/material'
import Grid from '@mui/material/Grid' // Grid version 2

import { type FormValues } from '@configs/estimate'

import { Asterisk, SelectLabel } from 'components/atoms'

import { useUser } from 'providers/UserProvider'
import { formatPhoneNumberAsYouType } from 'utils/formatters'

import { EstimateInput, GridSection, GridTitle } from '../components'
import { useFormField } from '../hooks'

export const ContactsSection = () => {
  const t = useTranslations('Estimates')
  const { agentRole } = useUser()
  const {
    control,
    formState: { errors }
  } = useFormContext<FormValues>()

  const clientName = agentRole ? 'client' : 'you'
  const regulationsLabel = t('regulations')

  return (
    <GridSection>
      <GridTitle>{t('form.contacts.title', { name: clientName })}</GridTitle>
      {regulationsLabel && (
        <Grid size={12}>
          <SelectLabel sx={{ width: '100%', whiteSpace: 'wrap' }}>
            {regulationsLabel}
          </SelectLabel>
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <EstimateInput
          type="text"
          label={
            <>
              {t('form.contacts.firstName')} <Asterisk />
            </>
          }
          autoComplete="given-name"
          {...useFormField('contact.fname')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <EstimateInput
          type="text"
          label={
            <>
              {t('form.contacts.lastName')} <Asterisk />
            </>
          }
          autoComplete="family-name"
          {...useFormField('contact.lname')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <EstimateInput
          type="text"
          label={
            <>
              {t('form.contacts.email')} <Asterisk />
            </>
          }
          autoComplete="email"
          {...useFormField('contact.email')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SelectLabel>{t('form.contacts.phone')}</SelectLabel>
        <Controller
          name="contact.phone"
          control={control}
          render={({ field }) => (
            <TextField
              fullWidth
              {...field}
              autoComplete="tel"
              error={Boolean(errors.contact?.phone)}
              helperText={errors.contact?.phone?.message}
              onChange={(e) => {
                field.onChange(
                  formatPhoneNumberAsYouType(e.target.value, field.value)
                )
              }}
            />
          )}
        />
      </Grid>
    </GridSection>
  )
}

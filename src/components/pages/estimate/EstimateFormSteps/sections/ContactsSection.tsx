import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { TextField } from '@mui/material'
import Grid from '@mui/material/Grid2' // Grid version 2

import content from '@configs/content'
import { type FormValues } from '@configs/estimate'

import { Asterisk, SelectLabel } from 'components/atoms'

import { useUser } from 'providers/UserProvider'
import { formatPhoneNumberAsYouType } from 'utils/formatters'

import { EstimateInput, GridSection, GridTitle } from '../components'
import { useFormField } from '../hooks'

const { estimateBoardRegulations } = content

const ContactsSection = () => {
  const { agentRole } = useUser()
  const {
    control,
    formState: { errors }
  } = useFormContext<FormValues>()

  const clientName = agentRole ? 'client' : 'you'

  return (
    <GridSection>
      <GridTitle>What is the best way to contact {clientName}?</GridTitle>
      {estimateBoardRegulations && (
        <SelectLabel sx={{ whiteSpace: 'wrap' }}>
          {estimateBoardRegulations}
        </SelectLabel>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <EstimateInput
          type="text"
          label={
            <>
              First Name <Asterisk />
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
              Last Name <Asterisk />
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
              Email <Asterisk />
            </>
          }
          autoComplete="email"
          {...useFormField('contact.email')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SelectLabel>Phone</SelectLabel>
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

export default ContactsSection

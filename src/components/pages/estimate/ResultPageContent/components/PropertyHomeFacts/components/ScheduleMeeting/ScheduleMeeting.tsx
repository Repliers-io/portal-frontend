'use client'

import React, { useState } from 'react'
import dayjs from 'dayjs'

import { Button, Paper, Stack, TextField } from '@mui/material'
import Grid from '@mui/material/Grid2'
import {
  DatePicker,
  LocalizationProvider,
  TimePicker
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import i18nConfig from '@configs/i18n'

import { APIContact, type ErrorCause } from 'services/API'
import { useEstimate } from 'providers/EstimateProvider'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'
import { formatPhoneNumberAsYouType } from 'utils/formatters'
import { sanitizePhoneNumber } from 'utils/properties/sanitizers'
import { joinNonEmpty } from 'utils/strings'
import { validateEmail, validatePhone } from 'utils/validators'

import Profile from './Profile'

const getFormData = (form: any) => {
  const { phone, email, fname, lname } = form
  return {
    name: joinNonEmpty([fname, lname], ' '),
    email: email || '',
    phone: sanitizePhoneNumber(phone),
    date: dayjs().add(1, 'day'),
    time: dayjs().hour(12).minute(0)
  }
}

const ScheduleMeeting = () => {
  const { profile } = useUser()
  const { showSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [formTouched, setFormTouched] = useState(false)
  const [values, setValues] = useState(getFormData(profile))

  const { estimateData } = useEstimate()
  const { estimateId } = estimateData || {}

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumberAsYouType(e.target.value, values.phone)

    setValues({ ...values, phone: formatted })
  }

  const validName = values.name && values.name.length <= 70
  const validPhone = validatePhone(values.phone)
  const validEmail = validateEmail(values.email)

  const formValid =
    validName && validPhone && validEmail && values.date && values.time

  const handleSubmit = () => {
    setFormTouched(true)

    if (!formValid) return

    setLoading(true)

    const { name, email, date, time, phone } = values

    APIContact.meetingRequest({
      name,
      email,
      estimateId: estimateId as number,
      phone: sanitizePhoneNumber(phone),
      date: date.format(i18nConfig.dateFormat),
      time: time.format(i18nConfig.timeFormat)
    })
      .then(() => {
        showSnackbar('Message has been sent', 'success')
      })
      .catch((e) => showSnackbar((e as ErrorCause)?.cause?.message, 'error'))
      .finally(() => {
        setLoading(false)
        setFormTouched(false)
      })
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack width="100%" direction="column" spacing={2}>
        <Profile />
        <form onSubmit={handleSubmit} autoComplete="off">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={2}>
              <Grid container columns={2} spacing={2}>
                <Grid size={{ xs: 2, sm: 1, md: 2 }}>
                  <DatePicker
                    name="date"
                    label="Date"
                    minDate={dayjs()}
                    value={values.date}
                    onAccept={(e) => {
                      setValues({ ...values, date: dayjs(e) })
                    }}
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid size={{ xs: 2, sm: 1, md: 2 }}>
                  <TimePicker
                    name="time"
                    label="Time"
                    value={values.time}
                    onAccept={(e) => {
                      setValues({ ...values, time: dayjs(e) })
                    }}
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid size={2}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Name"
                    value={values.name}
                    onChange={handleInputChange}
                    error={
                      formTouched && (!values.name || values.name.length > 70)
                    }
                    helperText={
                      formTouched && !values.name
                        ? 'Required field '
                        : values.name.length > 70
                          ? 'Max 70 chars for this field'
                          : ''
                    }
                  />
                </Grid>
                <Grid size={{ xs: 2, sm: 1, md: 2 }}>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    label="Email"
                    value={values.email}
                    onChange={handleInputChange}
                    error={formTouched && !validEmail}
                    helperText={
                      formTouched && !validEmail ? 'Enter valid email' : ''
                    }
                  />
                </Grid>
                <Grid size={{ xs: 2, sm: 1, md: 2 }}>
                  <TextField
                    fullWidth
                    type="tel"
                    name="phone"
                    label="Phone"
                    placeholder="(555) 555-1234"
                    value={values.phone}
                    onChange={handlePhoneChange}
                    error={formTouched && !validPhone}
                    helperText={
                      formTouched && !validPhone ? 'Required field ' : ''
                    }
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth
                size="large"
                loading={loading}
                variant="contained"
                onClick={handleSubmit}
              >
                Schedule a Meeting
              </Button>
            </Stack>
          </LocalizationProvider>
        </form>
      </Stack>
    </Paper>
  )
}

export default ScheduleMeeting

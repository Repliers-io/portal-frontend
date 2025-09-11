'use client'

import React, { useState } from 'react'
import dayjs from 'dayjs'

import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded'
import {
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import {
  DatePicker,
  LocalizationProvider,
  TimePicker
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import { dateFormat, timeFormat } from '@configs/i18n'

import { APIContact, type ContactScheduleMethod } from 'services/API'
import { useProperty } from 'providers/PropertyProvider'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'
import { extractErrorMessage } from 'utils/errors'
import { formatPhoneNumber, formatPhoneNumberAsYouType } from 'utils/formatters'
import { sanitizePhoneNumber } from 'utils/properties/sanitizers'
import { joinNonEmpty } from 'utils/strings'
import { validateEmail, validatePhone } from 'utils/validators'

import AgreementText from './AgreementText'

const getFormData = (form: any) => {
  const { phone, email, fname, lname } = form
  return {
    name: joinNonEmpty([fname, lname], ' '),
    email: email || '',
    phone: formatPhoneNumber(phone),
    date: dayjs().add(1, 'day'),
    time: dayjs().hour(12).minute(0),
    askFinancing: false
  }
}

const TourHomeForm = () => {
  const { profile } = useUser()
  const { showSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [formTouched, setFormTouched] = useState(false)
  const [values, setValues] = useState(getFormData(profile))

  const {
    property: { mlsNumber }
  } = useProperty()

  const [method, setMethod] = useState<ContactScheduleMethod>('InPerson')
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = formatPhoneNumberAsYouType(e.target.value, values.phone)
    setValues({ ...values, phone })
  }

  const handleCheckboxChange = () => {
    setValues({ ...values, askFinancing: !values.askFinancing })
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

    APIContact.homeTourRequest({
      name,
      email,
      method,
      mlsNumber,
      phone: sanitizePhoneNumber(phone),
      date: date.format(dateFormat),
      time: time.format(timeFormat)
    })
      .then(() => {
        showSnackbar('Message has been sent', 'success')
      })
      .catch((e) => {
        showSnackbar(extractErrorMessage(e), 'error')
      })
      .finally(() => {
        setLoading(false)
        setFormTouched(false)
      })
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack spacing={2}>
          <Grid container columns={2} spacing={2}>
            <Grid size={1}>
              <Button
                fullWidth
                size="small"
                sx={{ px: 0 }}
                startIcon={<HomeRoundedIcon fontSize="small" />}
                variant={method === 'InPerson' ? 'contained' : 'outlined'}
                onClick={() => setMethod('InPerson')}
              >
                In person
              </Button>
            </Grid>
            <Grid size={1}>
              <Button
                fullWidth
                size="small"
                sx={{ px: 0 }}
                startIcon={<VideocamRoundedIcon fontSize="small" />}
                variant={method === 'LiveVideo' ? 'contained' : 'outlined'}
                onClick={() => setMethod('LiveVideo')}
              >
                Live video
              </Button>
            </Grid>
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
                error={formTouched && (!values.name || values.name.length > 70)}
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
                helperText={formTouched && !validPhone ? 'Required field ' : ''}
              />
            </Grid>
            <Grid size={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={values.askFinancing}
                    onClick={handleCheckboxChange}
                    sx={{ my: -1 }}
                  />
                }
                label={
                  <Typography variant="body2">
                    I want to talk about financing
                  </Typography>
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
            Request a tour
          </Button>

          <AgreementText />
        </Stack>
      </LocalizationProvider>
    </form>
  )
}

export default TourHomeForm

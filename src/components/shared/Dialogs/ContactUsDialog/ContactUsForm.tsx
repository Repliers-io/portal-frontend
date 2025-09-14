'use client'

import React, { useEffect, useReducer, useState } from 'react'

import {
  Button,
  Container,
  DialogActions,
  DialogContent,
  Grid,
  TextField
} from '@mui/material'

import { APIContact, type ErrorCause } from 'services/API'
import { useUser } from 'providers/UserProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useSnackbar from 'hooks/useSnackbar'
import { formatPhoneNumberAsYouType } from 'utils/formatters'
import { sanitizePhoneNumber } from 'utils/properties/sanitizers'
import { joinNonEmpty } from 'utils/strings'
import { validateEmail, validatePhone } from 'utils/validators'

const ContactUsForm = ({
  mode = 'contactUs',
  mlsNumber,
  onSend
}: {
  mode?: 'contactUs' | 'requestInfo'
  mlsNumber?: string
  onSend?: () => void
}) => {
  const { showSnackbar } = useSnackbar()
  const { mobile } = useBreakpoints()
  const { profile } = useUser()
  const [loading, toggleLoading] = useReducer((value) => !value, false)

  const getFormData = () => {
    return {
      name: joinNonEmpty([profile.fname, profile.lname], ' '),
      email: profile.email || '',
      phone: sanitizePhoneNumber(profile.phone),
      message: ''
    }
  }

  const [values, setValues] = useState(getFormData())
  const [touched, setTouched] = useState(false)

  const phoneValid = validatePhone(values.phone)
  // TODO: use joi to validate form
  const formValid =
    values.name &&
    values.name.length <= 70 &&
    validateEmail(values.email) &&
    phoneValid &&
    values.message.length >= 10 &&
    values.message.length <= 1024

  const addComment = async (values: any) => {
    const { name, email, phone, message } = values
    return await APIContact.addComment({
      name,
      email,
      message,
      phone: sanitizePhoneNumber(phone)
    })
  }

  const requestInfo = async (values: any, mlsNumber: string) => {
    const { name, email, phone, message } = values
    await APIContact.requestInfo({
      name,
      email,
      message,
      mlsNumber,
      phone: sanitizePhoneNumber(phone)
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }

  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = formatPhoneNumberAsYouType(e.target.value, values.phone)
    setValues({ ...values, phone })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!formValid) {
      return
    }
    toggleLoading()

    try {
      if (mode === 'contactUs') {
        await addComment(values)
      } else if (mode === 'requestInfo' && mlsNumber) {
        await requestInfo(values, mlsNumber)
      }
      setValues(getFormData())
      showSnackbar('Message has been sent', 'success')
      setTouched(false)
      onSend?.()
    } catch (e) {
      // @TODO error handling https://trello.com/c/i19202n0/5-fe-error-interceptors-repliers-mapbox-backend
      showSnackbar((e as ErrorCause)?.cause?.message, 'error')
    } finally {
      toggleLoading()
    }
  }

  useEffect(() => {
    setValues(getFormData())
  }, [profile])

  return (
    <>
      <DialogContent>
        <form onSubmit={handleSubmit} autoComplete="off">
          <Container maxWidth="sm" disableGutters sx={{ py: 2 }}>
            <Grid container columns={2} spacing={2}>
              <Grid item xs={2}>
                <TextField
                  name="name"
                  label="Name"
                  placeholder="Enter your name"
                  fullWidth
                  onChange={handleChange}
                  value={values.name}
                  error={touched && (!values.name || values.name.length > 70)}
                  helperText={
                    touched && !values.name
                      ? 'Name is required'
                      : touched && values.name.length > 70
                        ? 'Max field length is 70 chars'
                        : ''
                  }
                />
              </Grid>
              <Grid item xs={2} sm={1}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  fullWidth
                  onChange={handleChange}
                  value={values.email}
                  error={touched && !validateEmail(values.email)}
                  helperText={
                    touched && !validateEmail(values.email)
                      ? 'Enter valid email'
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={2} sm={1}>
                <TextField
                  name="phone"
                  label="Phone"
                  type="tel"
                  placeholder="(555) 555-1234"
                  fullWidth
                  onChange={handleChangePhone}
                  value={values.phone}
                  error={touched && !phoneValid}
                  helperText={
                    touched && !phoneValid ? 'Incorrect phone format' : ''
                  }
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name="message"
                  label="Message"
                  type="text"
                  placeholder="Enter your message"
                  multiline
                  minRows={4}
                  fullWidth
                  value={values.message}
                  onChange={handleChange}
                  error={
                    touched &&
                    (values.message.length < 10 || values.message.length > 1024)
                  }
                  helperText={
                    touched && values.message.length < 10
                      ? 'Message is required and should be more than 10 symbols'
                      : values.message.length > 1024
                        ? 'Message is required and should be more than 1024 symbols'
                        : ''
                  }
                />
              </Grid>
            </Grid>
          </Container>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          size="large"
          fullWidth={mobile}
          loading={loading}
          onClick={handleSubmit}
        >
          Send
        </Button>
      </DialogActions>
    </>
  )
}

export default ContactUsForm

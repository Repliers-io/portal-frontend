import { useState } from 'react'
import type React from 'react'
import { useForm } from 'react-hook-form'

import {
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material'

import content from '@configs/content'

import { APIContact, type ErrorCause } from 'services/API'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'

const unsubscribeOptions = [
  { value: 'Bought a house already', label: 'Bought a house already' },
  { value: 'Not relevant content', label: 'Not relevant content' },
  { value: 'Too many emails', label: 'Too many emails' },
  { value: 'Other', label: 'Other' }
]

type FeedbackFormValues = {
  reason: string
  selectedOption: string
}

const FeedbackForm = ({ onSubmit }: { onSubmit?: () => void }) => {
  const { profile } = useUser()
  const { showSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FeedbackFormValues>({
    defaultValues: {
      selectedOption: '',
      reason: ''
    }
  })

  const onSubmitForm = async (data: FeedbackFormValues) => {
    const { reason, selectedOption } = data

    const message = `Unsubscribe reason: \n${selectedOption} \n${reason} `

    const { fname, lname, email, phone } = profile

    setLoading(true)
    try {
      await APIContact.addComment({
        name: [fname, lname].join(' '),
        email,
        message,
        ...(phone && { phone })
      })
      onSubmit?.()
    } catch (e) {
      showSnackbar((e as ErrorCause)?.cause?.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmitForm)} style={{ width: '100%' }}>
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Typography align="center" pb={4}>
            <b>{profile.email}</b> will no longer receive
            <br />
            <b>{content.siteName}</b> notifications.
          </Typography>
          <Typography variant="h4" width="100%">
            Tell us why you&apos;re leaving
          </Typography>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              {...register('selectedOption')}
              onChange={(e) => setValue('selectedOption', e.target.value)}
            >
              {unsubscribeOptions.map(({ label, value }) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio />}
                  label={label}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Additional comments"
            error={!!errors.reason}
            helperText={errors.reason ? 'Please enter your reason' : ''}
            {...register('reason')}
          />
          <Button
            size="large"
            type="submit"
            variant="contained"
            loading={loading}
            sx={{ width: { xs: '100%', sm: 140 } }}
          >
            Send
          </Button>
        </Stack>
      </form>
    </Container>
  )
}

export default FeedbackForm

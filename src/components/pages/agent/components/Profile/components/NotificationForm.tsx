import { useState } from 'react'
import type React from 'react'
import {
  Controller,
  type ControllerRenderProps,
  type SubmitHandler,
  useForm
} from 'react-hook-form'

import { Checkbox, FormControlLabel, Stack } from '@mui/material'

import { APIAgent, type ApiClient } from 'services/API'
import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import useSnackbar from 'hooks/useSnackbar'
import { toRem } from 'utils/theme'

interface ClientPreferences {
  email: boolean
  sms: boolean
}

type PreferenceNames = keyof ClientPreferences

interface NotificationFormProps {
  client: ApiClient
}

const NotificationForm = ({ client }: NotificationFormProps) => {
  const { preferences, clientId } = client
  const { showSnackbar } = useSnackbar()
  const { signature } = useAgentEstimates()
  const [loading, setLoading] = useState(false)

  const { control, handleSubmit, setValue } = useForm<ClientPreferences>({
    defaultValues: {
      email: preferences.email,
      sms: preferences.sms
    }
  })

  const onSubmit: SubmitHandler<ClientPreferences> = async (
    data: ClientPreferences
  ) => {
    try {
      setLoading(true)
      await APIAgent.updateClient(clientId, { preferences: data }, signature)
      showSnackbar('Client preferences updated', 'success')
    } catch (error) {
      console.error('[NotificationForm]', error)
      showSnackbar('Error updating client preferences', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange =
    (field: ControllerRenderProps<ClientPreferences, PreferenceNames>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.checked
      setValue(field.name, value)
      handleSubmit(onSubmit)()
    }

  const renderNotificationCheckbox = (name: PreferenceNames, label: string) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={field.value}
                color="secondary"
                sx={{
                  color: 'secondary.main'
                }}
                onChange={handleChange(field)}
              />
            }
            label={label}
          />
        )}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack
        direction="column"
        gap={1}
        position="relative"
        sx={{
          '& .MuiCheckbox-root': {
            padding: 0
          },
          '& .MuiFormControlLabel-root': {
            gap: 1,
            m: 0
          },
          '& .MuiTypography-root': {
            fontWeight: 'bold',
            fontSize: toRem(16),
            lineHeight: toRem(24),
            color: 'text.hint'
          }
        }}
      >
        {/* Invisible layer on top of NotificationForm for prevent multiple api call  */}
        {loading && <Stack position="absolute" zIndex={1} sx={{ inset: 0 }} />}
        {renderNotificationCheckbox('email', 'Email Notifications')}
        {renderNotificationCheckbox('sms', 'Text Notifications')}
      </Stack>
    </form>
  )
}

export default NotificationForm

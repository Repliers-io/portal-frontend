'use client'

import { Box, Button, Stack } from '@mui/material'

import { FormRequirements } from '../FormRequirements'
import { LegalText } from '../LegalText'

import { ContactFormFields } from './ContactFormFields'
import { useContactForm, type UseContactFormOptions } from './useContactForm'

type ContactFormProps = UseContactFormOptions & {
  submit?: string
  variant?: 'default' | 'compact'
  labels?: boolean
}

export const ContactForm = ({
  onSend,
  message,
  showMessage = true,
  submit,
  redirectUrl,
  mlsNumber,
  tags,
  variant,
  labels
}: ContactFormProps) => {
  const { control, handleSubmit, isSubmitting, requirements, t } =
    useContactForm({
      onSend,
      message,
      showMessage,
      redirectUrl,
      mlsNumber,
      tags
    })

  return (
    <Box
      sx={{
        '& .MuiInputBase-root': { bgcolor: 'background.paper' }
      }}
      component="form"
      onSubmit={handleSubmit}
      noValidate
    >
      <FormRequirements requirements={requirements}>
        <Stack spacing={2}>
          <ContactFormFields
            control={control}
            showMessage={showMessage}
            labels={labels}
            variant={variant}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            loading={isSubmitting}
          >
            {submit || t('submitButton')}
          </Button>

          <LegalText action={submit} />
        </Stack>
      </FormRequirements>
    </Box>
  )
}

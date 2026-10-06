'use client'

import { useTranslations } from 'next-intl'

import {
  Box,
  Button,
  Container,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack
} from '@mui/material'

import {
  ContactFormFields,
  FormRequirements,
  LegalText,
  useContactForm
} from '@shared/Forms'

import { useDialog } from 'providers/DialogProvider'
import useBreakpoints from 'hooks/useBreakpoints'

import { DialogCloseButton } from '../components'
import { BaseResponsiveDialog } from '..'

const dialogName = 'contact'

type ContactUsDialogOptions = {
  // Presence of a listing turns the lead into a property enquiry.
  mlsNumber?: string
  // FUB tags for the lead this dialog's form produces (e.g. Consult + agent name).
  tags?: string[]
  message?: string
}

// The dialog owns the form element so the submit can sit in DialogActions and still
// read the form's submitting state.
export const ContactUsDialog = () => {
  const { hideDialog, getOptions } =
    useDialog<ContactUsDialogOptions>(dialogName)
  const { mlsNumber, tags, message } = getOptions()
  const t = useTranslations('Dialogs.Contact')
  const { mobile } = useBreakpoints()

  const {
    control,
    handleSubmit,
    isSubmitting,
    requirements,
    t: forms
  } = useContactForm({ mlsNumber, message, tags, onSend: hideDialog })

  return (
    <BaseResponsiveDialog name={dialogName}>
      <DialogCloseButton onClose={hideDialog} />
      <DialogTitle>
        {mlsNumber ? t('requestInfoTitle') : t('contactTitle')}
      </DialogTitle>

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
      >
        <FormRequirements requirements={requirements}>
          <DialogContent>
            <Container
              disableGutters
              sx={{ pt: { md: 1 }, maxWidth: { md: 'sm' } }}
            >
              <ContactFormFields control={control} labels />
            </Container>
          </DialogContent>

          <DialogActions>
            <Stack
              spacing={{ xs: 2, sm: 4 }}
              direction={mobile ? 'column' : 'row'}
              justifyContent="center"
              alignItems="center"
              width="100%"
            >
              <LegalText />

              <Button
                type="submit"
                size="large"
                variant="contained"
                fullWidth={mobile}
                loading={isSubmitting}
                sx={{ flexShrink: 0 }}
              >
                {forms('submitButton')}
              </Button>
            </Stack>
          </DialogActions>
        </FormRequirements>
      </Box>
    </BaseResponsiveDialog>
  )
}

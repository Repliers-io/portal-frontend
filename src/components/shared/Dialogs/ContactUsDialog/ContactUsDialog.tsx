import React from 'react'

import { DialogTitle } from '@mui/material'

import { DialogCloseButton } from '../components'
import { BaseResponsiveDialog } from '..'

import { ContactUsForm } from '.'

const dialogName = 'contact'

type ContactUsDialogProps = {
  onClose: () => void
  mode?: 'contactUs' | 'requestInfo'
  mlsNumber?: string
}

const ContactUsDialog = ({
  onClose,
  mode = 'contactUs',
  mlsNumber
}: ContactUsDialogProps) => {
  return (
    <BaseResponsiveDialog name={dialogName}>
      <DialogCloseButton onClose={onClose} />
      <DialogTitle>
        {mode === 'contactUs' ? 'Contact us' : 'Request info'}
      </DialogTitle>

      <ContactUsForm
        mode={mode}
        mlsNumber={mlsNumber}
        onSend={() => onClose()}
      />
    </BaseResponsiveDialog>
  )
}

export default ContactUsDialog

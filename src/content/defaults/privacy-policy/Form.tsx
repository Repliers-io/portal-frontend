'use client'

import React from 'react'

import { Container } from '@mui/material'

import { ContactUsForm } from '@shared/Dialogs/ContactUsDialog'

const Form = () => {
  return (
    <Container
      maxWidth="sm"
      disableGutters
      sx={{
        '& h2': { fontSize: '2rem', px: 0 },
        '& > div': { px: 0 },
        '& input, & textarea': {
          bgcolor: 'common.white',
          borderRadius: 2
        },
        '& .MuiDialogActions-root': { bgcolor: 'background.default' }
      }}
    >
      <ContactUsForm />
    </Container>
  )
}

export default Form

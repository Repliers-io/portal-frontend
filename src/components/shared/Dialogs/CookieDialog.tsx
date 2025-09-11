import React, { useEffect } from 'react'
import Link from 'next/link'

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material'

import routes from '@configs/routes'
import { cookieKey } from '@configs/storage'

import { useDialog } from 'providers/DialogProvider'

import { BaseResponsiveDialog } from '.'

const dialogName = 'cookie'

const CookieDialog = () => {
  const { showDialog, hideDialog } = useDialog(dialogName)

  const handleAccept = () => {
    localStorage.setItem(cookieKey, 'true')
    hideDialog()
  }

  useEffect(() => {
    const cookieAccepted = !!localStorage.getItem(cookieKey)
    if (!cookieAccepted) showDialog()
  }, [])

  return (
    <BaseResponsiveDialog name={dialogName}>
      <DialogTitle>Cookie Consent</DialogTitle>
      <DialogContent
        sx={{
          textAlign: 'center',
          '& a': { textDecoration: 'underline' }
        }}
      >
        By continuing to search or by clicking “Accept”, you agree to the
        storing of cookies to enhance your site experience and for analytical
        purposes. To learn more about how we use the cookies, please see our{' '}
        <Link href={routes.cookies} target="_blank">
          cookies policy
        </Link>
        .
      </DialogContent>
      <DialogActions>
        <Button variant="contained" size="large" onClick={handleAccept}>
          Accept and Close
        </Button>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}

export default CookieDialog

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material'

import routes from '@configs/routes'
import storageConfig from '@configs/storage'

import { useDialog } from 'providers/DialogProvider'

import { BaseResponsiveDialog } from '.'

const dialogName = 'cookie'

const { cookieKey } = storageConfig

export const CookieDialog = () => {
  const { showDialog, hideDialog } = useDialog(dialogName)
  const t = useTranslations('Dialogs')

  const handleAccept = () => {
    localStorage.setItem(cookieKey, 'true')
    hideDialog()
  }

  useEffect(() => {
    const cookieAccepted = !!localStorage.getItem(cookieKey)
    if (!cookieAccepted) showDialog()
  }, [])

  return (
    <BaseResponsiveDialog name={dialogName} labelledBy="cookie-title" centered>
      <DialogTitle id="cookie-title">{t('Cookie.title')}</DialogTitle>
      <DialogContent
        sx={{
          textAlign: 'center',
          '& a': { textDecoration: 'underline' }
        }}
      >
        {t.rich('Cookie.consent', {
          link: (chunks) => (
            <Link href={routes.cookies} target="_blank">
              {chunks}
            </Link>
          )
        })}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          size="large"
          onClick={handleAccept}
          data-testid="cookie-accept"
        >
          {t('Cookie.accept')}
        </Button>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}

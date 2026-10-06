import { useTranslations } from 'next-intl'

import { DialogTitle } from '@mui/material'

import { useDialog } from 'providers/DialogProvider'

import { BaseResponsiveDialog } from '..'

import { ProfileForm } from '.'

const dialogName = 'profile'

export const ProfileDialog = () => {
  const { hideDialog } = useDialog(dialogName)
  const t = useTranslations('Dialogs')

  return (
    <BaseResponsiveDialog name={dialogName} maxWidth={720}>
      <DialogTitle>{t('Profile.title')}</DialogTitle>
      <ProfileForm onSubmit={hideDialog} onCancel={hideDialog} />
    </BaseResponsiveDialog>
  )
}

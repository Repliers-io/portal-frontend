import { DialogTitle } from '@mui/material'

import { useDialog } from 'providers/DialogProvider'

import { BaseResponsiveDialog } from '..'

import { ProfileForm } from '.'

const dialogName = 'profile'

const ProfileDialog = () => {
  const { hideDialog } = useDialog(dialogName)

  return (
    <BaseResponsiveDialog name={dialogName} maxWidth={720}>
      <DialogTitle>Edit Profile</DialogTitle>
      <ProfileForm onSubmit={hideDialog} onCancel={hideDialog} />
    </BaseResponsiveDialog>
  )
}

export default ProfileDialog

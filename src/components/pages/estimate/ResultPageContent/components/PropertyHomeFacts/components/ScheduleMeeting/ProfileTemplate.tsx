import React from 'react'

import { Link, Skeleton, Stack, Typography } from '@mui/material'

import { PhoneLink, ProfileAvatar } from 'components/atoms'

export type ProfileDetails = {
  fname: string
  lname: string
  avatar?: string | null
  email: string
  phone: string
}

type ProfileTemplateProps = {
  profile: ProfileDetails | null
  size?: number
  loading?: boolean
}

const ProfileTemplate: React.FC<ProfileTemplateProps> = ({
  profile,
  size = 68,
  loading = false
}) => {
  if (loading || !profile) {
    return (
      <>
        <Skeleton variant="circular" width={size} height={size} />

        <Stack spacing={1}>
          <Stack direction="column">
            <Skeleton variant="text" sx={{ width: 150, height: 20 }} />
            <Skeleton variant="text" sx={{ width: 110, height: 20 }} />
            <Skeleton variant="text" sx={{ width: 90, height: 20 }} />
          </Stack>
        </Stack>
      </>
    )
  }

  const { fname, lname, avatar, email, phone } = profile
  const fullName = `${fname || ''} ${lname || ''}`

  return (
    <>
      <ProfileAvatar name={fullName} size={size} avatar={avatar} />

      <Stack spacing={1}>
        <Stack direction="column">
          <Typography variant="h4">{fullName}</Typography>
          {email && (
            <Typography variant="body2" color="text.secondary">
              <Link href={`mailto:${email}`} underline="hover">
                {email}
              </Link>
            </Typography>
          )}
          {phone && (
            <Typography variant="body2" color="text.secondary">
              <PhoneLink phone={phone} />
            </Typography>
          )}
        </Stack>
      </Stack>
    </>
  )
}

export default ProfileTemplate

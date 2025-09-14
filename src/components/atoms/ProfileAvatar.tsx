import React, { useMemo } from 'react'

import {
  Avatar,
  type AvatarProps,
  type SxProps,
  type Theme
} from '@mui/material'

function stringToColor(string: string) {
  let i
  let hash = 0
  let color = '#'

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  /* eslint-enable no-bitwise */
  return color
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

interface ProfileAvatarProps extends Omit<AvatarProps, 'sx'> {
  name: string
  avatar?: string | null
  size?: number
  sx?: SxProps<Theme>
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  avatar,
  size = 40,
  sx,
  ...rest
}) => {
  const nameInitials = useMemo(() => getInitials(name), [name])
  const backgroundColor = useMemo(() => stringToColor(name), [name])

  const scale = size * 0.4 // 40% of size

  const baseStyles: SxProps<Theme> = useMemo(
    () => ({
      width: size,
      height: size,
      bgcolor: backgroundColor,
      border: 1,
      borderColor: 'divider',
      boxSizing: 'border-box',
      ...(avatar ? {} : { fontSize: scale }),
      ...(sx || {})
    }),
    [avatar, backgroundColor, size, sx]
  )

  return (
    <Avatar src={avatar || undefined} alt={name} sx={baseStyles} {...rest}>
      {avatar ? null : nameInitials}
    </Avatar>
  )
}

export default ProfileAvatar

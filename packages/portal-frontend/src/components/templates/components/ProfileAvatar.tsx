'use client'

import { Avatar, Skeleton } from '@mui/material'

import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

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

function stringAvatar(
  fname: string,
  lname: string,
  size: number,
  bgcolor: string | undefined,
  single: boolean
) {
  return {
    sx: {
      width: size,
      height: size,
      // single initial fits a smaller glyph; two get a touch of overflow
      fontSize: single ? size * 0.6 : size + size / 15,
      bgcolor: bgcolor ?? stringToColor(`${fname} ${lname}`)
    },
    // NOTE: accessing the first letters in the string in array-like manner
    children: single ? fname[0] : `${fname[0]}${lname[0]}`
  }
}

export const ProfileAvatar = ({
  size = 28,
  bgcolor,
  initials = 'full'
}: {
  size?: number
  /** Override the name-hashed background — e.g. a tenant brand colour. */
  bgcolor?: string
  /** 'single' shows one initial (smaller font); 'full' shows first + last. */
  initials?: 'single' | 'full'
}) => {
  const clientSide = useClientSide()
  const {
    profile: { fname, lname }
  } = useUser()

  return clientSide ? (
    <Avatar
      {...stringAvatar(
        fname || '',
        lname || '',
        size,
        bgcolor,
        initials === 'single'
      )}
    />
  ) : (
    <Skeleton variant="circular" width={size} height={size} />
  )
}

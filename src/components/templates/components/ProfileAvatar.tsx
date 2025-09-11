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

function stringAvatar(fname: string, lname: string, size = 28) {
  return {
    sx: {
      width: size,
      height: size,
      fontSize: size + size / 15, // add a bit of overflow for better visual
      bgcolor: stringToColor(`${fname} ${lname}`)
    },
    // NOTE: accessing the first letters in the string in array-like manner
    children: `${fname[0]}${lname[0]}`
  }
}

const ProfileAvatar = ({ size = 28 }) => {
  const clientSide = useClientSide()
  const {
    profile: { fname, lname }
  } = useUser()

  return clientSide ? (
    <Avatar {...stringAvatar(fname || '', lname || '', size)} />
  ) : (
    <Skeleton variant="circular" width={size} height={size} />
  )
}

export default ProfileAvatar

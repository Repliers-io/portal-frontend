'use client'

import { type SxProps } from '@mui/system'

import { FaceRetouchingNaturalIcon as AgentIcon } from '@configs/icons'

interface AgentAvatarProps {
  size?: number
  sx?: SxProps
}

const color1 = '#FFCB63'
// const color2 = '#63C0FF'
// const color3 = '#FF63DA'

export const AgentAvatar = ({ size = 32, sx }: AgentAvatarProps) => {
  return (
    <AgentIcon
      sx={{
        ...sx,
        fontSize: size,
        color: 'white',
        '& path:last-child': {
          fill: `${color1} !important`
        }
      }}
    />
  )
}

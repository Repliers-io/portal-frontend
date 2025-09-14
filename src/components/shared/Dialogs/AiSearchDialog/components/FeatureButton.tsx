import { type ReactNode } from 'react'

import { Button } from '@mui/material'

const TagButton = ({
  color,
  children,
  onClick
}: {
  color: string
  onClick?: (label: string) => void
  children: ReactNode
}) => (
  <Button
    variant="text"
    sx={{
      p: 0.3,
      my: 0.4,
      color,
      height: 32,
      minWidth: 0,
      fontWeight: 600,
      borderRadius: 0,
      borderBottom: `2px dashed ${color}`
    }}
    onClick={(e) => onClick?.((e.target as HTMLElement).innerText)}
  >
    {children}
  </Button>
)

export default TagButton

import React from 'react'

import { Typography, type TypographyProps } from '@mui/material'

interface SelectLabelProps extends TypographyProps {
  children: React.ReactNode
  disabled?: boolean
  [key: string]: any
}

const SelectLabel: React.FC<SelectLabelProps> = ({
  children,
  disabled,
  sx,
  ...props
}) => {
  return (
    <Typography
      pb={1}
      variant="body1"
      fontWeight={500}
      color={disabled ? 'text.disabled' : ''}
      sx={{
        whiteSpace: {
          xs: 'normal',
          md: 'nowrap'
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Typography>
  )
}

export default SelectLabel

'use client'

import React from 'react'

import { Button, type ButtonProps } from '@mui/material'

import { useDialogContext } from 'providers/DialogProvider'

interface SignInButtonProps extends Omit<ButtonProps, 'onClick'> {
  label?: string
}

export const SignInButton = ({
  label = 'Sign in',
  variant = 'contained',
  size = 'large',
  sx,
  ...rest
}: SignInButtonProps) => {
  const { showDialog } = useDialogContext()

  // Stop the click from reaching an enclosing card/drawer link — the button may
  // live inside a listing card that navigates to the PDP.
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    showDialog('auth')
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      sx={{ px: 5, minWidth: 200, ...sx }}
      {...rest}
    >
      {label}
    </Button>
  )
}

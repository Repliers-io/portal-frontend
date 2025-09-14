'use client'

import { useEffect } from 'react'

import { Box, Button, Container, Typography } from '@mui/material' // magic number

import { useDialog } from 'providers/DialogProvider'

import styles from './FadeIn.module.css'

export const headerHeight = 72

const AuthView = () => {
  const { showDialogInstantly, showDialog } = useDialog('auth')

  useEffect(() => {
    // show it without animation on first render
    showDialogInstantly()
  }, [])

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        className={styles.fadeIn}
        sx={{
          height: `calc(100vh - ${headerHeight}px)`
        }}
      >
        <Typography component="div">
          You need to{' '}
          <Button
            variant="text"
            sx={{
              mx: 1,
              fontWeight: 600
            }}
            onClick={showDialog}
          >
            Sign in
          </Button>{' '}
          to view this page.
        </Typography>
      </Box>
    </Container>
  )
}

export default AuthView
